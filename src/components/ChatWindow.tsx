"use client"

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Initial introduction
    const introMessage: Message = {
      role: 'assistant',
      content: "Hello! I’m ChainPilot, your blockchain assistant. How can I help you today?",
    };
    setMessages((prev) => [...prev, introMessage]);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Ensure confirm is null if not explicitly true/false
      const confirmValue = pendingPrompt ? (input.toLowerCase() === 'yes') : null;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: input,
          confirm: confirmValue,
        }),
      });

      const data = await response.json();
      console.log("Backend response:", data); // Debug

      if (data.status === "prompt") {
        setPendingPrompt(data.message);
        const promptMessage: Message = { role: 'assistant', content: data.message };
        setMessages((prev) => [...prev, promptMessage]);
      } else {
        const botMessage: Message = {
          role: 'assistant',
          content: data.message || (data.status === "error" ? data.message : "An unexpected error occurred. Check console."),
        };
        setMessages((prev) => [...prev, botMessage]);
        setPendingPrompt(null);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      const errorMessage: Message = { role: 'assistant', content: "Failed to connect to the backend. Please try again." };
      setMessages((prev) => [...prev, errorMessage]);
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
    <div className="flex flex-col flex-1 bg-gray-900 h-full">
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'}`}>
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
            className={`px-4 py-2 rounded text-sm ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}