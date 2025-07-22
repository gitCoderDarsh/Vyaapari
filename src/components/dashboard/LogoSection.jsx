"use client"

import { useState, useEffect } from "react"
import { Upload, Camera, X } from "lucide-react"

export default function LogoSection({ isEditing, logo }) {
  const [showLogoMenu, setShowLogoMenu] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLogoMenu) {
        setShowLogoMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showLogoMenu])

  const handleLogoClick = () => {
    if (isEditing) {
      setShowLogoMenu(!showLogoMenu)
    }
  }

  const handleViewImage = () => {
    setShowLogoMenu(false)
    // Add view image logic here
    console.log("View image clicked")
  }

  const handleChooseNewPicture = () => {
    setShowLogoMenu(false)
    // Add file upload logic here
    console.log("Choose new picture clicked")
  }

  const handleRemovePicture = () => {
    setShowLogoMenu(false)
    // Add remove picture logic here
    console.log("Remove picture clicked")
  }

  return (
    <div className="text-center mb-8 relative">
      <div className="relative inline-block">
        <img
          src={logo}
          alt="Business Logo"
          className={`w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto border-4 border-gray-700 object-cover ${
            isEditing ? "cursor-pointer hover:opacity-80" : ""
          }`}
          onClick={handleLogoClick}
        />

        {/* Logo Popover Menu */}
        {isEditing && showLogoMenu && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 min-w-48">
            <button 
              onClick={handleViewImage}
              className="w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-700 flex items-center space-x-2 rounded-t-lg"
            >
              <Camera size={16} />
              <span>📷 View Image</span>
            </button>
            <button 
              onClick={handleChooseNewPicture}
              className="w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
            >
              <Upload size={16} />
              <span>🖼️ Choose New Picture</span>
            </button>
            <button 
              onClick={handleRemovePicture}
              className="w-full px-4 py-3 text-left text-red-400 hover:bg-gray-700 flex items-center space-x-2 rounded-b-lg"
            >
              <X size={16} />
              <span>❌ Remove Picture</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
