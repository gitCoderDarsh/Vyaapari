import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

// GET - Fetch all chat sessions for the authenticated user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch chat sessions with their messages
    const chatSessions = await prisma.chatSession.findMany({
      where: { userId: session.user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    console.log('Chat sessions fetch - Sessions found:', chatSessions.length)

    return NextResponse.json({ 
      chatSessions: chatSessions.map(chat => ({
        id: chat.id,
        name: chat.name,
        isActive: chat.isActive,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        messages: chat.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt
        }))
      }))
    })

  } catch (error) {
    console.error('Chat sessions fetch error:', error)
    return NextResponse.json({ 
      error: "Failed to fetch chat sessions" 
    }, { status: 500 })
  }
}

// POST - Create a new chat session
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ 
        error: "Chat session name is required" 
      }, { status: 400 })
    }

    // Create new chat session
    const newChatSession = await prisma.chatSession.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        isActive: true
      }
    })

    console.log('Chat session created:', newChatSession.id)

    return NextResponse.json({ 
      chatSession: {
        id: newChatSession.id,
        name: newChatSession.name,
        isActive: newChatSession.isActive,
        createdAt: newChatSession.createdAt,
        updatedAt: newChatSession.updatedAt,
        messages: []
      }
    })

  } catch (error) {
    console.error('Chat session creation error:', error)
    return NextResponse.json({ 
      error: "Failed to create chat session" 
    }, { status: 500 })
  }
}
