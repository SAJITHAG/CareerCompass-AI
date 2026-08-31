import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.warn(
    "GEMINI_API_KEY is not set. AI-powered endpoints (chat, analysis) will fail until it is configured in .env"
  );
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Model pinned to gemini-3.5-flash (current GA flash-tier model as of
// August 2026). Earlier picks here — gemini-1.5-flash, then gemini-2.5-flash —
// were both since blocked for new API keys ahead of their shutdown dates.
// Gemini's flash-tier naming has moved fast; if this 404s again in the
// future, check https://ai.google.dev/gemini-api/docs/models for the
// current GA model id and swap the string below — nothing else needs to change.
export const geminiModel = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

export default genAI;
