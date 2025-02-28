import express from "express";
const app = express();

import dotenv from "dotenv";
dotenv.config();

import { connectDb } from "./database/db.js";
import cors from "cors";
import { Server } from "socket.io";


// using middlewares
app.use(express.json());
app.use(cors());

const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Server is working");
});

// app.use("/uploads", express.static("uploads"));

// importing routes
import userRoutes from "./routes/user.js";
import courseRoutes from "./routes/course.js";
import adminRoutes from "./routes/admin.js";
import forumRoutes from "./routes/forum.js";
import asssignmentRoutes from "./routes/assignment.js";
import submissionRoutes from "./routes/submission.js";
import messageRoutes from "./routes/message.js";
import resourceRoutes from "./routes/resources.js";


// using routes
app.use("/api", userRoutes);
app.use("/api", courseRoutes);
app.use("/api", adminRoutes);
app.use("/api", forumRoutes);
app.use("/api", asssignmentRoutes);
app.use("/api/", submissionRoutes);
app.use("/api", messageRoutes);
app.use("/api", resourceRoutes);

// WebSocket
import http from "http"; // ✅ Import thêm http
const server = http.createServer(app); // ✅ Tạo HTTP server từ app
const io = new Server(server, {
  cors: {
    origin: [process.env.frontendurl], // URL của client
    methods: ["GET", "POST"],
  },
});

// Lưu trữ thông tin kết nối của mỗi người dùng
const userSocketMap = {}; // Map chứa socketId của người dùng

// Hàm lấy socketId của người nhận
export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId] || [];
};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Lấy userId từ query params khi người dùng kết nối
  const userId = socket.handshake.query.userId;
  
  if (userId && userId !== 'undefined') {
    // Lưu socketId của userId vào userSocketMap
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = new Set();
    }
    userSocketMap[userId].add(socket.id);
  }

  // Emit danh sách người dùng online cho tất cả các client
  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  // Lắng nghe sự kiện ngắt kết nối
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    if (userId && userSocketMap[userId]) {
      userSocketMap[userId].delete(socket.id);

      // Xóa entry nếu không còn socketId nào cho userId
      if (userSocketMap[userId].size === 0) {
        delete userSocketMap[userId];
      }

      // Emit lại danh sách người dùng online
      io.emit('getOnlineUsers', Object.keys(userSocketMap));
    }
  });

  // Xử lý sự kiện gửi tin nhắn từ client
  socket.on('send_message', (messageData) => {
    const { receiverId, message } = messageData;
    const receiverSocketIds = getReceiverSocketId(receiverId);

    // Kiểm tra nếu người nhận có socketId
    if (receiverSocketIds.length > 0) {
      // Gửi tin nhắn đến tất cả các socketId của người nhận
      receiverSocketIds.forEach((receiverSocketId) => {
        io.to(receiverSocketId).emit('newMessage', messageData);
      });
    } else {
      console.log(`Receiver with ID ${receiverId} is not connected.`);
    }
  });
});

export { io };

server.listen(port, () => {
  console.log(`🚀 Server & WebSocket running on port ${port}`);
  connectDb();
});