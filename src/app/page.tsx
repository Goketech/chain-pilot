"use client"
import { useState, useEffect } from 'react'
import Sidebar from '@/components/SideBar'
import ChatWindow from '@/components/ChatWindow'

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<string[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Record<string, { role: 'user' | 'assistant'; content: string }[]>>({});

  useEffect(() => {
    // Initialize with a default conversation on app load
    const initialChatTime = new Date().toLocaleTimeString();
    setConversations([initialChatTime]);
    setActiveConversation(initialChatTime);
    setConversationMessages({
      [initialChatTime]: [], // Start with an empty message list; ChatWindow will fetch the initial message
    });
  }, []); // Run only once on mount

  const handleNewChat = () => {
    const newChatTime = new Date().toLocaleTimeString();
    setConversations((prev) => [...prev, newChatTime]);
    setActiveConversation(newChatTime);
    setConversationMessages((prev) => ({
      ...prev,
      [newChatTime]: [], // Start with an empty message list; ChatWindow will fetch the initial message
    }));
  };

  const handleSelectConversation = (conversation: string) => {
    setActiveConversation(conversation);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        onNewChat={handleNewChat}
        activeConversation={activeConversation}
        onSelectConversation={handleSelectConversation}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Mobile Menu Button */}
        <div className="md:hidden p-4 bg-gray-900 border-b border-gray-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-black bg-[#F0D971] px-3 py-1 rounded"
          >
            ☰ Menu
          </button>
        </div>
        <ChatWindow 
          conversations={conversations}
          activeConversation={activeConversation}
          setActiveConversation={setActiveConversation}
          setConversations={setConversations}
          conversationMessages={conversationMessages}
          setConversationMessages={setConversationMessages}
        />
      </div>
    </div>
  )
}