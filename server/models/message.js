import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      message: String,
      read: { type: Boolean, default: false }, // Trạng thái đọc tin nhắn
    },
    { timestamps: true }
  );
  
  const Message = mongoose.model("Message", messageSchema);
  
  export default Message;
  