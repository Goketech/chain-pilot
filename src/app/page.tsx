// C:\Users\jules\Desktop\chain-pilot\src\app\page.tsx
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
      [initialChatTime]: [{
        role: 'assistant',
        content: "👋 Hello! I’m ChainPilot, your blockchain assistant.\n"
               + "🧠 Supported actions: send tokens, schedule transfers, cancel tasks, stake, withdraw, unstake, "
               + "check portfolio, show staking rewards, create token, deploy nft, mint nft, register basename.\n"
               + "💬 What would you like me to do?"
      }],
    });
  }, []); // Run only once on mount

  const handleNewChat = () => {
    const newChatTime = new Date().toLocaleTimeString();
    setConversations((prev) => [...prev, newChatTime]);
    setActiveConversation(newChatTime);
    setConversationMessages((prev) => ({
      ...prev,
      [newChatTime]: [{
        role: 'assistant',
        content: "👋 Hello! I’m ChainPilot, your blockchain assistant.\n"
               + "🧠 Supported actions: send tokens, schedule transfers, cancel tasks, stake, withdraw, unstake, "
               + "check portfolio, show staking rewards, create token, deploy nft, mint nft, register basename.\n"
               + "💬 What would you like me to do?"
      }],
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