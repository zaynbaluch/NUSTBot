"use client";
import React, { useState, useRef } from "react";
import { Send, Square, Mic, MicOff } from "lucide-react";

export default function ChatInput({ onSend, isLoading, onStop, speechToText }) {
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  // Sync speechToText transcript with input
  React.useEffect(() => {
    if (speechToText?.transcript && speechToText.isListening) {
      setInput(speechToText.transcript);
    }
  }, [speechToText?.transcript, speechToText?.isListening]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (speechToText?.isListening) {
      speechToText.toggleListening();
    }

    onSend(input);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full relative z-20">
      <form
        onSubmit={handleSubmit}
        className="glass-pill flex items-center gap-3 px-5 py-3.5 mx-auto max-w-4xl"
        style={{
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.4)",
        }}
      >
        {/* Glow effect on hover */}
        <div className="absolute -inset-1 rounded-[32px] blur opacity-20 bg-gradient-to-r from-[var(--nust-primary)] to-[var(--nust-accent)] group-hover:opacity-40 transition pointer-events-none" />

        {/* Microphone */}
        {speechToText?.isSupported && (
          <button
            type="button"
            onClick={speechToText.toggleListening}
            className={`p-2.5 rounded-2xl transition-all duration-300 relative z-10 ${
              speechToText.isListening 
                ? "bg-red-500 text-white shadow-lg animate-pulse" 
                : "text-[var(--text-tertiary)] hover:bg-[var(--glass-bg-hover)]"
            }`}
            title={speechToText.isListening ? "Stop listening" : "Speak"}
            id="mic-button"
          >
            {speechToText.isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        )}

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            speechToText?.isListening
              ? "Listening..."
              : "Ask about NUST admissions, programs, fees..."
          }
          className="flex-1 bg-transparent border-none outline-none text-[0.95rem] font-medium placeholder:text-[var(--text-tertiary)] relative z-10"
          style={{ color: "var(--text-primary)" }}
          disabled={isLoading}
          id="chat-input"
        />

        {/* Send / Stop */}
        {isLoading ? (
          <button
            type="button"
            onClick={onStop}
            className="p-3 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-md relative z-10"
            title="Stop generating"
            id="stop-button"
          >
            <Square size={20} fill="currentColor" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-3 rounded-2xl transition-all shadow-md relative z-10 hover:shadow-xl hover:scale-105"
            style={{
              background: input.trim() ? "var(--nust-primary)" : "var(--glass-bg-hover)",
              color: input.trim() ? "#FFFFFF" : "var(--text-tertiary)",
              opacity: input.trim() ? 1 : 0.6,
            }}
            title="Send message"
            id="send-button"
          >
            <Send size={18} strokeWidth={2.5} className={input.trim() ? "translate-x-[2px] -translate-y-[2px]" : ""} />
          </button>
        )}
      </form>

      <p
        className="text-center text-xs mt-5 font-medium tracking-wide"
        style={{ color: "var(--text-tertiary)" }}
      >
        NUSTBot may occasionally provide inaccurate info. Verify important details on{" "}
        <a
          href="https://nust.edu.pk"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-[var(--nust-accent)] decoration-2 hover:text-[var(--text-primary)] transition-colors"
        >
          nust.edu.pk
        </a>
      </p>
    </div>
  );
}
