"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginForm({ onLoginSuccess, showToast, onForgotPassword }) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  // Handle input changes for login form
  const handleLoginChange = (e) => {
    const { id, value } = e.target
    setLoginData(prev => ({
      ...prev,
      [id.replace('login-', '')]: value
    }))
  }

  // Handle login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!loginData.email || !loginData.password) {
      if (showToast) {
        showToast('Please fill in all fields', "error")
      } else {
        alert('Please fill in all fields')
      }
      return
    }

    setIsLoginLoading(true)

    try {
      const result = await signIn('credentials', {
        email: loginData.email,
        password: loginData.password,
        redirect: false,
      })

      console.log('Frontend - Full login result:', JSON.stringify(result, null, 2))

      // NextAuth with redirect: false returns:
      // Success: { ok: true, status: 200, error: null, url: null }
      // Error: { ok: false, status: 401, error: "CredentialsSignin", url: null }
      
      // Check for URL-based OAuth errors that shouldn't affect credentials login
      if (result?.error === "OAuthCreateAccount" && result?.ok === true) {
        console.log('Frontend - Ignoring OAuth error for credentials login')
        // Reset login form
        setLoginData({
          email: '',
          password: ''
        })
        // Show success toast and call callback
        if (showToast) showToast("Login successful! Redirecting to dashboard...", "success")
        if (onLoginSuccess) onLoginSuccess()
        // Redirect to inventory as main dashboard page
        router.push('/dashboard/inventory')
      } else if (result?.ok === true && !result?.error) {
        console.log('Frontend - Login SUCCESS!')
        // Reset login form
        setLoginData({
          email: '',
          password: ''
        })
        // Show success toast and call callback
        if (showToast) showToast("Welcome back! Redirecting to dashboard...", "success")
        if (onLoginSuccess) onLoginSuccess()
        // Redirect to inventory as main dashboard page
        router.push('/dashboard/inventory')
      } else {
        console.log('Frontend - Login FAILED:', result?.error || 'Unknown error')
        if (showToast) {
          showToast(`Login failed: ${result?.error || 'Invalid credentials'}`, "error")
        } else {
          alert(`Login failed: ${result?.error || 'Invalid credentials'}`)
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      if (showToast) {
        showToast('An error occurred. Please try again.', "error")
      } else {
        alert('An error occurred. Please try again.')
      }
    } finally {
      setIsLoginLoading(false)
    }
  }

  return (
    <form onSubmit={handleLoginSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email" className="text-gray-300">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="login-email"
            type="email"
            placeholder="Enter your email"
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white"
            value={loginData.email}
            onChange={handleLoginChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password" className="text-gray-300">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white"
            value={loginData.password}
            onChange={handleLoginChange}
            required
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-white">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-white focus:ring-white focus:ring-2" />
          <Label htmlFor="remember" className="text-sm text-gray-300">Remember me</Label>
        </div>
        <button 
          type="button" 
          onClick={onForgotPassword}
          className="text-sm text-white hover:underline"
        >
          Forgot password?
        </button>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-white text-black hover:bg-gray-100 font-medium"
        disabled={isLoginLoading}
      >
        {isLoginLoading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  )
}
