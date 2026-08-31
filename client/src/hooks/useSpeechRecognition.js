import { useCallback, useEffect, useRef, useState } from "react";

// Wraps the browser's native SpeechRecognition API (Chrome/Edge; Safari has
// partial support, Firefox doesn't support it at all) — no backend, no
// external dependency. Consumers should only show a mic button when
// `isSupported` is true, since there's no reasonable fallback UI otherwise.
export const useSpeechRecognition = ({ onResult, onError } = {}) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const SpeechRecognitionApi =
    typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
  const isSupported = Boolean(SpeechRecognitionApi);

  useEffect(() => {
    if (!isSupported) return;

    const recognition = new SpeechRecognitionApi();
    recognition.continuous = false; // stops automatically after a pause in speech
    recognition.interimResults = true; // stream partial text as the person talks
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      onResult?.(transcript);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      const message =
        event.error === "not-allowed" || event.error === "permission-denied"
          ? "Microphone access was denied. Allow microphone access to use voice input."
          : event.error === "no-speech"
          ? "Didn't catch that — try again."
          : "Voice input isn't available right now.";
      onError?.(message);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported]);

  const start = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      // start() throws if called while already running — safe to ignore.
    }
  }, [isListening]);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  return { isSupported, isListening, start, stop };
};
