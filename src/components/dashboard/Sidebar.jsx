"use client"

import { User, Package, LogOut } from "lucide-react"

const iconMap = {
  User,
  Package,
  LogOut
}

export default function Sidebar({ navItems, activeTab, handleNavClick, setShowLogoutModal }) {
  return (
    <div className="hidden md:block w-64 bg-gray-900 h-screen fixed left-0 top-0 border-r border-gray-800">
      <div className="p-6 flex flex-col h-full">
        <div>
          <h1 className="text-xl font-bold mb-8 text-white">Dashboard</h1>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const IconComponent = iconMap[item.icon]
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.name)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    item.name === activeTab
                      ? "bg-white text-black font-semibold"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <IconComponent size={20} />
                  <span>{item.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Logout Button - Sticky to Bottom */}
        <div className="mt-auto">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}
