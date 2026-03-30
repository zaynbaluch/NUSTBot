"use client";
import { useState, useCallback, useRef } from "react";

/**
 * Custom hook for SSE streaming chat with the FastAPI backend.
 * Manages messages, loading states, robot animation state, sources, and confidence.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [robotState, setRobotState] = useState("idle"); // idle | thinking | happy | confused
  const [status, setStatus] = useState(null); // thinking | searching | answering
  const abortRef = useRef(null);

  const sendMessage = useCallback(async (userMessage) => {
    if (!userMessage.trim() || isLoading) return;

    // Add user message
    const userMsg = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setRobotState("thinking");
    setStatus("thinking");

    // Prepare bot message placeholder
    const botMsg = {
      role: "assistant",
      content: "",
      sources: [],
      confidence: null,
    };

    setMessages((prev) => [...prev, botMsg]);

    try {
      const abortController = new AbortController();
      abortRef.current = abortController;

      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === "[DONE]") continue;

          try {
            const event = JSON.parse(jsonStr);

            switch (event.type) {
              case "status":
                setStatus(event.data);
                if (event.data === "thinking") setRobotState("thinking");
                else if (event.data === "searching") setRobotState("thinking");
                else if (event.data === "answering") setRobotState("thinking");
                break;

              case "token":
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === "assistant") {
                    updated[updated.length - 1] = {
                      ...last,
                      content: last.content + event.data,
                    };
                  }
                  return updated;
                });
                break;

              case "sources":
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === "assistant") {
                    updated[updated.length - 1] = {
                      ...last,
                      sources: event.data,
                    };
                  }
                  return updated;
                });
                break;

              case "confidence":
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === "assistant") {
                    updated[updated.length - 1] = {
                      ...last,
                      confidence: event.data,
                    };
                  }
                  return updated;
                });
                break;

              case "done":
                setRobotState("happy");
                setStatus(null);
                setTimeout(() => setRobotState("idle"), 3000);
                break;

              case "error":
                setRobotState("confused");
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === "assistant") {
                    updated[updated.length - 1] = {
                      ...last,
                      content: event.data,
                    };
                  }
                  return updated;
                });
                setTimeout(() => setRobotState("idle"), 4000);
                break;
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setRobotState("confused");
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === "assistant") {
            updated[updated.length - 1] = {
              ...last,
              content: "Sorry, I couldn't connect to the server. Please make sure the backend is running on port 8000.",
            };
          }
          return updated;
        });
        setTimeout(() => setRobotState("idle"), 4000);
      }
    } finally {
      setIsLoading(false);
      setStatus(null);
    }
  }, [isLoading, messages]);

  const stopGeneration = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsLoading(false);
    setRobotState("idle");
    setStatus(null);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setRobotState("idle");
    setStatus(null);
  }, []);

  const loadMessages = useCallback((msgs) => {
    setMessages(msgs || []);
  }, []);

  return {
    messages,
    isLoading,
    robotState,
    status,
    sendMessage,
    stopGeneration,
    clearMessages,
    loadMessages,
  };
}
