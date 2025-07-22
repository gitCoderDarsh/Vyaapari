"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Building2, Mail, Lock, User, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import GoogleButton from "@/components/auth/GoogleButton"

export default function AuthPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  // Handle input changes for signup form
  const handleSignupChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id.replace('signup-', '').replace('-', '')]: value
    }))
  }

  // Handle input changes for login form
  const handleLoginChange = (e) => {
    const { id, value } = e.target
    setLoginData(prev => ({
      ...prev,
      [id.replace('login-', '')]: value
    }))
  }

  // Handle signup form submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault()

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.businessName ||
      !formData.email || !formData.phone || !formData.password) {
      alert('Please fill in all required fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          businessName: formData.businessName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          businessName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        })
        // Redirect to login tab
        setActiveTab("login")
      } else {
        alert(result.error || 'Failed to create account')
      }
    } catch (error) {
      console.error('Signup error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!loginData.email || !loginData.password) {
      alert('Please fill in all fields')
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
        // Redirect to inventory as main dashboard page
        router.push('/dashboard/inventory')
      } else if (result?.ok === true && !result?.error) {
        console.log('Frontend - Login SUCCESS!')
        // Reset login form
        setLoginData({
          email: '',
          password: ''
        })
        // Redirect to inventory as main dashboard page
        router.push('/dashboard/inventory')
      } else {
        console.log('Frontend - Login FAILED:', result?.error || 'Unknown error')
        alert(`Login failed: ${result?.error || 'Invalid credentials'}`)
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsLoginLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-xl mb-4">
            <Building2 className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Vyaapari</h1>
          <p className="text-gray-400 text-sm">Manage your business with ease</p>
        </div>

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
                    <button type="button" className="text-sm text-white hover:underline">Forgot password?</button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-white text-black hover:bg-gray-100 font-medium"
                    disabled={isLoginLoading}
                  >
                    {isLoginLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>

                <div className="relative">
                  <Separator className="bg-gray-700" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-gray-900 px-2 text-xs text-gray-400">OR</span>
                  </div>
                </div>

                <GoogleButton />
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="firstName"
                          placeholder="First name"
                          className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white"
                          value={formData.firstName}
                          onChange={handleSignupChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Last name"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white"
                        value={formData.lastName}
                        onChange={handleSignupChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-gray-300">Business Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="businessName"
                        placeholder="Enter your business name"
                        className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white"
                        value={formData.businessName}
                        onChange={handleSignupChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white"
                        value={formData.email}
                        onChange={handleSignupChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white"
                        value={formData.phone}
                        onChange={handleSignupChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white"
                        value={formData.password}
                        onChange={handleSignupChange}
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-white">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white"
                        value={formData.confirmPassword}
                        onChange={handleSignupChange}
                        required
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-white">
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="terms" className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-white focus:ring-white focus:ring-2" required />
                    <Label htmlFor="terms" className="text-sm text-gray-300">
                      I agree to the <button type="button" className="text-white hover:underline">Terms of Service</button> and{" "}
                      <button type="button" className="text-white hover:underline">Privacy Policy</button>
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-white text-black hover:bg-gray-100 font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>

                <div className="relative">
                  <Separator className="bg-gray-700" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-gray-900 px-2 text-xs text-gray-400">OR</span>
                  </div>
                </div>

                <GoogleButton />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">© 2025 Vyaapari Dashboard. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
