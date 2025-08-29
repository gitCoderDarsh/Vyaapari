"use client"

import { MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

function AIBusinessChatbot({ inventoryData = {}, onNaturalSearch }) {
  const router = useRouter()

  const handleChatClick = () => {
    router.push('/dashboard/assistant')
  }

  return (
    <button
      onClick={handleChatClick}
      className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50"
      title="AI Business Assistant"
    >
      <MessageCircle size={24} />
    </button>
  )
}

export default AIBusinessChatbot
