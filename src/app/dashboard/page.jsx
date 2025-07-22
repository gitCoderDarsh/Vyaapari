"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">🎉 Google Auth Successful!</h1>
        <p className="text-gray-300 mb-2">Welcome, {session.user?.name || session.user?.email}!</p>
        <p className="text-gray-400 mb-8">Authentication working perfectly.</p>
        
        <Button 
          onClick={() => signOut({ callbackUrl: "/auth" })}
          variant="outline"
          className="border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          Sign Out
        </Button>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>This will be your profile/dashboard page.</p>
          <p>You can now build your custom UI here!</p>
        </div>
      </div>
    </div>
  )
}
