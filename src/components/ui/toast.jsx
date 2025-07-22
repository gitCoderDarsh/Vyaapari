"use client"

import { useEffect } from "react"
import { CheckCircle, X, AlertTriangle } from "lucide-react"

export default function Toast({ message, type = "success", show, onClose, duration = 3000 }) {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  if (!show) return null

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-400" />,
    error: <AlertTriangle className="h-5 w-5 text-red-400" />,
  }

  const colors = {
    success: "bg-green-900 border-green-800 text-green-100",
    error: "bg-red-900 border-red-800 text-red-100",
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className={`flex items-center p-4 rounded-lg border ${colors[type]} shadow-lg max-w-md`}>
        <div className="flex items-center">
          {icons[type]}
          <span className="ml-3 text-sm font-medium">{message}</span>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
