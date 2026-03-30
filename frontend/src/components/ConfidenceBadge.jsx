"use client";
import { ShieldCheck, TrendingUp } from "lucide-react";

export default function ConfidenceBadge({ score }) {
  if (score === null || score === undefined) return null;

  const rounded = Math.round(score);
  let className = "confidence-badge ";
  if (rounded >= 70) className += "confidence-high";
  else if (rounded >= 40) className += "confidence-medium";
  else className += "confidence-low";

  return (
    <span className={className} title={`Model confidence: ${rounded}%`}>
      <TrendingUp size={12} />
      {rounded}% Match
    </span>
  );
}
