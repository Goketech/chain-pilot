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
        content: "👋 Hello! I’m ChainPilot, your blockchain assistant on Base mainnet.\n" +
                 "🧠 I can help you with the following actions:\n" +
                 "- check_executor_permissions: Verify the Executor contract address.\n" +
                 "- check_scheduler_permissions: Check the Scheduler contract's executer address.\n" +
                 "- send_tokens <amount> to <address>: Send ETH (e.g., 'send_tokens 0.1 to 0x...'). Requires executer permissions.\n" +
                 "- schedule_transfers <amount> to <address> at <timestamp>: Schedule an ETH transfer (e.g., 'schedule_transfers 0.1 to 0x... at 1696118400'). Anyone can schedule, but only the executer can execute.\n" +
                 "- list_tasks: View all scheduled tasks.\n" +
                 "- cancel_tasks <task_id>: Cancel a scheduled task (use 'list_tasks' to find task IDs).\n" +
                 "- help: Show this message.\n" +
                 "💬 What would you like me to do? Just type your command below!"
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
        content: "👋 Hello! I’m ChainPilot, your blockchain assistant on Base mainnet.\n" +
                 "🧠 I can help you with the following actions:\n" +
                 "- check_executor_permissions: Verify the Executor contract address.\n" +
                 "- check_scheduler_permissions: Check the Scheduler contract's executer address.\n" +
                 "- send_tokens <amount> to <address>: Send ETH (e.g., 'send_tokens 0.1 to 0x...'). Requires executer permissions.\n" +
                 "- schedule_transfers <amount> to <address> at <timestamp>: Schedule an ETH transfer (e.g., 'schedule_transfers 0.1 to 0x... at 1696118400'). Anyone can schedule, but only the executer can execute.\n" +
                 "- list_tasks: View all scheduled tasks.\n" +
                 "- cancel_tasks <task_id>: Cancel a scheduled task (use 'list_tasks' to find task IDs).\n" +
                 "- help: Show this message.\n" +
                 "💬 What would you like me to do? Just type your command below!"
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