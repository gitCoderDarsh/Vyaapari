"use client"

import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordModal({ showModal, setShowModal, showToast }) {
  const [step, setStep] = useState('email') // 'email' or 'reset'
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle email verification step
  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email) {
      showToast('Please enter your email address', 'error')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          step: 'check-email'
        }),
      })

      if (!response.ok) {
        // Handle non-200 responses
        let errorMessage = 'Email not found'
        try {
          const result = await response.json()
          errorMessage = result.error || errorMessage
        } catch (parseError) {
          console.error('Error parsing response:', parseError)
        }
        console.log('Error response:', { status: response.status, message: errorMessage })
        showToast(errorMessage, 'error')
        return
      }

      const result = await response.json()
      console.log('Success response:', result)
      showToast('Email verified! Now set your new password.', 'success')
      setStep('reset')
    } catch (error) {
      console.error('Email verification error:', error)
      showToast('An error occurred. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle password reset step
  const handlePasswordReset = async (e) => {
    e.preventDefault()
    
    if (!formData.newPassword || !formData.confirmPassword) {
      showToast('Please fill in all fields', 'error')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }

    if (formData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          newPassword: formData.newPassword,
          step: 'reset-password'
        }),
      })

      const result = await response.json()

      if (response.ok) {
        showToast('Password reset successfully! You can now login.', 'success')
        handleClose()
      } else {
        showToast(result.error || 'Failed to reset password', 'error')
      }
    } catch (error) {
      console.error('Password reset error:', error)
      showToast('An error occurred. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Close modal and reset state
  const handleClose = () => {
    setShowModal(false)
    setStep('email')
    setFormData({
      email: '',
      newPassword: '',
      confirmPassword: ''
    })
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  // Go back to email step
  const handleBack = () => {
    setStep('email')
    setFormData(prev => ({
      ...prev,
      newPassword: '',
      confirmPassword: ''
    }))
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  if (!showModal) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {step === 'reset' && (
              <button
                onClick={handleBack}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-xl font-semibold text-white">
              {step === 'email' ? 'Forgot Password' : 'Reset Password'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {step === 'email' ? (
          // Email verification step
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email Address
              </Label>
              <p className="text-sm text-gray-400">
                Enter your email address to verify your account
              </p>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-white text-black hover:bg-gray-100 font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>
        ) : (
          // Password reset step
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">
                Account: {formData.email}
              </Label>
              <p className="text-sm text-gray-400">
                Enter your new password below
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-gray-300">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-white"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-white text-black hover:bg-gray-100 font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
