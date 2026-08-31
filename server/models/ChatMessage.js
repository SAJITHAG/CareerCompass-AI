import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    // Which intent the chatService detected for this turn (career_match,
    // skill_gap, course_recommendation, roadmap, general) — stored on the
    // assistant message for later debugging/analytics, not shown in the UI.
    intent: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Fetching a user's recent history in order is the only real query pattern.
chatMessageSchema.index({ user: 1, createdAt: 1 });

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

export default ChatMessage;
