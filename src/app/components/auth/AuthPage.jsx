"use client"

import { useState } from "react"
import { Eye, EyeOff, Building2, Mail, Lock, User, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800 mb-6">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-white data-[state=active]:text-black text-gray-300"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-white data-[state=active]:text-black text-gray-300"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-gray-300">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="login-email" type="email" placeholder="Enter your email" className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-gray-300">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="login-password" type={showPassword ? "text" : "password"} placeholder="Enter your password" className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white" />
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
                  <button className="text-sm text-white hover:underline">Forgot password?</button>
                </div>

                <Button className="w-full bg-white text-black hover:bg-gray-100 font-medium">Sign In</Button>

                <div className="relative">
                  <Separator className="bg-gray-700" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-gray-900 px-2 text-xs text-gray-400">OR</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent">
                  Continue with Google
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name" className="text-gray-300">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="first-name" placeholder="First name" className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name" className="text-gray-300">Last Name</Label>
                    <Input id="last-name" placeholder="Last name" className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business-name" className="text-gray-300">Business Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="business-name" placeholder="Enter your business name" className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-gray-300">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="signup-email" type="email" placeholder="Enter your email" className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="phone" type="tel" placeholder="+91 98765 43210" className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-gray-300">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="signup-password" type={showPassword ? "text" : "password"} placeholder="Create a password" className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-white">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-gray-300">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="confirm-password" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-white">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="terms" className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-white focus:ring-white focus:ring-2" />
                  <Label htmlFor="terms" className="text-sm text-gray-300">
                    I agree to the <button className="text-white hover:underline">Terms of Service</button> and{" "}
                    <button className="text-white hover:underline">Privacy Policy</button>
                  </Label>
                </div>

                <Button className="w-full bg-white text-black hover:bg-gray-100 font-medium">Create Account</Button>

                <div className="relative">
                  <Separator className="bg-gray-700" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-gray-900 px-2 text-xs text-gray-400">OR</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent">
                  Continue with Google
                </Button>
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
