interface SidebarProps {
    isOpen: boolean
    onClose: () => void
  }
  
  export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    return (
      <>
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 bg-gray-800 p-4 flex-col space-y-4">
          <h2 className="text-xl font-bold">ChainPilot</h2>
          <button className="bg-green-600 px-4 py-2 rounded hover:bg-green-500">
            + New Chat
          </button>
          <div className="flex-1 overflow-y-auto mt-4 space-y-2">
            <p className="bg-gray-700 p-2 rounded">Conversation 1</p>
            <p className="bg-gray-700 p-2 rounded">Conversation 2</p>
          </div>
        </aside>
  
        {/* Mobile Sidebar */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black opacity-50"
              onClick={onClose}
            />
            {/* Sidebar Panel */}
            <aside className="relative z-10 w-64 bg-gray-800 p-4 flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">ChatGPT UI</h2>
                <button
                  onClick={onClose}
                  className="text-white hover:text-red-400"
                >
                  ✕
                </button>
              </div>
              <button className="bg-green-600 px-4 py-2 rounded hover:bg-green-500">
                + New Chat
              </button>
              <div className="flex-1 overflow-y-auto mt-4 space-y-2">
                <p className="bg-gray-700 p-2 rounded">Conversation 1</p>
                <p className="bg-gray-700 p-2 rounded">Conversation 2</p>
              </div>
            </aside>
          </div>
        )}
      </>
    )
  }
  