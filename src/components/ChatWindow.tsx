// C:\Users\jules\Desktop\chain-pilot\src\components\ChatWindow.tsx
"use client"

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWindowProps {
  conversations: string[];
  activeConversation: string | null;
  setActiveConversation: (conversation: string | null) => void;
  setConversations: (conversations: string[]) => void;
  conversationMessages: Record<string, Message[]>;
  setConversationMessages: (messages: Record<string, Message[]>) => void;
}

export default function ChatWindow({ 
  conversations, 
  activeConversation, 
  setActiveConversation, 
  setConversations,
  conversationMessages,
  setConversationMessages,
}: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Get the current conversation's messages or an empty array if none exist
  const messages = activeConversation && conversationMessages[activeConversation] ? conversationMessages[activeConversation] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    console.log("Pending prompt updated:", pendingPrompt, "Pending command:", pendingCommand);
  }, [pendingPrompt, pendingCommand, messages, activeConversation]);

  const sendMessage = async () => {
    if (!input.trim() || !activeConversation) return;

    const userMessage: Message = { role: 'user', content: input };
    // Update messages for the current conversation
    setConversationMessages({
      ...conversationMessages,
      [activeConversation]: [...messages, userMessage],
    });
    setInput('');
    setLoading(true);

    try {
      let confirmValue = null;
      let commandToSend = input;

      if (pendingPrompt && pendingCommand) {
        confirmValue = input.toLowerCase() === 'yes' ? true : (input.toLowerCase() === 'no' ? false : null);
        commandToSend = pendingCommand;
        console.log("Using pending command:", pendingCommand, "Confirm value:", confirmValue);
      } else if (pendingPrompt) {
        confirmValue = input.toLowerCase() === 'yes' ? true : (input.toLowerCase() === 'no' ? false : null);
        console.log("Pending prompt without command, Confirm value:", confirmValue);
      }

      const payload = {
        command: commandToSend,
        confirm: confirmValue,
      };
      console.log("Sending payload:", payload);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Backend response:", data);

      if (data.status === "prompt") {
        setPendingPrompt(data.message);
        setPendingCommand(input);
        const promptMessage: Message = { role: 'assistant', content: data.message };
        setConversationMessages({
          ...conversationMessages,
          [activeConversation]: [...messages, userMessage, promptMessage],
        });
      } else {
        const botMessage: Message = {
          role: 'assistant',
          content: data.message || (data.status === "error" ? data.message : "An unexpected error occurred. Check console."),
        };
        setConversationMessages({
          ...conversationMessages,
          [activeConversation]: [...messages, userMessage, botMessage],
        });
        setPendingPrompt(null);
        setPendingCommand(null);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      const errorMessage: Message = { role: 'assistant', content: "Failed to connect to the backend. Please try again." };
      setConversationMessages({
        ...conversationMessages,
        [activeConversation]: [...messages, userMessage, errorMessage],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900 h-full">
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl p-3 rounded-lg ${msg.role === 'user' ? 'bg-[#F0D971] text-black' : 'bg-[#C8A2C8] text-white'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-gray-700 p-4">
        <textarea
          id="command-input"
          name="command"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          className="w-full p-2 bg-gray-800 text-white rounded resize-none focus:outline-none"
          placeholder={pendingPrompt ? "Please type 'yes' or 'no'" : "Type your command (e.g., send 0.1 tokens to 0x...)"}
          disabled={loading}
        />
        <div className="mt-2 text-right">
          <button
            onClick={sendMessage}
            disabled={loading}
            className={`px-4 py-2 rounded text-sm ${loading ? 'bg-[#ccc] cursor-not-allowed text-[#666]' : 'bg-[#F0D971] hover:opacity-90 text-black'}`}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}