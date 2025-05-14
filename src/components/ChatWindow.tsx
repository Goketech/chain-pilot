// C:\Users\jules\Desktop\chain-pilot\src\components\ChatWindow.tsx
"use client"

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ApiResponse {
  status: "success" | "error" | "prompt";
  message: string;
  tx_hash?: string;
  jobs?: { task_id: number; timestamp: number; to_address: string; amount: number; tx_hash: string }[];
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
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const messages = activeConversation && conversationMessages[activeConversation] 
    ? conversationMessages[activeConversation] 
    : [];

  useEffect(() => {
    if (!activeConversation && conversations.length === 0) {
      const newConversationId = `conv_${Date.now()}`;
      setConversations([newConversationId]);
      setActiveConversation(newConversationId);
      setConversationMessages({ [newConversationId]: [] });
    }
    // Fetch initial help message when a new conversation starts and messages are empty
    if (activeConversation && messages.length === 0) {
      setLoading(true);
      fetch(`https://chainpilot.onrender.com/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'help', confirm: null }),
      })
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return response.json() as Promise<ApiResponse>;
        })
        .then(data => {
          const initialMessage: Message = { role: 'assistant', content: data.message };
          setConversationMessages({
            ...conversationMessages,
            [activeConversation]: [initialMessage],
          });
        })
        .catch(error => {
          console.error('Error fetching initial message:', error);
          const errorMsg: Message = { 
            role: 'assistant', 
            content: `❌ Failed to load initial message. HTTP ${error.message.match(/status: (\d+)/)?.[1] || 'error'}. Please check the API status or try again later.` 
          };
          setConversationMessages({
            ...conversationMessages,
            [activeConversation]: [errorMsg],
          });
        })
        .finally(() => setLoading(false));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, activeConversation, conversations.length, setConversations, setActiveConversation, setConversationMessages]);

  const sendMessage = async () => {
    if (!input.trim() || !activeConversation) {
      console.warn("No input or active conversation selected.");
      return;
    }
    if (pendingPrompt && !['yes', 'no'].includes(input.toLowerCase().trim())) {
      setConversationMessages({
        ...conversationMessages,
        [activeConversation]: [...messages, { role: 'assistant', content: "Please type 'yes' or 'no'." }],
      });
      return;
    }

    const userMessage: Message = { role: 'user', content: input };
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

      const payload = { command: commandToSend, confirm: confirmValue };
      console.log("Sending payload:", payload, "Method: POST", "To:", process.env.NEXT_PUBLIC_API_URL);
      const response = await fetch('https://chainpilot.onrender.com/command', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }

      const data = await response.json() as ApiResponse;
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
      const errorMessage = error instanceof Error 
        ? `Failed to connect: ${error.message}. Check console for details.`
        : "An unexpected error occurred. Please contact support.";
      const errorMsg: Message = { role: 'assistant', content: errorMessage };
      setConversationMessages({
        ...conversationMessages,
        [activeConversation]: [...messages, userMessage, errorMsg],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' && commandHistory.length > 0) {
      e.preventDefault();
      const index = Math.min(historyIndex + 1, commandHistory.length - 1);
      setHistoryIndex(index);
      setInput(commandHistory[commandHistory.length - 1 - index] || '');
    } else if (e.key === 'ArrowDown' && historyIndex >= 0) {
      e.preventDefault();
      const index = Math.max(historyIndex - 1, -1);
      setHistoryIndex(index);
      setInput(index === -1 ? '' : commandHistory[commandHistory.length - 1 - index] || '');
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setCommandHistory([...commandHistory, input]);
      setHistoryIndex(-1);
      sendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900 h-full">
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" role="log" aria-live="polite">
        {loading && (
          <div className="flex justify-center p-2 text-gray-400">
            <span className="animate-pulse">Thinking...</span>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xl p-3 rounded-lg whitespace-pre-line ${
                msg.role === 'user' ? 'bg-[#F0D971] text-black' : 'bg-[#C8A2C8] text-white'
              }`}
            >
              {msg.content.split('\n').map((line, index) => {
                if (line.startsWith('- ')) {
                  return (
                    <div key={index} className="ml-4 flex items-start">
                      <span className="inline-block w-2 h-2 mr-2 bg-white rounded-full mt-1" />
                      <span>{line.substring(2)}</span>
                    </div>
                  );
                }
                return <div key={index}>{line}</div>;
              })}
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
          className="w-full p-2 bg-gray-800 text-white rounded resize-none focus:outline-none focus:ring-2 focus:ring-[#F0D971]"
          placeholder={pendingPrompt ? "Please type 'yes' or 'no'" : "Type your command (e.g., send 0.1 tokens to 0x...)"}
          disabled={loading}
          aria-label="Chat input"
          aria-live="polite"
        />
        <div className="mt-2 text-right">
          <button
            onClick={sendMessage}
            disabled={loading}
            className={`px-4 py-2 rounded text-sm ${loading ? 'bg-[#ccc] cursor-not-allowed text-[#666]' : 'bg-[#F0D971] hover:opacity-90 text-black'}`}
            aria-label="Send message"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}