import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

// POST - Add a new message to a chat session
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { chatSessionId, role, content, metadata } = body

    // Validate input
    if (!chatSessionId || !role || !content) {
      return NextResponse.json({ 
        error: "Missing required fields: chatSessionId, role, content" 
      }, { status: 400 })
    }

    if (!['user', 'assistant'].includes(role)) {
      return NextResponse.json({ 
        error: "Role must be either 'user' or 'assistant'" 
      }, { status: 400 })
    }

    // Verify chat session belongs to user
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: chatSessionId,
        userId: session.user.id
      }
    })

    if (!chatSession) {
      return NextResponse.json({ 
        error: "Chat session not found or access denied" 
      }, { status: 404 })
    }

    // Create the message
    const newMessage = await prisma.chatMessage.create({
      data: {
        chatSessionId,
        role,
        content,
        metadata: metadata || null
      }
    })

    // Update chat session's updatedAt timestamp
    await prisma.chatSession.update({
      where: { id: chatSessionId },
      data: { updatedAt: new Date() }
    })

    console.log('Message created for chat session:', chatSessionId)

    return NextResponse.json({ 
      message: {
        id: newMessage.id,
        role: newMessage.role,
        content: newMessage.content,
        createdAt: newMessage.createdAt
      }
    })

  } catch (error) {
    console.error('Message creation error:', error)
    return NextResponse.json({ 
      error: "Failed to create message" 
    }, { status: 500 })
  }
}
