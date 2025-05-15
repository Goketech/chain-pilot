"use client"
import { useState } from 'react'
import Sidebar from '@/components/SideBar'
import ChatWindow from '@/components/ChatWindow'

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Mobile Menu Button */}
        <div className="md:hidden p-4 bg-gray-900 border-b border-gray-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white bg-gray-700 px-3 py-1 rounded"
          >
            ☰ Menu
          </button>
        </div>
        <ChatWindow />
      </div>
    </div>
  )
}
