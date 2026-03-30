"use client";
import React, { useState, useEffect } from "react";

export default function RobotMascot({ state = "idle" }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getStatusText = () => {
    switch (state) {
      case "idle": return "Hi! I'm NUSTBot 🤖";
      case "thinking": return "Scanning knowledge base... 🔍";
      case "happy": return "Found your answer! ✨";
      case "confused": return "Hmm, outside my scope 🤔";
      default: return "Hi! I'm NUSTBot 🤖";
    }
  };

  const eyeColor = state === "confused" ? "#ef4444" : state === "happy" ? "#22c55e" : "#00D2FF";
  const eyeHeight = state === "thinking" ? "5" : state === "happy" ? "15" : "18";
  const eyeY = state === "thinking" ? "90" : state === "happy" ? "82" : "86";

  const mouthPath = state === "happy" 
    ? "M 80 120 Q 100 135 120 120" 
    : state === "confused" 
      ? "M 85 125 Q 100 115 115 125" 
      : state === "thinking"
        ? "M 90 120 L 110 120"
        : "M 85 122 L 115 122"; // idle

  const antennaColor = state === "happy" ? "#22c55e" : state === "confused" ? "#ef4444" : "#00D2FF";

  if (!mounted) return null;

  return (
    <div className="flex flex-col items-center justify-center p-8 h-full w-full relative z-10 w-[400px]">
      <div className="mb-10 text-center animate-fade-in">
        <h2 className="text-4xl font-extrabold tracking-tight" style={{ color: "var(--nust-primary)" }}>
          NUST<span style={{ color: "var(--nust-accent)" }}>Bot</span>
        </h2>
        <p className="text-[11px] font-semibold tracking-[0.2em] mt-2 uppercase" style={{ color: "var(--text-secondary)" }}>
          Admissions Intelligence
        </p>
      </div>
      
      {/* Robot SVG Container */}
      <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center drop-shadow-2xl robot-float select-none">
        
        {/* Glow backdrop behind robot */}
        <div 
          className="absolute inset-0 rounded-full blur-3xl opacity-20"
          style={{ background: `radial-gradient(circle, ${antennaColor} 0%, transparent 70%)` }}
        />

        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* DEFINITIONS for Gradients & Filters */}
          <defs>
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--nust-primary)" />
              <stop offset="100%" stopColor="var(--nust-secondary)" />
            </linearGradient>
            
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="innerShadow">
              <feOffset dx="0" dy="4"/>
              <feGaussianBlur stdDeviation="4" result="offset-blur"/>
              <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
              <feFlood floodColor="black" floodOpacity="0.4" result="color"/>
              <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
              <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
            </filter>
          </defs>

          {/* ANTENNA */}
          <g>
            <rect x="96" y="20" width="8" height="30" fill="url(#bodyGrad)" rx="4"/>
            <circle 
              cx="100" cy="20" r="8" 
              fill={antennaColor} 
              className={state === "thinking" || state === "happy" ? "antenna-pulse" : ""}
              filter="url(#glow)"
            />
          </g>

          {/* HEAD / BODY BASE */}
          <rect 
            x="40" y="45" 
            width="120" height="100" 
            rx="50" 
            fill="url(#bodyGrad)" 
            stroke="var(--nust-primary)" 
            strokeWidth="4"
          />

          {/* EARS */}
          <rect x="25" y="80" width="20" height="35" rx="8" fill="url(#accentGrad)" />
          <rect x="155" y="80" width="20" height="35" rx="8" fill="url(#accentGrad)" />
          
          <rect x="20" y="90" width="10" height="15" rx="4" fill="#1e293b" />
          <rect x="170" y="90" width="10" height="15" rx="4" fill="#1e293b" />

          {/* FACE VISOR (SCREEN) */}
          <rect 
            x="50" y="65" 
            width="100" height="60" 
            rx="30" 
            fill="url(#screenGrad)" 
            filter="url(#innerShadow)"
          />
          
          {/* Glass glare effect on visor */}
          <path 
            d="M 55 90 A 25 25 0 0 1 145 90 Q 145 70 100 70 Q 55 70 55 90 Z" 
            fill="white" opacity="0.1" 
          />

          {/* EYES */}
          <g className={state === "idle" ? "robot-blink" : ""}>
            <rect 
              x="65" y={eyeY} 
              width="24" height={eyeHeight} 
              rx={state === "thinking" ? "2" : "12"} 
              fill={eyeColor} filter="url(#glow)" 
              style={{ transition: "all 0.3s ease" }}
            />
            <rect 
              x="111" y={eyeY} 
              width="24" height={eyeHeight} 
              rx={state === "thinking" ? "2" : "12"} 
              fill={eyeColor} filter="url(#glow)"
              style={{ transition: "all 0.3s ease" }}
            />
          </g>

          {/* MOUTH */}
          <path 
            d={mouthPath} 
            stroke={eyeColor} 
            strokeWidth="4" 
            strokeLinecap="round" 
            fill="none" 
            filter="url(#glow)"
            style={{ transition: "all 0.3s ease" }}
          />

          {/* LEFT FLOATING ARM */}
          <g className={state === "moving" ? "robot-arm-l" : "robot-float"} style={{ animationDelay: "0.5s" }}>
            <path d="M 30 130 Q 10 160 30 180" stroke="url(#bodyGrad)" strokeWidth="16" strokeLinecap="round" fill="none" />
            <circle cx="30" cy="180" r="14" fill="url(#accentGrad)" />
            {/* Claws */}
            <path d="M 23 188 L 18 200 M 37 188 L 42 200" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
          </g>

          {/* RIGHT FLOATING ARM */}
          <g className={state === "moving" ? "robot-arm-r" : "robot-float"} style={{ animationDelay: "1s" }}>
            <path d="M 170 130 Q 190 160 170 180" stroke="url(#bodyGrad)" strokeWidth="16" strokeLinecap="round" fill="none" />
            <circle cx="170" cy="180" r="14" fill="url(#accentGrad)" />
            {/* Claws */}
            <path d="M 163 188 L 158 200 M 177 188 L 182 200" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
          </g>

        </svg>
      </div>

      {/* Dynamic Status Pill */}
      <div className="mt-12">
        <div className="glass-pill px-6 py-2.5 text-sm font-bold shadow-lg animate-fade-in flex items-center justify-center border" style={{ color: "var(--text-primary)", borderColor: "var(--glass-border)" }}>
          {getStatusText()}
        </div>
      </div>
    </div>
  );
}
