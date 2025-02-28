import express from "express";
import { getMessages, sendMessage, getConversations, markMessagesAsRead } from "../controllers/message.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

// Route lấy tin nhắn giữa hai người
router.get("/rec/:id", isAuth, getMessages);

// Route gửi tin nhắn cho người nhận
router.post("/send/:id", isAuth, sendMessage);

// Route lấy tất cả các cuộc hội thoại của người dùng
router.get("/conversations", isAuth, getConversations);

// Route đánh dấu tin nhắn là đã đọc trong một cuộc hội thoại
router.put("/markRead/:conversationId", isAuth, markMessagesAsRead);

export default router;
