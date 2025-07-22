"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AuthHeader from "@/components/auth/AuthHeader"
import AuthFooter from "@/components/auth/AuthFooter"
import AuthDivider from "@/components/auth/AuthDivider"
import LoginForm from "@/components/auth/LoginForm"
import SignupForm from "@/components/auth/SignupForm"
import Toast from "@/components/ui/toast"

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login")
  const [toast, setToast] = useState({ show: false, message: "", type: "success" })

  const handleSignupSuccess = () => {
    setActiveTab("login")
    showToast("Account created successfully! Please login with your credentials.", "success")
  }

  const handleLoginSuccess = () => {
    showToast("Welcome back! Redirecting to dashboard...", "success")
  }

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
  }

  const hideToast = () => {
    setToast({ show: false, message: "", type: "success" })
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthHeader />

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-white text-center">Welcome</CardTitle>
            <CardDescription className="text-gray-400 text-center">
              Login to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800 mb-6">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-white data-[state=active]:text-black text-gray-300"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-white data-[state=active]:text-black text-gray-300"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <LoginForm onLoginSuccess={handleLoginSuccess} showToast={showToast} />
                <AuthDivider />
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <SignupForm onSignupSuccess={handleSignupSuccess} showToast={showToast} />
                <AuthDivider />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <AuthFooter />

        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      </div>
    </div>
  )
}
