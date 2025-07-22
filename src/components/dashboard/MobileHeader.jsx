"use client"

import { Menu, X } from "lucide-react"

export default function MobileHeader({ isMobileMenuOpen, setIsMobileMenuOpen }) {
  return (
    <div className="md:hidden bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        className="text-white hover:text-gray-300"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <h1 className="text-lg font-semibold">Business Profile</h1>
      <div className="w-6"></div>
    </div>
  )
}
