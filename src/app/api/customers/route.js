import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET /api/customers - Fetch customers for autocomplete/selection
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit')) || 50

    // Build where clause
    const where = {
      user: {
        email: session.user.email
      }
    }

    // Add search filter
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          email: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          phone: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }

    // Fetch customers
    const customers = await prisma.customer.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gstNumber: true,
        _count: {
          select: {
            sales: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      },
      take: limit
    })

    // Transform data
    const transformedCustomers = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      gstNumber: customer.gstNumber,
      salesCount: customer._count.sales
    }))

    return NextResponse.json({ customers: transformedCustomers })

  } catch (error) {
    console.error("Customers fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

// POST /api/customers - Create new customer
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { name, email, phone, address, gstNumber } = data

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json({ 
        error: "Customer name is required" 
      }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if customer already exists
    if (email) {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          userId: user.id,
          email: email.trim()
        }
      })

      if (existingCustomer) {
        return NextResponse.json({ 
          error: "Customer with this email already exists" 
        }, { status: 400 })
      }
    }

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        gstNumber: gstNumber?.trim() || null,
        userId: user.id
      }
    })

    return NextResponse.json({ 
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        gstNumber: customer.gstNumber
      }
    }, { status: 201 })

  } catch (error) {
    console.error("Customer creation error:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}
