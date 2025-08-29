"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Edit, Plus, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Sidebar from "@/components/dashboard/Sidebar"
import MobileHeader from "@/components/dashboard/MobileHeader"
import LogoutModal from "@/components/dashboard/LogoutModal"
import styles from './assistant.module.css'

export default function AssistantPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("Assistant")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  
  // Handle sidebar collapse animation when entering Assistant page
  useEffect(() => {
    // Check if we're navigating from another page
    const isNavigatingToAssistant = sessionStorage.getItem('navigatingToAssistant')
    
    if (isNavigatingToAssistant) {
      // Coming from another page - show transition
      sessionStorage.removeItem('navigatingToAssistant')
      // Start expanded and then collapse to show the transition
      setIsSidebarCollapsed(false)
      const timer = setTimeout(() => {
        setIsSidebarCollapsed(true)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      // Direct load or refresh - start collapsed
      setIsSidebarCollapsed(true)
    }
  }, [])
  
  const [chats, setChats] = useState([
    {
      id: "1",
      name: "Inventory Help",
      messages: [{ role: "assistant", content: "How can I help you with your inventory today?" }],
    },
    {
      id: "2",
      name: "Product Questions",
      messages: [{ role: "assistant", content: "I'm here to answer any product-related questions." }],
    },
  ])
  const [activeChat, setActiveChat] = useState("1")
  const [newMessage, setNewMessage] = useState("")

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return // Still loading
    if (!session) {
      router.push("/auth")
    }
  }, [session, status, router])

  const navItems = [
    { name: "Inventory", icon: "Package", active: false },
    { name: "Assistant", icon: "Bot", active: true },
    { name: "Profile", icon: "User", active: false },
  ]

  const handleNavClick = (itemName) => {
    if (itemName === "Logout") {
      setShowLogoutModal(true)
    } else if (itemName === "Inventory") {
      // Expand sidebar with animation before navigating
      setIsSidebarCollapsed(false)
      setTimeout(() => {
        router.push("/dashboard/inventory")
      }, 320) // Wait for animation to complete
    } else if (itemName === "Assistant") {
      // Already on Assistant page
      setIsSidebarCollapsed(true)
    } else if (itemName === "Profile") {
      // Expand sidebar with animation before navigating
      setIsSidebarCollapsed(false)
      setTimeout(() => {
        router.push("/dashboard/profile")
      }, 320) // Wait for animation to complete
    }
  }

  const handleLogout = () => {
    setShowLogoutModal(false)
    // Add logout logic here
    router.push("/auth")
  }

  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      name: `Chat ${chats.length + 1}`,
      messages: [{ role: "assistant", content: "Hello! How can I assist you today?" }],
    }
    setChats([...chats, newChat])
    setActiveChat(newChat.id)
  }

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const updatedChats = chats.map((chat) => {
      if (chat.id === activeChat) {
        return {
          ...chat,
          messages: [...chat.messages, { role: "user", content: newMessage }],
        }
      }
      return chat
    })
    setChats(updatedChats)
    setNewMessage("")

    // Simulate assistant response
    setTimeout(() => {
      const responseChats = updatedChats.map((chat) => {
        if (chat.id === activeChat) {
          return {
            ...chat,
            messages: [
              ...chat.messages,
              { role: "assistant", content: "I understand your question. Let me help you with that." },
            ],
          }
        }
        return chat
      })
      setChats(responseChats)
    }, 1000)
  }

  const currentChat = chats.find((chat) => chat.id === activeChat)

  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Desktop Sidebar - Dynamic collapse based on state */}
      <Sidebar
        navItems={navItems}
        activeTab={activeTab}
        handleNavClick={handleNavClick}
        setShowLogoutModal={setShowLogoutModal}
        isCollapsed={isSidebarCollapsed}
      />

      {/* Mobile Header */}
      <MobileHeader
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        navItems={navItems}
        activeTab={activeTab}
        handleNavClick={handleNavClick}
        setShowLogoutModal={setShowLogoutModal}
      />

      {/* Chat Sessions Sidebar - Positioned dynamically based on main sidebar state */}
      <div className={cn(
        "hidden md:block fixed top-0 h-screen w-64 bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300",
        isSidebarCollapsed ? "left-16" : "left-64",
        styles.chatSidebar
      )}>
        <div className={cn("p-4 border-b border-gray-700", styles.chatHeader)}>
          <h2 className="font-bold text-white">Chat Sessions</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-2">
            {chats.map((chat) => (
              <div key={chat.id} className="group relative">
                <button
                  onClick={() => setActiveChat(chat.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg",
                    styles.chatSessionItem,
                    activeChat === chat.id && styles.active
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{chat.name}</span>
                    <Edit className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-2 border-t border-gray-700">
          <Button
            onClick={createNewChat}
            className={cn("w-full bg-gray-700 hover:bg-gray-600 text-white", styles.newChatButton)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
      </div>

      {/* Main Content Area - Dynamically adjusted margin */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isSidebarCollapsed ? "ml-80" : "ml-128" // ml-16 + ml-64 = ml-80 (collapsed) OR ml-64 + ml-64 = ml-128 (expanded)
      )}>
        {/* Chat Header */}
        <div className={cn("p-4 border-b border-gray-700 bg-black", styles.chatHeader)}>
          <h2 className="text-xl font-semibold text-white">{currentChat?.name}</h2>
        </div>

        {/* Chat Messages */}
        <div className={cn("flex-1 overflow-y-auto p-4 space-y-4 bg-black", styles.chatContainer)}>
          {currentChat?.messages.map((message, index) => (
            <div key={index} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start", styles.messageSlideIn)}>
              <div
                className={cn(
                  "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                  message.role === "user" 
                    ? `text-white ${styles.userMessage}` 
                    : `text-gray-100 ${styles.assistantMessage}`,
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-gray-700 bg-black">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className={cn("flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500", styles.chatInput)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button 
              onClick={sendMessage} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      <LogoutModal
        showLogoutModal={showLogoutModal}
        setShowLogoutModal={setShowLogoutModal}
        onLogout={handleLogout}
      />
    </div>
  )
}
