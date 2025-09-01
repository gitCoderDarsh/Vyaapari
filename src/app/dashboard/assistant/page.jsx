"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Edit, Plus, Send, Loader2, MoreVertical, Trash2, Pencil } from "lucide-react"
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
  const chatContainerRef = useRef(null)
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
  const [showChatOptions, setShowChatOptions] = useState(null) // Which chat's options are showing
  const [isRenaming, setIsRenaming] = useState(null) // Which chat is being renamed
  const [renameValue, setRenameValue] = useState("") // Current rename input value
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null) // Which chat to delete

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return // Still loading
    if (!session) {
      router.push("/auth")
    }
  }, [session, status, router])

  // Auto-scroll to bottom when messages change or active chat changes
  useEffect(() => {
    const activeCurrentChat = chats.find((chat) => chat.id === activeChat)
    if (activeCurrentChat?.messages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(scrollToBottom, 100)
    }
  }, [chats, activeChat])

  const navItems = [
    { name: "Inventory", icon: "Package", active: false },
    { name: "Sales", icon: "Receipt", active: false },
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
    } else if (itemName === "Sales") {
      // Expand sidebar with animation before navigating
      setIsSidebarCollapsed(false)
      setTimeout(() => {
        router.push("/dashboard/sales")
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

  // Auto-scroll to bottom of chat container
  const scrollToBottom = () => {
    const chatContainer = chatContainerRef.current
    if (chatContainer) {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: 'smooth'
      })
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

  // Close chat options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the dropdown and not on the trigger button
      if (showChatOptions && !event.target.closest('.chat-options-container')) {
        setShowChatOptions(null)
      }
    }
    
    if (showChatOptions) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showChatOptions])

  // Handle chat rename
  const handleRenameChat = async (chatId, newName) => {
    if (!newName.trim()) return

    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      })

      if (response.ok) {
        // Update local state
        setChats(chats.map(chat => 
          chat.id === chatId 
            ? { ...chat, name: newName.trim() }
            : chat
        ))
        setIsRenaming(null)
        setRenameValue("")
      }
    } catch (error) {
      console.error('Error renaming chat:', error)
    }
  }

  // Handle chat deletion
  const handleDeleteChat = async (chatId) => {
    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remove from local state
        const updatedChats = chats.filter(chat => chat.id !== chatId)
        setChats(updatedChats)
        
        // If we deleted the active chat, switch to another one
        if (activeChat === chatId) {
          setActiveChat(updatedChats.length > 0 ? updatedChats[0].id : null)
        }
        
        setShowDeleteConfirm(null)
        setShowChatOptions(null)
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  // Start renaming a chat
  const startRename = (chatId, currentName) => {
    setIsRenaming(chatId)
    setRenameValue(currentName)
    setShowChatOptions(null)
  }

  // Cancel renaming
  const cancelRename = () => {
    setIsRenaming(null)
    setRenameValue("")
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return

    const userMessage = { role: "user", content: newMessage }
    const currentActiveChat = chats.find((chat) => chat.id === activeChat)
    
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

    // Scroll to show user message immediately
    setTimeout(scrollToBottom, 50)

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

      // Call the AI API with real inventory context and conversation history
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'business-assistant',
          prompt: newMessage,
          conversationHistory: currentActiveChat?.messages || [], // Include conversation context
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

      // Scroll to show AI response
      setTimeout(scrollToBottom, 100)

    } catch (error) {
      console.error('Error sending message:', error)
      
      let errorMessage = { 
        role: "assistant", 
        content: ''
      }

      // Handle different types of errors with specific messages
      if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        errorMessage.content = "🌐 **Connection Lost**\n\nI can't reach the server right now. Please check your internet connection and try again."
      } else if (error.message?.includes('timeout')) {
        errorMessage.content = "⏰ **Request Timeout**\n\nThe request is taking too long. Please try again - this usually resolves quickly."
      } else if (error.message?.includes('rate limit') || error.status === 429) {
        errorMessage.content = "⏱️ **Slow Down**\n\nYou're sending messages too quickly. Please wait a moment and try again."
      } else if (error.status === 401) {
        errorMessage.content = "🔒 **Authentication Issue**\n\nYour session may have expired. Please refresh the page and log in again."
      } else if (error.status === 403) {
        errorMessage.content = "🚫 **Access Denied**\n\nYou don't have permission to use the AI service. Please contact your administrator."
      } else if (error.status >= 500) {
        errorMessage.content = "🔧 **Server Problem**\n\nOur servers are having issues. Please try again in a few minutes."
      } else {
        // Generic fallback with helpful suggestions
        errorMessage.content = "⚠️ **Something Went Wrong**\n\nI'm having trouble processing your request right now.\n\n💡 **You can try:**\n• Refreshing the page\n• Checking your internet connection\n• Trying again in a moment\n• Using the inventory section directly for basic operations"
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

      // Scroll to show error message
      setTimeout(scrollToBottom, 100)
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
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <h2 className="font-bold text-white">Chat Sessions</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          <div className="space-y-2">
            {chats.map((chat) => (
              <div key={chat.id} className="group relative">
                {isRenaming === chat.id ? (
                  // Rename input
                  <div className="px-3 py-2">
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleRenameChat(chat.id, renameValue)
                        } else if (e.key === 'Escape') {
                          cancelRename()
                        }
                      }}
                      onBlur={() => {
                        if (renameValue.trim()) {
                          handleRenameChat(chat.id, renameValue)
                        } else {
                          cancelRename()
                        }
                      }}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                      autoFocus
                    />
                  </div>
                ) : (
                  // Regular chat item
                  <div className="relative chat-options-container">
                    <div
                      onClick={() => setActiveChat(chat.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer",
                        activeChat === chat.id 
                          ? "bg-blue-600 text-white" 
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{chat.name}</span>
                        <div className="flex items-center gap-1">
                          {/* Chat options button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowChatOptions(showChatOptions === chat.id ? null : chat.id)
                            }}
                            className={cn(
                              "p-1.5 hover:bg-gray-600 rounded transition-all",
                              "opacity-0 group-hover:opacity-100",
                              showChatOptions === chat.id && "opacity-100 bg-gray-600"
                            )}
                            type="button"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Chat options dropdown */}
                    {showChatOptions === chat.id && (
                      <div 
                        className="absolute right-2 top-8 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 min-w-[120px] overflow-hidden"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            startRename(chat.id, chat.name)
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 hover:text-white flex items-center gap-2 transition-colors"
                          type="button"
                        >
                          <Pencil className="h-3 w-3" />
                          Rename
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowDeleteConfirm(chat.id)
                            setShowChatOptions(null)
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-red-300 hover:bg-red-700 hover:text-white flex items-center gap-2 transition-colors"
                          type="button"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
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
        <div className="p-4 border-b border-gray-700 bg-gray-900">
          <h2 className="text-l font-semibold text-white">{currentChat?.name}</h2>
        </div>

        {/* Chat Messages */}
        <div 
          ref={chatContainerRef}
          className={cn(
            "flex-1 overflow-y-auto p-4 space-y-4 bg-black custom-scrollbar",
            styles.chatContainer
          )}
        >
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
        <div className="p-2 border-t border-gray-700 bg-gray-900">
          <div className="flex gap-2 items-start">
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
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px] h-[40px] flex-shrink-0 mt-0"
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Delete Chat</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete "{chats.find(chat => chat.id === showDeleteConfirm)?.name}"? 
              This action cannot be undone and all messages will be permanently lost.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowDeleteConfirm(null)}
                variant="outline"
                className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteChat(showDeleteConfirm)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      <LogoutModal
        showLogoutModal={showLogoutModal}
        setShowLogoutModal={setShowLogoutModal}
        onLogout={handleLogout}
      />
    </div>
  )
}
