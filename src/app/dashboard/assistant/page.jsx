"use client"

import { useState } from "react"
import { Package, User, Bot, LogOut, Edit, Plus, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("inventory")
  const [isGlobalSidebarCollapsed, setIsGlobalSidebarCollapsed] = useState(false)
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

  const handleSectionChange = (section) => {
    setActiveSection(section)
    if (section === "assistant") {
      setIsGlobalSidebarCollapsed(true)
    } else {
      setIsGlobalSidebarCollapsed(false)
    }
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

  return (
    <div className="flex h-screen bg-background">
      {/* Global Sidebar */}
      <div
        className={cn(
          "bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
          isGlobalSidebarCollapsed ? "w-16" : "w-64",
        )}
      >
        <div className="p-4">
          <h1
            className={cn(
              "font-bold text-sidebar-foreground transition-opacity duration-300",
              isGlobalSidebarCollapsed ? "opacity-0 text-xs" : "opacity-100 text-xl",
            )}
          >
            Vyaapari
          </h1>
        </div>

        <nav className="flex-1 px-2">
          <div className="space-y-2">
            <button
              onClick={() => handleSectionChange("inventory")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                activeSection === "inventory"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Package className="h-5 w-5 flex-shrink-0" />
              {!isGlobalSidebarCollapsed && <span>Inventory</span>}
            </button>

            <button
              onClick={() => handleSectionChange("profile")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                activeSection === "profile"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <User className="h-5 w-5 flex-shrink-0" />
              {!isGlobalSidebarCollapsed && <span>Profile</span>}
            </button>

            <button
              onClick={() => handleSectionChange("assistant")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                activeSection === "assistant"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Bot className="h-5 w-5 flex-shrink-0" />
              {!isGlobalSidebarCollapsed && <span>Assistant</span>}
            </button>
          </div>
        </nav>

        <div className="p-2 border-t border-sidebar-border">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200">
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isGlobalSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Assistant Context Sidebar */}
      {activeSection === "assistant" && (
        <div className="w-64 bg-sidebar-accent border-r border-sidebar-border flex flex-col">
          <div className="p-4 border-b border-sidebar-border">
            <h2 className="font-bold text-sidebar-accent-foreground">Chats</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-2">
              {chats.map((chat) => (
                <div key={chat.id} className="group relative">
                  <button
                    onClick={() => setActiveChat(chat.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg transition-all duration-200",
                      activeChat === chat.id
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-accent-foreground hover:bg-sidebar-primary/20",
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

          <div className="p-2 border-t border-sidebar-border">
            <Button
              onClick={createNewChat}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {activeSection === "assistant" ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-semibold">{currentChat?.name}</h2>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentChat?.messages.map((message, index) => (
                <div key={index} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground",
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-input border-border text-foreground"
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button onClick={sendMessage} className="bg-primary hover:bg-primary/90">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-6">
            {activeSection === "inventory" && (
              <div>
                <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Total Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">1,234</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Low Stock Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-destructive">23</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Total Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">₹2,45,678</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeSection === "profile" && (
              <div>
                <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
                <Card className="max-w-md">
                  <CardHeader>
                    <CardTitle>User Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <Input defaultValue="John Doe" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input defaultValue="john@example.com" />
                    </div>
                    <Button className="w-full">Save Changes</Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
