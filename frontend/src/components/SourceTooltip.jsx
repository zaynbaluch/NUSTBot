"use client";
import { FileText } from "lucide-react";

export default function SourceTooltip({ source }) {
  if (!source) return null;

  return (
    <span className="source-tooltip inline-block">
      <span
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs cursor-help transition-all hover:scale-105"
        style={{
          background: "var(--bg-tertiary)",
          color: "var(--text-link)",
          border: "1px solid var(--border-light)",
        }}
      >
        <FileText size={11} />
        {source.name}
        {source.page && <span className="opacity-60">(p.{source.page})</span>}
      </span>
      <span className="tooltip-content">
        <div className="font-semibold text-xs mb-1" style={{ color: "var(--text-primary)" }}>
          📄 {source.name} {source.page ? `— Page ${source.page}` : ""}
        </div>
        <div className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {source.snippet || "No preview available."}
        </div>
        {source.score !== undefined && (
          <div className="mt-2 text-xs opacity-60">
            Relevance Score: {(source.score * 100).toFixed(1)}%
          </div>
        )}
      </span>
    </span>
  );
}
