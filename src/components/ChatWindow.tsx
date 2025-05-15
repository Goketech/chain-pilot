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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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
      // Send command to the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/command`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          command: input,
          confirm: input.toLowerCase().includes("cancel") ? true : undefined,
        }),
      });

      const data = await response.json();

      // Add backend response to the chat
      const botMessage: Message = {
        role: 'assistant',
        content: data.message || "An error occurred.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: "Failed to connect to the backend. Please try again.",
      };
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
          <div
            key={idx}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xl p-3 rounded-lg ${
                msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-700 p-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          className="w-full p-2 bg-gray-800 text-white rounded resize-none focus:outline-none"
          placeholder="Type your command (e.g., send 0.1 tokens to 0x...)"
          disabled={loading}
        />
        <div className="mt-2 text-right">
          <button
            onClick={sendMessage}
            disabled={loading}
            className={`px-4 py-2 rounded text-sm ${
              loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}