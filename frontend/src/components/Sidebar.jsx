"use client";
import React, { useState } from "react";
import { MessageSquare, MessageSquarePlus, Clock, ExternalLink, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Sidebar({ conversations, activeId, onSelect, onNew, onDelete }) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div
        className="flex flex-col h-full glass-panel border-r-0 border-y-0"
        style={{ width: "70px", minWidth: "70px", borderLeft: "none" }}
      >
        <div className="flex flex-col items-center py-6 gap-6 flex-1">
          <button
            onClick={() => setCollapsed(false)}
            className="p-2.5 rounded-xl transition-all hover:bg-[var(--glass-bg-hover)]"
            style={{ color: "var(--text-primary)" }}
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
          
          <button
            onClick={onNew}
            className="p-3 rounded-2xl text-white transition-all shadow-lg hover:shadow-xl hover:scale-110 relative"
            style={{ backgroundImage: "linear-gradient(135deg, var(--nust-primary) 0%, var(--nust-accent) 100%)" }}
            title="New Chat"
          >
            <Sparkles size={20} />
            <span className="absolute -inset-1 rounded-2xl blur opacity-30 bg-gradient-to-br from-blue-400 to-cyan-300 pointer-events-none" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full glass-panel border-r-0 border-y-0"
      style={{
        width: "280px",
        minWidth: "280px",
        borderLeft: "none"
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--glass-border)]">
        <span
          className="text-sm font-bold tracking-widest uppercase flex items-center gap-2"
          style={{ color: "var(--text-primary)" }}
        >
          <div className="w-2 h-2 rounded-full" style={{ background: "var(--nust-primary)", boxShadow: "0 0 8px var(--nust-glow)" }} />
          NUSTBot
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-xl transition-all hover:bg-[var(--glass-bg-hover)]"
            style={{ color: "var(--text-tertiary)" }}
            title="Collapse"
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="px-5 py-6">
        <button
          onClick={onNew}
          className="w-full relative group "
          id="new-chat-button"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--nust-primary)] to-[var(--nust-accent)] rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
          <div className="relative flex items-center justify-center gap-2 px-4 py-3 bg-[var(--glass-bg-hover)] rounded-2xl font-semibold text-sm transition-all hover:bg-transparent text-[var(--nust-primary)] hover:text-white shadow-md">
            <MessageSquarePlus size={18} />
            <span>New Conversation</span>
          </div>
        </button>
      </div>

      {/* Recent Chats */}
      <div className="flex-1 overflow-y-auto px-3">
        <div className="flex items-center gap-2 mb-3 px-3">
          <Clock size={12} style={{ color: "var(--text-tertiary)" }} />
          <span
            className="text-[10px] uppercase font-bold tracking-[0.1em]"
            style={{ color: "var(--text-tertiary)" }}
          >
            Recent Chats
          </span>
        </div>

        {conversations.length === 0 ? (
          <p
            className="text-xs px-3 font-medium opacity-80"
            style={{ color: "var(--text-tertiary)" }}
          >
            No conversations yet. Start a new chat!
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-sm transition-all relative overflow-hidden group"
                style={{
                  background: activeId === c.id ? "var(--glass-bg-hover)" : "transparent",
                  color: activeId === c.id ? "var(--text-primary)" : "var(--text-secondary)",
                  fontWeight: activeId === c.id ? "600" : "500"
                }}
              >
                {activeId === c.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--nust-primary)] to-[var(--nust-accent)]" />
                )}
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare
                    size={14}
                    style={{ flexShrink: 0, color: activeId === c.id ? "var(--nust-primary)" : "currentColor" }}
                  />
                  <span className="truncate">
                    {c.title || new Date(c.timestamp).toLocaleString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Official Links Footer */}
      <div className="py-4 px-5 border-t border-[var(--glass-border)] bg-[var(--glass-bg)]">
        <span
          className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.1em] mb-3 px-1"
          style={{ color: "var(--text-tertiary)" }}
        >
          <ExternalLink size={12} /> Official Links
        </span>
        <div className="flex flex-col gap-1 text-xs font-medium">
          {[
            { label: "NUST Main Website", url: "https://nust.edu.pk" },
            { label: "UG Admissions Portal", url: "https://ugadmissions.nust.edu.pk/" },
            { label: "Fee Structure", url: "https://nust.edu.pk/admissions/fee-structure/" },
            { label: "Scholarships", url: "https://nust.edu.pk/admissions/scholarships/" },
            { label: "UG Programs", url: "https://nust.edu.pk/admissions/undergraduate-programmes/" },
            { label: "FAQs", url: "https://nust.edu.pk/admissions/frequently-asked-questions/" },
          ].map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-[var(--glass-bg-hover)] group"
              style={{ color: "var(--text-secondary)" }}
            >
              <span className="text-[var(--text-tertiary)] group-hover:text-[var(--nust-secondary)] transition-colors">
                <ExternalLink size={12} />
              </span>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
