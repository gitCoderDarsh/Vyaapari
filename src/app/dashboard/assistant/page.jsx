"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Edit, Plus, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Sidebar from "@/components/dashboard/Sidebar"

// Helper function to format AI responses with better structure
const formatMessage = (text) => {
  if (!text) return ''
  
  // Clean up the text first and split into lines
  const lines = text.trim().split('\n')
  const formattedLines = []
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim()
    
    // Skip empty lines at the beginning
    if (line === '' && formattedLines.length === 0) continue
    
    // Handle empty lines (spacing)
    if (line === '') {
      formattedLines.push('<div class="mb-3"></div>')
      continue
    }
    
    // Bold text
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    
    // Section headers (words ending with :)
    if (/^[A-Za-z\s]+:$/.test(line)) {
      formattedLines.push(`<div class="text-blue-400 font-semibold mt-4 mb-2 text-sm uppercase tracking-wide">${line}</div>`)
    }
    // Bullet points
    else if (/^[•·\-*]\s+/.test(line)) {
      const content = line.replace(/^[•·\-*]\s+/, '')
      formattedLines.push(`<div class="ml-4 mb-2 flex items-start"><span class="text-blue-400 mr-2 mt-1">•</span><span class="text-gray-300 flex-1">${content}</span></div>`)
    }
    // Numbered lists
    else if (/^\d+\.\s+/.test(line)) {
      const [, number, content] = line.match(/^(\d+\.)\s+(.+)$/)
      formattedLines.push(`<div class="ml-4 mb-2 flex items-start"><span class="text-blue-400 font-medium mr-2 min-w-[20px]">${number}</span><span class="text-gray-300 flex-1">${content}</span></div>`)
    }
    // Regular text
    else {
      formattedLines.push(`<div class="mb-1">${line}</div>`)
    }
  }
  
  let result = formattedLines.join('')
  
  // Apply additional formatting
  result = result
    // Currency amounts
    .replace(/₹([\d,]+)/g, '<span class="text-green-400 font-medium">₹$1</span>')
    // Numbers and percentages
    .replace(/\b(\d+%)\b/g, '<span class="text-yellow-400 font-medium">$1</span>')
    // Action words
    .replace(/\b(Action|TODO|Next|Immediate|Priority|Recommend|Consider)\b/gi, '<span class="text-orange-400 font-medium">$1</span>')
  
  return result
}
import MobileHeader from "@/components/dashboard/MobileHeader"
import LogoutModal from "@/components/dashboard/LogoutModal"
import styles from './assistant.module.css'

export default function AssistantPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const textareaRef = useRef(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("Assistant")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Add custom scrollbar styles
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #4b5563;
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #6b7280;
      }
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #4b5563 transparent;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])
  
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

  // Load chat sessions from database
  useEffect(() => {
    const loadChatSessions = async () => {
      if (!session?.user) return

      try {
        const response = await fetch('/api/chat')
        if (response.ok) {
          const data = await response.json()
          const dbChats = data.chatSessions || []
          
          if (dbChats.length > 0) {
            // Convert DB format to component format
            const formattedChats = dbChats.map(chat => ({
              id: chat.id,
              name: chat.name,
              messages: chat.messages.map(msg => ({
                role: msg.role,
                content: msg.content
              }))
            }))
            setChats(formattedChats)
            setActiveChat(dbChats[0].id)
          } else {
            // Create default chat sessions if none exist
            await createDefaultChats()
          }
        }
      } catch (error) {
        console.error('Error loading chat sessions:', error)
        // Fall back to default chats
        await createDefaultChats()
      }
    }

    loadChatSessions()
  }, [session])

  // Create default chat sessions
  const createDefaultChats = async () => {
    try {
      // Create "Inventory Help" chat
      const inventoryResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Inventory Help' })
      })

      // Create "Product Questions" chat  
      const productResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Product Questions' })
      })

      if (inventoryResponse.ok && productResponse.ok) {
        const inventoryChat = await inventoryResponse.json()
        const productChat = await productResponse.json()

        // Add welcome messages
        await addWelcomeMessage(inventoryChat.chatSession.id, "**Welcome to your AI Business Assistant!** 🤖\n\nI'm powered by Google Gemini and can help you with:\n\n• **Inventory Analysis** - Get insights on stock levels and trends\n• **Business Strategy** - Pricing recommendations and growth advice\n• **Product Questions** - Detailed analysis of your product portfolio\n• **Action Items** - Concrete steps to improve your business\n\nI have access to your current inventory data to provide **personalized recommendations**. What would you like to explore today?")
        
        await addWelcomeMessage(productChat.chatSession.id, "**Product Analysis & Strategy** 📊\n\nI can help you with:\n\n1. **Pricing Analysis** - Optimize your product prices\n2. **Inventory Trends** - Identify fast-moving vs slow-moving items\n3. **Stock Management** - Get alerts for low stock items\n4. **Market Positioning** - Strategic advice for your products\n\nAsk me anything about your business or specific products!")

        // Set the formatted chats
        setChats([
          { id: inventoryChat.chatSession.id, name: 'Inventory Help', messages: [{ role: 'assistant', content: "**Welcome to your AI Business Assistant!** 🤖\n\nI'm powered by Google Gemini and can help you with:\n\n• **Inventory Analysis** - Get insights on stock levels and trends\n• **Business Strategy** - Pricing recommendations and growth advice\n• **Product Questions** - Detailed analysis of your product portfolio\n• **Action Items** - Concrete steps to improve your business\n\nI have access to your current inventory data to provide **personalized recommendations**. What would you like to explore today?" }] },
          { id: productChat.chatSession.id, name: 'Product Questions', messages: [{ role: 'assistant', content: "**Product Analysis & Strategy** 📊\n\nI can help you with:\n\n1. **Pricing Analysis** - Optimize your product prices\n2. **Inventory Trends** - Identify fast-moving vs slow-moving items\n3. **Stock Management** - Get alerts for low stock items\n4. **Market Positioning** - Strategic advice for your products\n\nAsk me anything about your business or specific products!" }] }
        ])
        setActiveChat(inventoryChat.chatSession.id)
      }
    } catch (error) {
      console.error('Error creating default chats:', error)
    }
  }

  // Helper to add welcome message to chat
  const addWelcomeMessage = async (chatSessionId, content) => {
    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatSessionId,
          role: 'assistant',
          content
        })
      })
    } catch (error) {
      console.error('Error adding welcome message:', error)
    }
  }
  
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
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

  const createNewChat = async () => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `Chat ${chats.length + 1}` })
      })

      if (response.ok) {
        const { chatSession } = await response.json()
        
        // Add welcome message
        const welcomeContent = "**Hello! I'm your AI Business Assistant** 🚀\n\nKey Capabilities:\n\n• **Inventory Analysis** - Real-time insights from your data\n• **Strategic Advice** - Business growth recommendations\n• **Problem Solving** - Quick answers to operational questions\n\nWhat can I help you with today?"
        
        await fetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatSessionId: chatSession.id,
            role: 'assistant',
            content: welcomeContent
          })
        })

        const newChat = {
          id: chatSession.id,
          name: chatSession.name,
          messages: [{ role: "assistant", content: welcomeContent }]
        }
        
        setChats([...chats, newChat])
        setActiveChat(chatSession.id)
      }
    } catch (error) {
      console.error('Error creating new chat:', error)
    }
  }

  // Auto-resize textarea function
  const autoResizeTextarea = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px' // Max height of ~5 lines
    }
  }

  // Handle textarea input change
  const handleTextareaChange = (e) => {
    setNewMessage(e.target.value)
    autoResizeTextarea()
  }

  // Handle key events for textarea
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isLoading && newMessage.trim()) {
        sendMessage()
      }
    }
  }

  // Auto-resize on mount and when content changes
  useEffect(() => {
    autoResizeTextarea()
  }, [newMessage])

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return

    const userMessage = { role: "user", content: newMessage }
    
    // Optimistically update UI
    const updatedChats = chats.map((chat) => {
      if (chat.id === activeChat) {
        return {
          ...chat,
          messages: [...chat.messages, userMessage],
        }
      }
      return chat
    })
    setChats(updatedChats)
    setNewMessage("")
    setIsLoading(true)

    try {
      // Save user message to database
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatSessionId: activeChat,
          role: 'user',
          content: newMessage
        })
      })

      // Fetch current inventory data for AI context
      const inventoryResponse = await fetch('/api/inventory')
      let inventoryData = {
        totalItems: 0,
        totalValue: 0,
        lowStockItems: 0,
        items: []
      }

      if (inventoryResponse.ok) {
        const inventoryResult = await inventoryResponse.json()
        inventoryData = {
          totalItems: inventoryResult.totalItems || 0,
          totalValue: inventoryResult.totalValue || 0,
          lowStockItems: inventoryResult.items?.filter(item => item.stockQuantity < 5).length || 0,
          items: inventoryResult.items || []
        }
      }

      // Call the AI API with real inventory context
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'business-assistant',
          prompt: newMessage,
          data: {
            context: {
              totalItems: inventoryData.totalItems,
              totalValue: inventoryData.totalValue,
              lowStockItems: inventoryData.lowStockItems
            },
            inventoryItems: inventoryData.items
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response')
      }

      const aiResponse = data.text || data.response || 'Sorry, I couldn\'t process your request.'
      const aiMessage = { role: "assistant", content: aiResponse }

      // Save AI message to database
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatSessionId: activeChat,
          role: 'assistant',
          content: aiResponse
        })
      })

      // Update UI with AI response
      const responseChats = updatedChats.map((chat) => {
        if (chat.id === activeChat) {
          return {
            ...chat,
            messages: [...chat.messages, aiMessage],
          }
        }
        return chat
      })
      setChats(responseChats)

    } catch (error) {
      console.error('Error sending message:', error)
      
      const errorMessage = { 
        role: "assistant", 
        content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.' 
      }

      const errorChats = updatedChats.map((chat) => {
        if (chat.id === activeChat) {
          return {
            ...chat,
            messages: [...chat.messages, errorMessage],
          }
        }
        return chat
      })
      setChats(errorChats)
    } finally {
      setIsLoading(false)
    }
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
        <div className={cn(
          "flex-1 overflow-y-auto p-4 space-y-4 bg-black custom-scrollbar",
          styles.chatContainer
        )}>
          {currentChat?.messages.map((message, index) => (
            <div key={index} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start", styles.messageSlideIn)}>
              <div
                className={cn(
                  "px-4 py-3 rounded-lg",
                  message.role === "user" 
                    ? `text-white max-w-xs lg:max-w-md ${styles.userMessage}` 
                    : `text-gray-100 max-w-md lg:max-w-lg ${styles.assistantMessage}`,
                )}
              >
                {message.role === "assistant" ? (
                  <div 
                    className="text-gray-200 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: formatMessage(message.content) 
                    }} 
                  />
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-gray-700 bg-black">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className={cn(
                  "w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400",
                  "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
                  "rounded-md px-3 py-2 resize-none min-h-[40px] max-h-[120px]",
                  "leading-5 text-sm transition-all duration-200 custom-scrollbar",
                  styles.chatInput
                )}
                rows={1}
              />
            </div>
            <Button 
              onClick={sendMessage} 
              disabled={isLoading || !newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed h-[40px]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
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
