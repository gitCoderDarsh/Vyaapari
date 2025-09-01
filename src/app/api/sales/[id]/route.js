import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// DELETE /api/sales/[id] - Delete a sale
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Sale ID is required" }, { status: 400 })
    }

    // Check if sale exists and belongs to user
    const sale = await prisma.sale.findFirst({
      where: {
        id,
        user: {
          email: session.user.email
        }
      },
      include: {
        saleItems: true
      }
    })

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    // Delete sale and related items (cascade delete)
    await prisma.$transaction(async (tx) => {
      // Delete sale items first
      await tx.saleItem.deleteMany({
        where: {
          saleId: id
        }
      })

      // Delete the sale
      await tx.sale.delete({
        where: {
          id
        }
      })
    })

    return NextResponse.json({ 
      message: "Sale deleted successfully",
      deletedSaleId: id
    })

  } catch (error) {
    console.error("Sale deletion error:", error)
    return NextResponse.json({ error: "Failed to delete sale" }, { status: 500 })
  }
}

// GET /api/sales/[id] - Get a specific sale
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Sale ID is required" }, { status: 400 })
    }

    // Fetch sale with related data
    const sale = await prisma.sale.findFirst({
      where: {
        id,
        user: {
          email: session.user.email
        }
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        saleItems: {
          include: {
            inventoryItem: {
              select: {
                id: true,
                itemName: true,
                itemPrice: true
              }
            }
          }
        }
      }
    })

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    // Transform sale data
    const transformedSale = {
      id: sale.id,
      date: sale.createdAt.toISOString(),
      customerName: sale.customer.name,
      customerEmail: sale.customer.email,
      customerPhone: sale.customer.phone,
      customerId: sale.customer.id,
      products: sale.saleItems.map(item => ({
        id: item.id,
        name: item.inventoryItem?.itemName || item.productName,
        qty: item.quantity,
        price: item.unitPrice,
        total: item.totalPrice
      })),
      subtotal: sale.subtotalAmount,
      discount: sale.discountAmount || 0,
      total: sale.totalAmount,
      profit: sale.profitAmount || 0,
      paymentStatus: sale.paymentStatus,
      paymentMethod: sale.paymentMethod,
      billNo: sale.invoiceNumber,
      notes: sale.notes
    }

    return NextResponse.json({ sale: transformedSale })

  } catch (error) {
    console.error("Sale fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch sale" }, { status: 500 })
  }
}
