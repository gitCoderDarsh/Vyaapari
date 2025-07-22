"use client"

import { useState } from "react"
import { Eye, EyeOff, Building2, Mail, Lock, User, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignupForm({ onSignupSuccess, showToast }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  // Handle input changes for signup form
  const handleSignupChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id.replace('signup-', '').replace('-', '')]: value
    }))
  }

  // Handle signup form submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault()

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.businessName ||
      !formData.email || !formData.phone || !formData.password) {
      if (showToast) {
        showToast('Please fill in all required fields', "error")
      } else {
        alert('Please fill in all required fields')
      }
      return
    }

    if (formData.password !== formData.confirmPassword) {
      if (showToast) {
        showToast('Passwords do not match', "error")
      } else {
        alert('Passwords do not match')
      }
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
        // Call the callback to switch to login tab (this will also show toast)
        if (onSignupSuccess) {
          onSignupSuccess()
        }
      } else {
        if (showToast) {
          showToast(result.error || 'Failed to create account', "error")
        } else {
          alert(result.error || 'Failed to create account')
        }
      }
    } catch (error) {
      console.error('Signup error:', error)
      if (showToast) {
        showToast('An error occurred. Please try again.', "error")
      } else {
        alert('An error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
  )
}
