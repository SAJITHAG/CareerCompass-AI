import express from "express";
import { chat, getChatHistory, clearChatHistory, chatWithAttachment } from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";
import { uploadChatAttachment } from "../middleware/upload.js";

const router = express.Router();

router.post("/", protect, chat);
router.post("/attachment", protect, uploadChatAttachment, chatWithAttachment);
router.get("/history", protect, getChatHistory);
router.delete("/history", protect, clearChatHistory);

export default router;
