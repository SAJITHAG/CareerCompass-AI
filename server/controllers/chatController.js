import { handleChatMessage } from "../services/chatService.js";
import ChatMessage from "../models/ChatMessage.js";
import { extractResumeText } from "../utils/resumeParser.js";
import { chatWithContext } from "../services/aiService.js";
import { isImageMimetype } from "../middleware/upload.js";

// POST /api/chat  (requires auth — history is saved per logged-in user)
// Body: { message: string, studentProfile?: object, conversationHistory?: array }
// conversationHistory is still accepted from the client as a short recent
// window for prompt continuity, but the source of truth for "saved history"
// is now the ChatMessage collection, written here on every turn.
export const chat = async (req, res, next) => {
  try {
    const { message, studentProfile, conversationHistory } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "A chat message is required." });
    }

    const trimmedMessage = message.trim();

    const result = await handleChatMessage({
      message: trimmedMessage,
      studentProfile: studentProfile || {},
      conversationHistory: conversationHistory || [],
    });

    // Persist both sides of this turn. Done after a successful AI reply so
    // a failed/unavailable AI call never leaves an orphaned user message
    // with no response in the saved history.
    await ChatMessage.insertMany([
      { user: req.user._id, role: "user", content: trimmedMessage },
      { user: req.user._id, role: "assistant", content: result.reply, intent: result.intent },
    ]);

    res.json({ success: true, data: result });
  } catch (err) {
    // AI service failures (missing key, empty response, network) get a
    // friendly message instead of a raw 500 wall of text.
    if (err.statusCode === 503) {
      return res.status(503).json({
        success: false,
        message: "The AI assistant is temporarily unavailable. Please try again shortly.",
      });
    }
    next(err);
  }
};

// GET /api/chat/history  (requires auth)
// Returns the logged-in user's saved conversation, oldest first, capped to
// a reasonable window so the page doesn't have to load an unbounded thread.
export const getChatHistory = async (req, res, next) => {
  try {
    const HISTORY_LIMIT = 100;

    const messages = await ChatMessage.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(HISTORY_LIMIT)
      .lean();

    messages.reverse(); // oldest first for display

    res.json({
      success: true,
      data: messages.map((m) => ({ role: m.role, content: m.content, createdAt: m.createdAt })),
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/chat/history  (requires auth)
// Lets a user clear their own saved conversation.
export const clearChatHistory = async (req, res, next) => {
  try {
    await ChatMessage.deleteMany({ user: req.user._id });
    res.json({ success: true, message: "Chat history cleared." });
  } catch (err) {
    next(err);
  }
};

// POST /api/chat/attachment  (requires auth, multipart file upload)
// Same "+" attach flow as the resume upload, but for the chat: a photo
// (certificate, screenshot, whiteboard, etc.) goes straight to Gemini's
// multimodal input; a PDF/DOCX/TXT gets its text extracted first (same
// extractor the resume path uses) and folded into the prompt. Either way
// it's answered in the same grounded style as a normal chat turn and saved
// to history like any other message.
export const chatWithAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file was attached." });
    }

    const message = (req.body.message || "").trim() || "Please look at this file and tell me what's useful for my career planning.";

    let studentProfile = {};
    let conversationHistory = [];
    try {
      studentProfile = req.body.studentProfile ? JSON.parse(req.body.studentProfile) : {};
    } catch {
      studentProfile = {};
    }
    try {
      conversationHistory = req.body.conversationHistory ? JSON.parse(req.body.conversationHistory) : [];
    } catch {
      conversationHistory = [];
    }

    let imagePart = null;
    let attachmentText = null;

    if (isImageMimetype(req.file.mimetype)) {
      imagePart = { inlineData: { data: req.file.buffer.toString("base64"), mimeType: req.file.mimetype } };
    } else {
      attachmentText = await extractResumeText(req.file.buffer, req.file.mimetype);
      if (!attachmentText || attachmentText.trim().length < 10) {
        return res.status(422).json({
          success: false,
          message: "Couldn't find readable text in that file. If it's a scanned/image-based PDF, try attaching it as a photo instead.",
        });
      }
      attachmentText = attachmentText.slice(0, 8000);
    }

    const reply = await chatWithContext({
      message,
      studentProfile,
      retrievedCareers: [],
      retrievedCourses: [],
      conversationHistory,
      attachmentText,
      imagePart,
    });

    await ChatMessage.insertMany([
      { user: req.user._id, role: "user", content: `${message}\n\n📎 Attached: ${req.file.originalname}` },
      { user: req.user._id, role: "assistant", content: reply, intent: "attachment" },
    ]);

    res.json({ success: true, data: { reply, intent: "attachment" } });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};
