import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

// GET - Fetch a specific inventory item
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const item = await prisma.inventory.findFirst({
      where: { 
        id: id,
        userId: session.user.id // Ensure user can only access their own items
      }
    })

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json({ item })

  } catch (error) {
    console.error('Inventory item fetch error:', error)
    return NextResponse.json({ 
      error: "Failed to fetch inventory item" 
    }, { status: 500 })
  }
}

// PUT - Update a specific inventory item
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
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

    // Check if item exists and belongs to user
    const existingItem = await prisma.inventory.findFirst({
      where: { 
        id: id,
        userId: session.user.id
      }
    })

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    console.log('Inventory update - Item ID:', id)
    console.log('Inventory update - Data:', { itemName, stockQuantity, itemPrice, customFields })

    // Update the item
    const updatedItem = await prisma.inventory.update({
      where: { id: id },
      data: {
        itemName: itemName.trim(),
        stockQuantity: parseInt(stockQuantity),
        itemPrice: parseFloat(itemPrice),
        customFields: customFields || {}
      }
    })

    console.log('Inventory update - Success:', updatedItem.id)

    return NextResponse.json({ 
      message: "Inventory item updated successfully", 
      item: updatedItem 
    })

  } catch (error) {
    console.error('Inventory update error:', error)
    return NextResponse.json({ 
      error: "Failed to update inventory item" 
    }, { status: 500 })
  }
}

// DELETE - Delete a specific inventory item
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check if item exists and belongs to user
    const existingItem = await prisma.inventory.findFirst({
      where: { 
        id: id,
        userId: session.user.id
      }
    })

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    console.log('Inventory delete - Item ID:', id)

    // Delete the item
    await prisma.inventory.delete({
      where: { id: id }
    })

    console.log('Inventory delete - Success:', id)

    return NextResponse.json({ 
      message: "Inventory item deleted successfully" 
    })

  } catch (error) {
    console.error('Inventory delete error:', error)
    return NextResponse.json({ 
      error: "Failed to delete inventory item" 
    }, { status: 500 })
  }
}
