"use client"

import { User, Package, LogOut, Bot } from "lucide-react"

const iconMap = {
  User,
  Package,
  LogOut,
  Bot
}

export default function Sidebar({ navItems, activeTab, handleNavClick, setShowLogoutModal, isCollapsed = false }) {
  return (
    <div className={`hidden md:block ${isCollapsed ? 'w-16' : 'w-64'} bg-gray-900 h-screen fixed left-0 top-0 border-r border-gray-800 transition-all duration-300`}>
      <div className={`${isCollapsed ? 'p-2' : 'p-6'} flex flex-col h-full transition-all duration-300`}>
        <div>
          <h1 className={`font-bold text-white mb-8 transition-all duration-300 ${isCollapsed ? 'text-xs opacity-0 h-0 mb-4' : 'text-xl opacity-100'}`}>
            {!isCollapsed && "Dashboard"}
          </h1>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const IconComponent = iconMap[item.icon]
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.name)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'space-x-3 px-4 py-3'} rounded-lg transition-all duration-300 ${
                    item.name === activeTab
                      ? "bg-blue-600 text-white font-semibold hover:bg-blue-700"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <IconComponent size={20} className="flex-shrink-0" />
                  {!isCollapsed && <span className="transition-opacity duration-300">{item.name}</span>}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Logout Button - Sticky to Bottom */}
        <div className="mt-auto">
          <button
            onClick={() => setShowLogoutModal(true)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'space-x-3 px-4 py-3'} rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all duration-300`}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="transition-opacity duration-300">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  )
}
