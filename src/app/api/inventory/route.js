import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

// GET - Fetch all inventory items for the authenticated user
export async function GET(request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch inventory items for this user
    const inventoryItems = await prisma.inventory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    console.log('Inventory fetch - Items found:', inventoryItems.length)

    return NextResponse.json({ 
      items: inventoryItems,
      totalItems: inventoryItems.length,
      totalValue: inventoryItems.reduce((sum, item) => 
        sum + (Number(item.stockQuantity) * Number(item.itemPrice)), 0
      )
    })

  } catch (error) {
    console.error('Inventory fetch error:', error)
    return NextResponse.json({ 
      error: "Failed to fetch inventory" 
    }, { status: 500 })
  }
}

// POST - Create a new inventory item
export async function POST(request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    const body = await request.json()
    const { itemName, stockQuantity, itemPrice, customFields } = body

    // Validate required fields
    if (!itemName || stockQuantity === undefined || !itemPrice) {
      return NextResponse.json({ 
        error: "Item name, stock quantity, and item price are required" 
      }, { status: 400 })
    }

    // Validate data types
    if (typeof stockQuantity !== 'number' || stockQuantity < 0) {
      return NextResponse.json({ 
        error: "Stock quantity must be a non-negative number" 
      }, { status: 400 })
    }

    if (typeof itemPrice !== 'number' || itemPrice <= 0) {
      return NextResponse.json({ 
        error: "Item price must be a positive number" 
      }, { status: 400 })
    }

    console.log('Inventory create - User ID:', session.user.id)
    console.log('Inventory create - Data:', { itemName, stockQuantity, itemPrice, customFields })

    // Create new inventory item
    const newItem = await prisma.inventory.create({
      data: {
        userId: session.user.id,
        itemName: itemName.trim(),
        stockQuantity: parseInt(stockQuantity),
        itemPrice: parseFloat(itemPrice),
        customFields: customFields || {}
      }
    })

    console.log('Inventory create - Success:', newItem.id)

    return NextResponse.json({ 
      message: "Inventory item created successfully", 
      item: newItem 
    }, { status: 201 })

  } catch (error) {
    console.error('Inventory create error:', error)
    return NextResponse.json({ 
      error: "Failed to create inventory item" 
    }, { status: 500 })
  }
}
