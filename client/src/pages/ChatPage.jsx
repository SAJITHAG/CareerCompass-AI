import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import Card from "../components/ui/Card";
import MarkdownMessage from "../components/ui/MarkdownMessage";
import { getCurrentUser } from "../services/authService";
import { sendChatMessage, sendChatAttachment, getChatHistory, clearChatHistory } from "../services/chatService";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

const SUGGESTED_PROMPTS = [
  "What career is suitable for me?",
  "What skills am I missing for Data Scientist?",
  "Recommend courses for learning Javascript.",
  "Create a roadmap for becoming a Full Stack Developer.",
];

const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "Hi! I'm CareerCompass AI. Ask me about careers, skill gaps, courses, or your learning roadmap — I'll answer using your actual profile and our course database.",
};

const bubbleBase = {
  maxWidth: "78%",
  padding: "12px 16px",
  borderRadius: "var(--radius-md)",
  fontSize: 14.5,
  lineHeight: 1.55,
  whiteSpace: "pre-wrap",
};

const ACCEPTED_ATTACHMENT_TYPES = "image/jpeg,image/png,image/webp,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain";
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024; // matches server-side limit

const ChatPage = () => {
  const navigate = useNavigate();
  const [studentProfile, setStudentProfile] = useState(null);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [clearing, setClearing] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const voiceBaseInputRef = useRef(""); // text already in the box when the mic is pressed, so speech appends rather than overwrites

  const { isSupported: voiceSupported, isListening, start: startListening, stop: stopListening } = useSpeechRecognition({
    onResult: (transcript) => {
      const base = voiceBaseInputRef.current;
      setInput(base ? `${base} ${transcript}` : transcript);
    },
    onError: (message) => setError(message),
  });

  useEffect(() => {
    getCurrentUser()
      .then((u) => setStudentProfile(u.profile))
      .catch(() => {});
  }, []);

  // Load any previously saved conversation. If the user has history, show
  // it (with the welcome message prepended for context); otherwise fall
  // back to just the welcome message.
  useEffect(() => {
    getChatHistory()
      .then((history) => {
        if (history && history.length > 0) {
          setMessages([WELCOME_MESSAGE, ...history.map((m) => ({ role: m.role, content: m.content }))]);
        }
      })
      .catch(() => {
        // History failing to load isn't fatal — chat still works, it just
        // starts fresh for this session.
      })
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if ((!text && !attachedFile) || sending) return;

    setError("");

    // Attachment path: send the file (+ optional caption) to the dedicated
    // endpoint, which sends it straight to Gemini's multimodal input for
    // images, or extracts text first for PDF/DOCX/TXT.
    if (attachedFile) {
      const fileToSend = attachedFile;
      const caption = text;
      setMessages((prev) => [
        ...prev,
        { role: "user", content: caption ? `${caption}\n\n📎 ${fileToSend.name}` : `📎 ${fileToSend.name}` },
      ]);
      setInput("");
      setAttachedFile(null);
      setSending(true);

      try {
        const historyForApi = messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));
        const result = await sendChatAttachment({
          file: fileToSend,
          message: caption,
          studentProfile: studentProfile || {},
          conversationHistory: historyForApi,
        });
        setMessages((prev) => [...prev, { role: "assistant", content: result.reply }]);
      } catch (err) {
        const message =
          err.response?.status === 503
            ? "The AI assistant is temporarily unavailable. Please try again shortly."
            : err.response?.data?.message || "Couldn't analyze that file. Please try again.";
        setError(message);
      } finally {
        setSending(false);
      }
      return;
    }

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      // Only send a short recent window — the backend re-derives everything
      // it needs from real data on each turn, history is just for tone/continuity.
      // The full conversation is separately persisted server-side on every turn.
      const historyForApi = nextMessages.slice(-8).map((m) => ({ role: m.role, content: m.content }));

      const result = await sendChatMessage({
        message: text,
        studentProfile: studentProfile || {},
        conversationHistory: historyForApi.slice(0, -1),
      });

      setMessages((prev) => [...prev, { role: "assistant", content: result.reply }]);
    } catch (err) {
      const message =
        err.response?.status === 503
          ? "The AI assistant is temporarily unavailable. Please try again shortly."
          : err.response?.data?.message || "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setSending(false);
    }
  };

  const handleAttachClick = () => fileInputRef.current?.click();

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      return;
    }
    setError("");
    voiceBaseInputRef.current = input.trim();
    startListening();
  };

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (file.size > MAX_ATTACHMENT_BYTES) {
      setError("That file is too large — please attach something under 5MB.");
      return;
    }
    setError("");
    setAttachedFile(file);
  };

  const handleClearHistory = async () => {
    if (clearing) return;
    setClearing(true);
    try {
      await clearChatHistory();
      setMessages([WELCOME_MESSAGE]);
    } catch {
      setError("Couldn't clear your chat history. Please try again.");
    } finally {
      setClearing(false);
    }
  };

  const hasProfile =
    studentProfile &&
    ((studentProfile.technicalSkills && studentProfile.technicalSkills.length > 0) ||
      (studentProfile.interests && studentProfile.interests.length > 0));

  return (
    <AppLayout>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 4 }}>AI Career Assistant</h1>
          <p style={{ color: "var(--color-text-muted)", marginBottom: 20 }}>
            Grounded in your profile and our real course database — never invented recommendations.
          </p>
        </div>
        {messages.length > 1 && (
          <button
            onClick={handleClearHistory}
            disabled={clearing}
            style={{
              background: "none",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--color-text-muted)",
              fontSize: 12.5,
              padding: "6px 12px",
              cursor: clearing ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {clearing ? "Clearing..." : "Clear history"}
          </button>
        )}
      </div>

      {!hasProfile && (
        <Card style={{ marginBottom: 16, maxWidth: 640, background: "rgba(79, 70, 229, 0.04)" }}>
          <p style={{ fontSize: 13.5 }}>
            You haven't completed your career assessment yet — I can still chat, but answers will be more useful
            once I know your skills.{" "}
            <button
              onClick={() => navigate("/assessment")}
              style={{ background: "none", border: "none", color: "var(--color-primary)", fontWeight: 600, cursor: "pointer", padding: 0 }}
            >
              Complete it now →
            </button>
          </p>
        </Card>
      )}

      <Card style={{ maxWidth: 720, padding: 0, display: "flex", flexDirection: "column", height: 560 }}>
        <div
          ref={scrollRef}
          style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 14 }}
        >
          {loadingHistory ? (
            <p style={{ color: "var(--color-text-muted)", fontSize: 13.5 }}>Loading your conversation...</p>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  ...bubbleBase,
                  background: m.role === "user" ? "var(--color-gradient)" : "var(--color-bg)",
                  color: m.role === "user" ? "#fff" : "var(--color-text)",
                  borderBottomRightRadius: m.role === "user" ? 4 : "var(--radius-md)",
                  borderBottomLeftRadius: m.role === "assistant" ? 4 : "var(--radius-md)",
                }}
              >
                {m.role === "assistant" ? <MarkdownMessage content={m.content} /> : m.content}
              </div>
            ))
          )}
          {sending && (
            <div style={{ alignSelf: "flex-start", ...bubbleBase, background: "var(--color-bg)", color: "var(--color-text-muted)" }}>
              Thinking...
            </div>
          )}
        </div>

        {!loadingHistory && messages.length <= 1 && (
          <div style={{ padding: "0 24px 16px", display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => handleSend(p)}
                style={{
                  fontSize: 12.5,
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface)",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {error && <p style={{ color: "var(--color-danger)", fontSize: 13, padding: "0 24px" }}>{error}</p>}

        {attachedFile && (
          <div style={{ padding: "0 24px 10px", display: "flex" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12.5,
                fontWeight: 500,
                color: "var(--color-text)",
                background: "rgba(124, 58, 237, 0.08)",
                border: "1px solid var(--color-border)",
                borderRadius: 999,
                padding: "5px 8px 5px 12px",
              }}
            >
              📎 {attachedFile.name}
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                aria-label="Remove attachment"
                style={{
                  background: "var(--color-border)",
                  border: "none",
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  fontSize: 12,
                  lineHeight: 1,
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: "flex", gap: 10, padding: 16, borderTop: "1px solid var(--color-border)" }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_ATTACHMENT_TYPES}
            onChange={handleFileSelected}
            style={{ display: "none" }}
          />
          <button
            type="button"
            onClick={handleAttachClick}
            title="Attach a photo or PDF"
            aria-label="Attach a photo or PDF"
            style={{
              width: 42,
              height: 42,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-sm)",
              border: "1.5px solid var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-text-muted)",
              fontSize: 20,
              fontWeight: 600,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            +
          </button>
          {voiceSupported && (
            <button
              type="button"
              onClick={handleVoiceToggle}
              title={isListening ? "Stop listening" : "Speak your message"}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
              aria-pressed={isListening}
              style={{
                width: 42,
                height: 42,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "var(--radius-sm)",
                border: isListening ? "1.5px solid var(--color-danger)" : "1.5px solid var(--color-border)",
                background: isListening ? "rgba(239, 68, 68, 0.08)" : "var(--color-surface)",
                color: isListening ? "var(--color-danger)" : "var(--color-text-muted)",
                fontSize: 17,
                cursor: "pointer",
                lineHeight: 1,
                animation: isListening ? "mic-pulse 1.4s ease-in-out infinite" : "none",
              }}
            >
              🎤
            </button>
          )}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={attachedFile ? "Add a caption (optional)..." : "Ask about careers, skills, courses, or a roadmap..."}
            style={{
              flex: 1,
              padding: "11px 14px",
              borderRadius: "var(--radius-sm)",
              border: "1.5px solid var(--color-border)",
              fontSize: 14,
            }}
          />
          <button
            type="submit"
            disabled={sending || (!input.trim() && !attachedFile)}
            style={{
              padding: "11px 22px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: "var(--color-gradient)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              cursor: sending || (!input.trim() && !attachedFile) ? "not-allowed" : "pointer",
              opacity: sending || (!input.trim() && !attachedFile) ? 0.6 : 1,
            }}
          >
            Send
          </button>
        </form>
      </Card>
    </AppLayout>
  );
};

export default ChatPage;
