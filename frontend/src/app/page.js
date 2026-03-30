"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatPanel from "../components/ChatPanel";
import ChatInput from "../components/ChatInput";
import RobotMascot from "../components/RobotMascot";
import { useChat } from "../hooks/useChat";
import { useSpeechToText } from "../hooks/useSpeechToText";
import { loadConversations, saveConversation, deleteConversation, generateId } from "../lib/chatStorage";

export default function Home() {
  const [conversations, setConversations] = useState([]);
  const [activeConvoId, setActiveConvoId] = useState(null);
  
  const { messages, isLoading, status, sendMessage, stopGeneration, clearMessages, loadMessages } = useChat();
  const speechToText = useSpeechToText();

  // Load conversations on mount
  useEffect(() => {
    const loaded = loadConversations();
    setConversations(loaded);
    
    // Pick the most recent conversation if none is active
    if (loaded.length > 0 && !activeConvoId) {
      handleSelectConvo(loaded[0].id);
    } else if (loaded.length === 0) {
      handleNewChat();
    }
  }, []);

  // Save conversation whenever messages change
  useEffect(() => {
    if (messages.length > 0 && activeConvoId) {
      saveConversation({
        id: activeConvoId,
        messages: messages,
        title: messages[0]?.content?.slice(0, 30) || "New Chat",
        timestamp: Date.now(),
      });
      setConversations(loadConversations());
    }
  }, [messages, activeConvoId]);

  const handleNewChat = () => {
    const newId = generateId();
    const loaded = loadConversations();
    setConversations(loaded);
    setActiveConvoId(newId);
    clearMessages();
  };

  const handleSelectConvo = (id) => {
    setActiveConvoId(id);
    const loaded = loadConversations();
    const convo = loaded.find((c) => c.id === id);
    if (convo) {
      loadMessages(convo.messages);
    }
  };

  const handleDeleteConvo = (id) => {
    deleteConversation(id);
    const loaded = loadConversations();
    setConversations(loaded);
    
    if (activeConvoId === id) {
      if (loaded.length > 0) {
        handleSelectConvo(loaded[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  const handleSend = async (query) => {
    await sendMessage(query);
  };

  // Determine robot state based on API status
  const robotState = isLoading 
    ? status === "thinking" || status === "searching" ? "thinking" : "idle"
    : messages.length > 0 && messages[messages.length - 1].role === "assistant" 
      ? (messages[messages.length - 1].content.includes("I cannot answer") ? "confused" : "happy")
      : "idle";

  return (
    <main className="flex h-screen w-full overflow-hidden flex-row bg-transparent relative">
      {/* ── Outer Premium Glass Panel Container ── */}
      <div className="absolute inset-4 lg:inset-8 flex flex-row glass-panel rounded-3xl overflow-hidden border border-[var(--glass-border)] shadow-2xl">
        
        {/* ── 1. Extreme Left Sidebar ── */}
        <div className="flex-shrink-0 z-20 h-full">
          <Sidebar
            conversations={conversations}
            activeId={activeConvoId}
            onSelect={handleSelectConvo}
            onNew={handleNewChat}
            onDelete={handleDeleteConvo}
          />
        </div>

        {/* ── Main Content Area ── */}
        <div className="flex flex-1 flex-row min-w-0 h-full relative z-10">
          
          {/* ── 2. Mascot Column (Hidden on tablets/mobile) ── */}
          <div className="hidden lg:flex flex-col items-center justify-center flex-shrink-0 h-full w-[400px] border-r border-[var(--glass-border)] relative">
            <RobotMascot state={robotState} />
          </div>

          {/* ── 3. Chat Area (Fills remaining space) ── */}
          <div className="flex flex-col flex-1 min-w-0 h-full relative bg-transparent">
            {/* Ambient inner glow behind chat */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[var(--glass-bg)] opacity-30 pointer-events-none" />
            
            <ChatPanel
              messages={messages}
              isLoading={isLoading}
              status={status}
              onSend={handleSend}
            />
            <div className="p-4 md:p-6 mb-2">
              <ChatInput
                onSend={handleSend}
                isLoading={isLoading}
                onStop={stopGeneration}
                speechToText={speechToText}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
