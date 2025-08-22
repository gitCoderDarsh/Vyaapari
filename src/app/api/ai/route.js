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
    const { type, prompt, data } = body

    console.log('🤖 [AI API] Request received:', { 
      type, 
      promptLength: prompt?.length, 
      user: session.user.email,
      timestamp: new Date().toISOString() 
    })

    let result

    switch (type) {
      case 'business-assistant':
        result = await geminiService.businessAssistant(prompt, {
          ...data.context,
          inventoryItems: data.inventoryItems || [] // Add actual inventory items
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
    return NextResponse.json({ 
      error: "AI service error",
      success: false,
      text: "Sorry, the AI service is temporarily unavailable. Please try again later."
    }, { status: 500 })
  }
}
