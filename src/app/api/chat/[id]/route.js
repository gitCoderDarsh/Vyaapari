import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

// PUT - Update chat session (rename, activate/deactivate)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { name, isActive } = body

    // Verify chat session belongs to user
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!chatSession) {
      return NextResponse.json({ 
        error: "Chat session not found or access denied" 
      }, { status: 404 })
    }

    // Update chat session
    const updateData = {}
    if (name !== undefined) updateData.name = name.trim()
    if (isActive !== undefined) updateData.isActive = isActive
    updateData.updatedAt = new Date()

    const updatedChatSession = await prisma.chatSession.update({
      where: { id },
      data: updateData
    })

    console.log('Chat session updated:', id)

    return NextResponse.json({ 
      chatSession: {
        id: updatedChatSession.id,
        name: updatedChatSession.name,
        isActive: updatedChatSession.isActive,
        createdAt: updatedChatSession.createdAt,
        updatedAt: updatedChatSession.updatedAt
      }
    })

  } catch (error) {
    console.error('Chat session update error:', error)
    return NextResponse.json({ 
      error: "Failed to update chat session" 
    }, { status: 500 })
  }
}

// DELETE - Delete chat session and all its messages
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Verify chat session belongs to user
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!chatSession) {
      return NextResponse.json({ 
        error: "Chat session not found or access denied" 
      }, { status: 404 })
    }

    // Delete chat session (messages will be deleted via cascade)
    await prisma.chatSession.delete({
      where: { id }
    })

    console.log('Chat session deleted:', id)

    return NextResponse.json({ 
      message: "Chat session deleted successfully" 
    })

  } catch (error) {
    console.error('Chat session deletion error:', error)
    return NextResponse.json({ 
      error: "Failed to delete chat session" 
    }, { status: 500 })
  }
}
