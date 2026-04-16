"use client";
import React, { useState } from "react";
import { User, Bot, FileText, ExternalLink, Sparkles } from "lucide-react";

export default function ChatMessage({ message, isLatest }) {
  const isUser = message.role === "user";
  const isStreaming = isLatest && !message.content;

  return (
    <div
      className={`flex gap-4 animate-fade-in ${
        isUser ? "flex-row-reverse" : "flex-row"
      } relative group`}
      style={{ maxWidth: "85%", marginLeft: isUser ? "auto" : "0" }}
    >
      {/* Avatar Container */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center mt-1 shadow-lg border ${
          isUser ? "border-transparent" : "border-[var(--glass-border)]"
        }`}
        style={{
          background: isUser ? "var(--nust-primary)" : "var(--glass-bg)",
          backdropFilter: isUser ? "none" : "blur(12px)",
          color: isUser ? "white" : "var(--nust-primary)",
        }}
      >
        {isUser ? <User size={20} strokeWidth={2.5} /> : <Bot size={22} strokeWidth={2.5} />}
      </div>

      {/* Message Bubble */}
      <div className="flex flex-col gap-2 min-w-0 max-w-full">
        <div
          className={`px-5 py-4 text-[0.95rem] leading-relaxed shadow-lg relative ${
            isUser ? "text-white" : "glass-panel bg-white/60 dark:bg-black/40"
          }`}
          style={{
            background: isUser ? "var(--msg-user-bg)" : "var(--glass-bg)",
            color: isUser ? "var(--text-on-primary)" : "var(--text-primary)",
            borderBottomRightRadius: isUser ? "8px" : "24px",
            borderBottomLeftRadius: isUser ? "24px" : "8px",
            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",
            border: isUser ? "none" : "1px solid var(--glass-border)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {/* User message subtle glow */}
          {isUser && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-300 opacity-20 blur-xl -z-10 rounded-[24px]" />
          )}

          {isStreaming ? (
            <div className="typing-indicator flex items-center gap-1.5 py-1">
              <span />
              <span />
              <span />
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-a:text-[var(--nust-secondary)]">
              {message.content}
            </div>
          )}
        </div>

        {/* Citations & Confidence (bot only)
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-2 px-1 animate-fade-in opacity-80 group-hover:opacity-100 transition-opacity">
            <span
              className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1"
              style={{ color: "var(--nust-primary)" }}
            >
              <Sparkles size={10} /> Sources
            </span>
            {message.sources.map((src, i) => (
              <SourceTooltip key={i} source={src} />
            ))}
            {message.confidence !== null && (
              <ConfidenceBadge score={message.confidence} />
            )}
          </div>
        )} */}
      </div>
    </div>
  );
}

// Interactive Source Tooltip using Glassmorphism
function SourceTooltip({ source }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const isWeb = source.url && source.url !== "null";
  const name = source.name || "NUST Document";

  return (
    <div
      className="relative inline-block z-50"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs cursor-help transition-all duration-300 glass-pill hover:scale-105 border border-[var(--glass-border)] shadow-sm hover:shadow-md"
        style={{ color: "var(--nust-secondary)", background: "var(--glass-bg)" }}
      >
        {isWeb ? <ExternalLink size={12} strokeWidth={2.5} /> : <FileText size={12} strokeWidth={2.5} />}
        <span className="truncate max-w-[140px] font-semibold">{name}</span>
      </div>

      {showTooltip && (
        <div
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-4 rounded-2xl shadow-2xl animate-fade-in text-xs glass-panel border border-[var(--glass-border)]"
          style={{ background: "var(--glass-bg-hover)", color: "var(--text-primary)" }}
        >
          {/* Subtle top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-[var(--nust-accent)] blur-sm rounded-full" />
          
          <p className="font-bold mb-2 tracking-wide" style={{ color: "var(--nust-primary)" }}>{name}</p>
          <div className="text-[11px] font-medium leading-relaxed opacity-90" style={{ color: "var(--text-secondary)" }}>
            {source.snippet ? (
              <p className="line-clamp-4 italic border-l-2 border-[var(--nust-accent)] pl-2">"{source.snippet}"</p>
            ) : isWeb ? (
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--nust-primary)] flex items-center gap-1 font-bold">
                View Official Source <ExternalLink size={12} strokeWidth={3} />
              </a>
            ) : (
              <p>Uploaded internal document</p>
            )}
          </div>
          {/* Tooltip Arrow Layering */}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent drop-shadow-sm"
            style={{ borderTopColor: "var(--glass-border)" }}
          />
        </div>
      )}
    </div>
  );
}

function ConfidenceBadge({ score }) {
  let cls = "confidence-high";
  let label = "High Match";

  if (score < 60) {
    cls = "confidence-low";
    label = "Low Match";
  } else if (score < 80) {
    cls = "confidence-medium";
    label = "Good Match";
  }

  return (
    <div className={`confidence-badge ${cls} ml-auto shadow-sm tracking-wide`} title={label}>
      {score}% Trust
    </div>
  );
}
