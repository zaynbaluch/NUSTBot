"use client";
import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const stored = localStorage.getItem("nust_theme") || "light";
    setTheme(stored);
    document.documentElement.setAttribute("data-theme", stored);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("nust_theme", next);
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-xl transition-all duration-300 hover:scale-110"
      style={{
        background: "var(--bg-tertiary)",
        color: "var(--text-secondary)",
        border: "1px solid var(--border-light)",
      }}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      id="theme-toggle"
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
