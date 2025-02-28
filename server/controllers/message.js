import CryptoJS from "crypto-js";  // Import thư viện mã hóa
import Conversation from "../models/Conversation.js";
import Message from "../models/message.js";
import { getReceiverSocketId, io } from "../index.js";

// Khóa bảo mật cho mã hóa/giải mã
const secretKey = process.env.SECRET_KEY || "your-secret-key";  // Sử dụng biến môi trường cho khóa bảo mật

// Mã hóa tin nhắn
function encryptMessage(message) {
  return CryptoJS.AES.encrypt(message, secretKey).toString();  // Mã hóa tin nhắn
}

// Giải mã tin nhắn
function decryptMessage(encryptedMessage) {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);  // Giải mã tin nhắn
}

// Controller gửi tin nhắn
export const sendMessage = async (req, res) => {
	try {
	  const { message } = req.body;
	  const { id: receiverId } = req.params;
	  const senderId = req.user._id;
  
	  // Mã hóa tin nhắn trước khi lưu vào DB
	  const encryptedMessage = encryptMessage(message);
  
	  // Tìm cuộc hội thoại giữa người gửi và người nhận
	  let conversation = await Conversation.findOne({
		participants: { $all: [senderId, receiverId] },
	  });
  
	  if (!conversation) {
		// Nếu chưa có cuộc hội thoại, tạo mới
		conversation = await Conversation.create({
		  participants: [senderId, receiverId],
		});
	  }
  
	  // Tạo mới tin nhắn
	  const newMessage = new Message({
		senderId,
		receiverId,
		message: encryptedMessage,  // Lưu tin nhắn đã mã hóa
		read: false,  // Đánh dấu là chưa đọc
	  });
  
	  // Thêm tin nhắn vào cuộc hội thoại
	  conversation.messages.push(newMessage._id);
  
	  // Lưu tin nhắn và cuộc hội thoại
	  await Promise.all([conversation.save(), newMessage.save()]);

	  // Giải mã tin nhắn để gửi qua socket
	  newMessage.message = decryptMessage(newMessage.message);  // Giải mã tin nhắn trước khi gửi
  
	  // Thông báo qua socket.io cho người nhận nếu họ đang online
	  const receiverSocketId = getReceiverSocketId(receiverId);
	  if (receiverSocketId) {
		io.to(receiverSocketId).emit("newMessage", newMessage);
	  }
  
	  res.status(201).json(newMessage);  // Trả về tin nhắn đã gửi
	} catch (error) {
	  console.error("Error in sendMessage controller: ", error.message);
	  res.status(500).json({ error: "Internal server error" });
	}
};
  

// Controller lấy tin nhắn giữa 2 người
export const getMessages = async (req, res) => {
	try {
	  const { id: userToChatId } = req.params;
	  const senderId = req.user._id;
  
	  // Tìm cuộc hội thoại giữa người gửi và người nhận
	  const conversation = await Conversation.findOne({
		participants: { $all: [senderId, userToChatId] },
	  }).populate("messages");
  
	  if (!conversation) return res.status(200).json([]);  // Nếu không có cuộc hội thoại, trả về danh sách rỗng
  
	  // Giải mã tất cả tin nhắn trong cuộc hội thoại
	  const decryptedMessages = conversation.messages.map((msg) => {
		const originalMessage = decryptMessage(msg.message);  // Giải mã tin nhắn
		return { ...msg._doc, message: originalMessage };  // Trả về tin nhắn đã giải mã
	  });
  
	  res.status(200).json(decryptedMessages);  // Trả về tin nhắn đã giải mã
	} catch (error) {
	  console.error("Error in getMessages controller: ", error.message);
	  res.status(500).json({ error: "Internal server error" });
	}
};
  

// Controller đánh dấu tin nhắn là đã đọc
export const markMessagesAsRead = async (req, res) => {
	try {
	  const { conversationId } = req.params;
	  const userId = req.user._id;
  
	  // Tìm cuộc hội thoại
	  const conversation = await Conversation.findById(conversationId);
	  if (!conversation) {
		return res.status(404).json({ error: "Conversation not found" });
	  }
  
	  // Cập nhật trạng thái đã đọc cho tất cả tin nhắn chưa đọc
	  await Message.updateMany(
		{ _id: { $in: conversation.messages }, receiverId: userId, read: false },
		{ $set: { read: true } }
	  );
  
	  res.status(200).json({ message: "Messages marked as read" });
	} catch (error) {
	  console.error("Error in markMessagesAsRead controller: ", error.message);
	  res.status(500).json({ error: "Internal server error" });
	}
};
  

// Controller lấy tất cả các cuộc hội thoại
export const getConversations = async (req, res) => {
	try {
	  const userId = req.user._id;
  
	  // Tìm tất cả các cuộc hội thoại của người dùng
	  const conversations = await Conversation.find({
		participants: userId,
	  })
		.populate("participants", "name email")  // Chỉ lấy thông tin cần thiết
		.populate("messages", "message createdAt")  // Lấy tin nhắn và thời gian tạo
		.sort({ updatedAt: -1 });  // Sắp xếp theo thời gian cập nhật
  
	  res.status(200).json(conversations);  // Trả về danh sách cuộc hội thoại
	} catch (error) {
	  console.error("Error in getConversations: ", error.message);
	  res.status(500).json({ error: "Internal server error" });
	}
};
  
