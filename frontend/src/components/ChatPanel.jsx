"use client";
import React, { useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import { GraduationCap, DollarSign, Award, Calendar, Sparkles } from "lucide-react";

const QUICK_STARTERS = [
  { label: "How to apply?", query: "How do I apply for undergraduate admissions?", icon: GraduationCap },
  { label: "Fee structure", query: "What is the fee structure for regular students?", icon: DollarSign },
  { label: "Scholarships", query: "What scholarships and financial aid are available?", icon: Award },
  { label: "Entry test info", query: "Tell me about the NET (NUST Entry Test)", icon: Calendar },
  { label: "CS admission", query: "What are the requirements for Computer Science?", icon: GraduationCap },
];

export default function ChatPanel({ messages, isLoading, status, onSend }) {
  const bottomRef = useRef(null);
  const isEmpty = messages.length === 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  return (
    <div className="flex-1 overflow-y-auto px-5 py-8 md:px-10 relative z-10 scroll-smooth">
      {isEmpty ? (
        /* ── Welcome Screen (Premium) ── */
        <div className="flex flex-col items-center justify-center h-full animate-fade-in relative pt-16 pb-32">
          
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-40 rounded-full animate-pulse-glow" />
            <div className="relative glass-panel w-20 h-20 rounded-[2rem] flex items-center justify-center border border-white/40 shadow-2xl">
              <GraduationCap size={40} className="text-[var(--nust-primary)]" strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="text-4xl font-extrabold mb-3 tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-tertiary)]">
            Welcome to NUST<span className="text-[var(--nust-accent)]">Bot</span>
          </h1>
          <p className="text-base font-medium mb-12 text-center max-w-xl leading-relaxed opacity-80" style={{ color: "var(--text-secondary)" }}>
            Your state-of-the-art AI admissions assistant. Ask me anything about NUST programs, fees, scholarships, and the complete application process.
          </p>

          {/* Quick Starters (Glass Pills) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl px-4">
            {QUICK_STARTERS.map((item, i) => (
              <button
                key={i}
                onClick={() => onSend(item.query)}
                className="flex items-center gap-4 px-5 py-4 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl rounded-2xl group glass-panel border border-[var(--glass-border)]"
                style={{ color: "var(--text-primary)" }}
                id={`quick-starter-${i}`}
              >
                <div className="p-2 rounded-xl bg-white/50 dark:bg-black/20 group-hover:scale-110 transition-transform shadow-sm">
                  <item.icon size={20} className="text-[var(--nust-primary)]" />
                </div>
                <span className="font-semibold text-[0.95rem] opacity-90 group-hover:opacity-100">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ── Messages ── */
        <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-6">
          
          {status && (
            <div className="flex items-center gap-3 glass-pill px-6 py-3 text-xs font-bold self-center animate-fade-in shadow-lg mb-4 mt-2" style={{ color: "var(--text-primary)" }}>
              <Sparkles size={14} className="text-[var(--nust-secondary)] animate-pulse" />
              {status === "thinking" && "Expanding query architecture..."}
              {status === "searching" && "Scanning knowledge base..."}
              {status === "answering" && "Generating intelligent response..."}
            </div>
          )}

          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
              message={msg}
              isLatest={i === messages.length - 1 && isLoading}
            />
          ))}
          <div ref={bottomRef} className="h-4" />
        </div>
      )}
    </div>
  );
}
