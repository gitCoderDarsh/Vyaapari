import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { geminiService } from "@/lib/gemini"

// POST - Handle AI requests from client
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, prompt, conversationHistory, data } = body

    console.log('🤖 [AI API] Request received:', { 
      type, 
      promptLength: prompt?.length,
      conversationLength: conversationHistory?.length || 0,
      user: session.user.email,
      timestamp: new Date().toISOString() 
    })

    let result

    switch (type) {
      case 'business-assistant':
        result = await geminiService.businessAssistant(prompt, {
          ...data.context,
          inventoryItems: data.inventoryItems || [], // Add actual inventory items
          conversationHistory: conversationHistory || [] // Add conversation context
        })
        break
        
      case 'search-help':
        result = await geminiService.interpretSearchQuery(prompt, data.productNames || [])
        break
        
      case 'product-description':
        result = await geminiService.generateProductDescription(
          data.productName, 
          data.price, 
          data.category
        )
        break
        
      case 'analyze-inventory':
        result = await geminiService.analyzeInventory({
          ...data.stats,
          inventoryItems: data.inventoryItems || [] // Add actual inventory items
        })
        break
        
      case 'pricing-suggestion':
        result = await geminiService.suggestPricing(
          data.productName, 
          data.category, 
          data.currentPrice
        )
        break
        
      default:
        return NextResponse.json({ error: "Invalid AI request type" }, { status: 400 })
    }

    console.log('🤖 [AI API] Response generated:', { 
      success: result.success, 
      responseLength: result.text?.length,
      timestamp: new Date().toISOString() 
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('🤖 [AI API] Error:', error)
    
    // Determine the type of error and provide appropriate response
    let errorResponse = {
      error: "AI service error",
      success: false,
      text: "Sorry, the AI service is temporarily unavailable. Please try again later.",
      isTemporary: true
    }

    // Network/Connection errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.message?.includes('network')) {
      errorResponse = {
        error: "Network error",
        success: false,
        text: "🌐 **Connection Problem**\n\nI'm having trouble connecting to the AI service. Please check your internet connection and try again in a moment.",
        isTemporary: true
      }
    }
    // Timeout errors
    else if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
      errorResponse = {
        error: "Timeout error", 
        success: false,
        text: "⏰ **Request Timeout**\n\nThe AI service is taking too long to respond. Please try again - this usually resolves quickly.",
        isTemporary: true
      }
    }
    // Rate limiting
    else if (error.message?.includes('rate limit') || error.status === 429) {
      errorResponse = {
        error: "Rate limit exceeded",
        success: false, 
        text: "⏱️ **Too Many Requests**\n\nPlease wait a moment before sending another message. The AI service needs a brief break.",
        isTemporary: true
      }
    }
    // API key issues
    else if (error.message?.includes('API_KEY') || error.status === 401) {
      errorResponse = {
        error: "Authentication error",
        success: false,
        text: "🔑 **Service Configuration Issue**\n\nThere's a problem with the AI service setup. Please contact your administrator.",
        isTemporary: false
      }
    }
    // Server errors
    else if (error.status >= 500) {
      errorResponse = {
        error: "Server error",
        success: false,
        text: "🔧 **Service Temporarily Down**\n\nThe AI service is experiencing technical difficulties. Please try again in a few minutes.",
        isTemporary: true
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
