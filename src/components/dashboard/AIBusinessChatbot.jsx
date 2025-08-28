"use client"

import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, Loader2, Search, TrendingUp, DollarSign, HelpCircle } from 'lucide-react'

// Helper function to call AI API
const callAI = async (type, prompt, data = {}) => {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, prompt, data })
    })
    
    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('AI API call failed:', error)
    return { 
      success: false, 
      text: "I'm having trouble connecting to the AI service. Please try again." 
    }
  }
}

export default function AIBusinessChatbot({ inventoryData = {}, onNaturalSearch }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: `👋 Hi! I'm your AI business assistant for Vyaapari. I can help you with:

🔍 Natural Language Search - "Show me cheap items under ₹500"
📊 Business Analysis - "What products are selling slow?"  
💰 Pricing Advice - "Is my pricing competitive?"
📈 Growth Tips - "How to optimize my inventory?"

What would you like to know about your business?`,
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Quick action buttons
  const quickActions = [
    {
      icon: <Search size={16} />,
      text: "Smart Search",
      prompt: "Help me find products in my inventory"
    },
    {
      icon: <TrendingUp size={16} />,
      text: "Business Insights",
      prompt: "Analyze my current inventory and give business insights"
    },
    {
      icon: <DollarSign size={16} />,
      text: "Pricing Help",
      prompt: "Give me pricing recommendations for my products"
    },
    {
      icon: <HelpCircle size={16} />,
      text: "Growth Tips",
      prompt: "How can I grow my business with better inventory management?"
    }
  ]

  const handleQuickAction = (prompt) => {
    setInputValue(prompt)
    handleSendMessage(prompt)
  }

  const detectIntent = (message) => {
    const lowerMessage = message.toLowerCase()
    
    // Strategic business questions (highest priority - must be first)
    if (lowerMessage.includes('distribute') || lowerMessage.includes('distribution') ||
        lowerMessage.includes('pack') || lowerMessage.includes('bundle') ||
        lowerMessage.includes('strategy') || lowerMessage.includes('thinking') ||
        lowerMessage.includes('plan') || lowerMessage.includes('start by') ||
        lowerMessage.includes('what if') || lowerMessage.includes('considering') ||
        lowerMessage.includes('nonnegotiable') || lowerMessage.includes('wholesale') ||
        (lowerMessage.includes('selling') && lowerMessage.length > 50)) {
      return 'guidance' // Route to business-assistant for strategic questions
    }
    
    // Natural language search patterns
    if (lowerMessage.includes('find') || lowerMessage.includes('search') || 
        lowerMessage.includes('show me') || lowerMessage.includes('cheap') ||
        lowerMessage.includes('under') || lowerMessage.includes('above') ||
        lowerMessage.includes('expensive') || lowerMessage.includes('items')) {
      return 'search'
    }
    
    // Business analysis patterns (only for specific analysis requests)
    if ((lowerMessage.includes('analyze') && lowerMessage.includes('inventory')) ||
        lowerMessage.includes('insights') || lowerMessage.includes('trends') ||
        lowerMessage.includes('performance') || lowerMessage.includes('slow') ||
        lowerMessage.includes('fast') || lowerMessage.includes('overview')) {
      return 'analysis'
    }
    
    // Pricing patterns
    if (lowerMessage.includes('price') || lowerMessage.includes('pricing') ||
        lowerMessage.includes('cost') || lowerMessage.includes('competitive')) {
      return 'pricing'
    }
    
    // Help/guidance patterns (general business questions)
    if (lowerMessage.includes('help') || lowerMessage.includes('how') ||
        lowerMessage.includes('should') || lowerMessage.includes('advice') ||
        lowerMessage.includes('recommend') || lowerMessage.includes('suggest') ||
        lowerMessage.includes('business') || lowerMessage.includes('selling')) {
      return 'guidance'
    }
    
    return 'general'
  }

  const handleSendMessage = async (messageText = inputValue) => {
    if (!messageText.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const intent = detectIntent(messageText)
      let response

      switch (intent) {
        case 'search':
          // Natural language search
          if (onNaturalSearch) {
            response = await callAI('search-help', messageText, {
              productNames: inventoryData.items?.map(item => item.itemName) || []
            })
            
            // Also trigger actual search if possible
            const searchTerms = extractSearchTerms(messageText)
            if (searchTerms && onNaturalSearch) {
              onNaturalSearch(searchTerms)
              response.text += `\n\n🔍 I've also updated your search results to show relevant products!`
            }
          } else {
            response = { text: "Search functionality is not available in this context." }
          }
          break

        case 'analysis':
          // Business insights
          response = await callAI('analyze-inventory', '', {
            stats: {
              totalItems: inventoryData.totalItems || 0,
              totalValue: inventoryData.totalValue || 0,
              lowStockItems: inventoryData.lowStockItems || 0
            },
            inventoryItems: inventoryData.items || [] // Pass actual inventory items
          })
          break

        case 'pricing':
          // Pricing advice
          response = await callAI('business-assistant', messageText, {
            context: {
              totalItems: inventoryData.totalItems,
              totalValue: inventoryData.totalValue,
              lowStockItems: inventoryData.lowStockItems
            },
            inventoryItems: inventoryData.items || [] // Pass actual inventory items
          })
          break

        case 'guidance':
          // Business guidance
          response = await callAI('business-assistant', messageText, {
            context: {
              totalItems: inventoryData.totalItems,
              totalValue: inventoryData.totalValue,
              lowStockItems: inventoryData.lowStockItems
            },
            inventoryItems: inventoryData.items || [] // Pass actual inventory items
          })
          break

        default:
          // General conversation
          response = await callAI('business-assistant', messageText, {
            context: {
              totalItems: inventoryData.totalItems,
              totalValue: inventoryData.totalValue,
              lowStockItems: inventoryData.lowStockItems
            },
            inventoryItems: inventoryData.items || [] // Pass actual inventory items
          })
      }

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.text || "I'm sorry, I couldn't process that request right now. Please try again.",
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Chatbot Error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm experiencing some technical difficulties. Please try again in a moment.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Extract search terms from natural language
  const extractSearchTerms = (message) => {
    const lowerMessage = message.toLowerCase()
    
    // Extract price filters
    const priceMatch = lowerMessage.match(/under ₹?(\d+)|below ₹?(\d+)|less than ₹?(\d+)/)
    if (priceMatch) {
      const price = priceMatch[1] || priceMatch[2] || priceMatch[3]
      return `price:under:${price}`
    }
    
    const aboveMatch = lowerMessage.match(/above ₹?(\d+)|over ₹?(\d+)|more than ₹?(\d+)/)
    if (aboveMatch) {
      const price = aboveMatch[1] || aboveMatch[2] || aboveMatch[3]
      return `price:above:${price}`
    }
    
    // Extract product type keywords
    const keywords = ['phone', 'laptop', 'tablet', 'watch', 'headphone', 'speaker', 'camera']
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        return keyword
      }
    }
    
    // Extract general descriptors
    if (lowerMessage.includes('cheap') || lowerMessage.includes('affordable')) {
      return 'cheap'
    }
    if (lowerMessage.includes('expensive') || lowerMessage.includes('premium')) {
      return 'expensive'
    }
    
    return null
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50 ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
        title="AI Business Assistant"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="font-semibold text-white">AI Business Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg whitespace-pre-wrap ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-100 border border-gray-700'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 text-gray-100 border border-gray-700 p-3 rounded-lg flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t border-gray-700">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="flex items-center gap-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  {action.icon}
                  {action.text}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your business..."
                className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg transition-colors"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
