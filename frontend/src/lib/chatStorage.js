"use client";

/**
 * LocalStorage chat persistence helpers.
 */

const STORAGE_KEY = "nust_chatbot_history";

export function loadConversations() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveConversation(conversation) {
  if (typeof window === "undefined") return;
  const convos = loadConversations();
  const idx = convos.findIndex((c) => c.id === conversation.id);
  if (idx >= 0) {
    convos[idx] = conversation;
  } else {
    convos.unshift(conversation);
  }
  // Keep only last 50 conversations
  const trimmed = convos.slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function deleteConversation(id) {
  if (typeof window === "undefined") return;
  const convos = loadConversations().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convos));
}

export function clearAllConversations() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
