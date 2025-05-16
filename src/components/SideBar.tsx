// C:\Users\jules\Desktop\chain-pilot\src\components\SideBar.tsx
"use client"

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: string[] | undefined;
  onNewChat: () => void;
  activeConversation?: string | null;
  onSelectConversation: (conversation: string) => void;
}

export default function Sidebar({ 
  isOpen, 
  onClose, 
  conversations = [], 
  onNewChat, 
  activeConversation, 
  onSelectConversation 
}: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#C8A2C8] p-4 flex-col space-y-4">
        <h2 className="text-xl font-bold">ChainPilot</h2>
        <button 
          onClick={onNewChat}
          className="bg-[#F0D971] px-4 py-2 rounded hover:opacity-90"
        >
          + New Chat
        </button>
        <div className="flex-1 overflow-y-auto mt-4 space-y-2">
          {conversations.map((conv, index) => (
            <p
              key={index}
              onClick={() => onSelectConversation(conv)}
              className={`cursor-pointer bg-white text-black p-2 rounded ${activeConversation === conv ? 'bg-[#F0D971]' : ''}`}
            >
              {conv || `Conversation ${index + 1}`}
            </p>
          ))}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={onClose}
          />
          <aside className="relative z-10 w-64 bg-[#C8A2C8] p-4 flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">ChainPilot</h2>
              <button
                onClick={onClose}
                className="text-white hover:text-red-400"
              >
                ✕
              </button>
            </div>
            <button 
              onClick={onNewChat}
              className="bg-[#F0D971] text-black px-4 py-2 rounded hover:bg-green-500"
            >
              + New Chat
            </button>
            <div className="flex-1 overflow-y-auto mt-4 space-y-2">
              {conversations.map((conv, index) => (
                <p
                  key={index}
                  onClick={() => onSelectConversation(conv)}
                  className={`cursor-pointer bg-white text-black p-2 rounded ${activeConversation === conv ? 'bg-[#F0D971]' : ''}`}
                >
                  {conv || `Conversation ${index + 1}`}
                </p>
              ))}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}