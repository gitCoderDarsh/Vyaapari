import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function POST(req) {
  try {
    const { email, newPassword, step } = await req.json()
    
    console.log('Forgot password request:', { email, step })

    // Step 1: Check if email exists
    if (step === 'check-email') {
      if (!email) {
        return NextResponse.json(
          { error: 'Email is required' },
          { status: 400 }
        )
      }

      // Check if user exists with this email
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      console.log('User lookup result:', { email, userFound: !!existingUser })

      if (!existingUser) {
        console.log('No user found with email:', email)
        return NextResponse.json(
          { error: 'No account found with this email address' },
          { status: 404 }
        )
      }

      console.log('Email found, user can proceed to reset password')
      return NextResponse.json(
        { 
          success: true, 
          message: 'Email verified. You can now reset your password.',
          userId: existingUser.id 
        },
        { status: 200 }
      )
    }

    // Step 2: Reset password
    if (step === 'reset-password') {
      if (!email || !newPassword) {
        return NextResponse.json(
          { error: 'Email and new password are required' },
          { status: 400 }
        )
      }

      // Validate password length
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters long' },
          { status: 400 }
        )
      }

      // Find user again to ensure they still exist
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 12)

      // Update user's password
      await prisma.user.update({
        where: { email },
        data: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      })

      console.log('Password reset successful for:', email)
      return NextResponse.json(
        { 
          success: true, 
          message: 'Password reset successfully. You can now login with your new password.' 
        },
        { status: 200 }
      )
    }

    // Invalid step
    return NextResponse.json(
      { error: 'Invalid step parameter' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    )
  }
}
