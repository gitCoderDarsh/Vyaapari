import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function GET(request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        businessName: true,
        phone: true,
        email: true,
        name: true,
        image: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log('Profile fetch - Fresh user data:', user)

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ 
      error: "Failed to fetch profile" 
    }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    const body = await request.json()
    const { firstName, lastName, businessName, phone } = body

    // Validate required fields
    if (!firstName || !lastName || !businessName) {
      return NextResponse.json({ 
        error: "First name, last name, and business name are required" 
      }, { status: 400 })
    }

    console.log('Profile update - User ID:', session.user.id)
    console.log('Profile update - Data:', { firstName, lastName, businessName, phone })

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName,
        lastName,
        businessName,
        phone,
        // Update the name field to reflect the new first and last name
        name: `${firstName} ${lastName}`.trim()
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        businessName: true,
        phone: true,
        email: true,
        name: true,
        image: true
      }
    })

    console.log('Profile update - Success:', updatedUser)

    return NextResponse.json({ 
      message: "Profile updated successfully", 
      user: updatedUser 
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ 
      error: "Failed to update profile" 
    }, { status: 500 })
  }
}
