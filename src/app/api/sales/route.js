import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET /api/sales - Fetch sales with filtering and pagination
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const skip = (page - 1) * limit

    // Build where clause for filtering
    const where = {
      user: {
        email: session.user.email
      }
    }

    // Add search filter
    if (search) {
      where.OR = [
        {
          customer: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          invoiceNumber: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }

    // Add status filter
    if (status) {
      where.paymentStatus = status
    }

    // Fetch sales with related data
    const [sales, totalCount] = await Promise.all([
      prisma.sale.findMany({
        where,
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
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.sale.count({ where })
    ])

    // Calculate analytics
    const analytics = await prisma.sale.aggregate({
      where: {
        user: {
          email: session.user.email
        },
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) // This month
        }
      },
      _sum: {
        totalAmount: true,
        profitAmount: true
      },
      _count: {
        id: true
      }
    })

    // Transform sales data
    const transformedSales = sales.map(sale => ({
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
    }))

    return NextResponse.json({
      sales: transformedSales,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      analytics: {
        revenueThisMonth: analytics._sum.totalAmount || 0,
        profitThisMonth: analytics._sum.profitAmount || 0,
        salesCount: analytics._count.id || 0
      }
    })

  } catch (error) {
    console.error("Sales fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 })
  }
}

// POST /api/sales - Create new sale
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { 
      customerName, 
      customerEmail, 
      customerPhone, 
      products, 
      paymentMethod, 
      paymentStatus,
      discount,
      notes 
    } = data

    // Validate required fields
    if (!customerName || !products || products.length === 0) {
      return NextResponse.json({ 
        error: "Customer name and products are required" 
      }, { status: 400 })
    }

    // Validate products
    for (const product of products) {
      if (!product.name || product.qty <= 0 || product.price <= 0) {
        return NextResponse.json({ 
          error: "All products must have valid name, quantity, and price" 
        }, { status: 400 })
      }
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate totals
    const subtotal = products.reduce((sum, p) => sum + (p.qty * p.price), 0)
    const discountAmount = discount || 0
    const totalAmount = Math.max(0, subtotal - discountAmount)
    const profitAmount = Math.round(totalAmount * 0.2) // 20% profit margin

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create or find customer
      let customer = await tx.customer.findFirst({
        where: {
          userId: user.id,
          OR: [
            { email: customerEmail },
            { name: customerName }
          ]
        }
      })

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name: customerName,
            email: customerEmail || null,
            phone: customerPhone || null,
            userId: user.id
          }
        })
      } else {
        // Update customer info if provided
        if (customerEmail || customerPhone) {
          customer = await tx.customer.update({
            where: { id: customer.id },
            data: {
              email: customerEmail || customer.email,
              phone: customerPhone || customer.phone
            }
          })
        }
      }

      // Create sale
      const sale = await tx.sale.create({
        data: {
          invoiceNumber,
          customerId: customer.id,
          userId: user.id,
          subtotalAmount: subtotal,
          discountAmount,
          totalAmount,
          profitAmount,
          paymentMethod: paymentMethod || 'Cash',
          paymentStatus: paymentStatus || 'Paid',
          notes: notes || null
        }
      })

      // Create sale items
      const saleItems = await Promise.all(
        products.map(product => 
          tx.saleItem.create({
            data: {
              saleId: sale.id,
              productName: product.name,
              quantity: product.qty,
              unitPrice: product.price,
              totalPrice: product.qty * product.price,
              // Note: inventoryItemId can be added later when linking with inventory
            }
          })
        )
      )

      return {
        sale,
        customer,
        saleItems
      }
    })

    // Return formatted response
    const response = {
      id: result.sale.id,
      date: result.sale.createdAt.toISOString(),
      customerName: result.customer.name,
      customerEmail: result.customer.email,
      customerPhone: result.customer.phone,
      products: result.saleItems.map(item => ({
        id: item.id,
        name: item.productName,
        qty: item.quantity,
        price: item.unitPrice,
        total: item.totalPrice
      })),
      subtotal,
      discount: discountAmount,
      total: totalAmount,
      profit: profitAmount,
      paymentStatus: result.sale.paymentStatus,
      paymentMethod: result.sale.paymentMethod,
      billNo: result.sale.invoiceNumber,
      notes: result.sale.notes
    }

    return NextResponse.json({ sale: response }, { status: 201 })

  } catch (error) {
    console.error("Sale creation error:", error)
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 })
  }
}
