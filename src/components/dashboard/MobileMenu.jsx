"use client"

import { X, User, Package, LogOut, Bot } from "lucide-react"

const iconMap = {
  User,
  Package,
  LogOut,
  Bot
}

export default function MobileMenu({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  navItems, 
  activeTab, 
  handleNavClick, 
  setShowLogoutModal 
}) {
  if (!isMobileMenuOpen) return null

  return (
    <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40">
      <div className="bg-gray-900 w-64 h-full border-r border-gray-800">
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="text-gray-300 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="space-y-2 flex-1">
            {navItems.map((item) => {
              const IconComponent = iconMap[item.icon]
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    handleNavClick(item.name)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    item.name === activeTab
                      ? "bg-blue-600 text-white font-semibold hover:bg-blue-700"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <IconComponent size={20} />
                  <span>{item.name}</span>
                </button>
              )
            })}
          </nav>

          {/* Mobile Logout Button */}
          <div className="mt-auto pt-4 border-t border-gray-800">
            <button
              onClick={() => {
                setShowLogoutModal(true)
                setIsMobileMenuOpen(false)
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
