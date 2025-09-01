import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET /api/sales/analytics - Get detailed sales analytics
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // month, week, year
    
    // Calculate date ranges
    const now = new Date()
    let startDate

    switch (period) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }

    const whereClause = {
      user: {
        email: session.user.email
      },
      createdAt: {
        gte: startDate
      }
    }

    // Get overall analytics
    const analytics = await prisma.sale.aggregate({
      where: whereClause,
      _sum: {
        totalAmount: true,
        profitAmount: true,
        discountAmount: true
      },
      _count: {
        id: true
      },
      _avg: {
        totalAmount: true
      }
    })

    // Get payment method breakdown
    const paymentMethods = await prisma.sale.groupBy({
      by: ['paymentMethod'],
      where: whereClause,
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    })

    // Get payment status breakdown
    const paymentStatus = await prisma.sale.groupBy({
      by: ['paymentStatus'],
      where: whereClause,
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    })

    // Get top customers
    const topCustomers = await prisma.customer.findMany({
      where: {
        user: {
          email: session.user.email
        },
        sales: {
          some: {
            createdAt: {
              gte: startDate
            }
          }
        }
      },
      include: {
        _count: {
          select: {
            sales: {
              where: {
                createdAt: {
                  gte: startDate
                }
              }
            }
          }
        },
        sales: {
          where: {
            createdAt: {
              gte: startDate
            }
          },
          select: {
            totalAmount: true
          }
        }
      },
      take: 5
    })

    // Get top products
    const topProducts = await prisma.saleItem.groupBy({
      by: ['productName'],
      where: {
        sale: {
          user: {
            email: session.user.email
          },
          createdAt: {
            gte: startDate
          }
        }
      },
      _sum: {
        quantity: true,
        totalPrice: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    })

    // Get daily sales for chart (last 30 days)
    const chartStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const dailySales = await prisma.sale.groupBy({
      by: ['createdAt'],
      where: {
        user: {
          email: session.user.email
        },
        createdAt: {
          gte: chartStartDate
        }
      },
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    })

    // Process daily sales data
    const salesChart = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      
      const daySales = dailySales.filter(sale => 
        sale.createdAt.toISOString().split('T')[0] === dateStr
      )
      
      const totalAmount = daySales.reduce((sum, sale) => sum + (sale._sum.totalAmount || 0), 0)
      const totalCount = daySales.reduce((sum, sale) => sum + (sale._count.id || 0), 0)
      
      salesChart.push({
        date: dateStr,
        amount: totalAmount,
        count: totalCount
      })
    }

    // Format response
    const response = {
      period,
      overview: {
        totalRevenue: analytics._sum.totalAmount || 0,
        totalProfit: analytics._sum.profitAmount || 0,
        totalDiscount: analytics._sum.discountAmount || 0,
        totalSales: analytics._count.id || 0,
        averageOrderValue: analytics._avg.totalAmount || 0
      },
      paymentMethods: paymentMethods.map(pm => ({
        method: pm.paymentMethod,
        amount: pm._sum.totalAmount || 0,
        count: pm._count.id || 0
      })),
      paymentStatus: paymentStatus.map(ps => ({
        status: ps.paymentStatus,
        amount: ps._sum.totalAmount || 0,
        count: ps._count.id || 0
      })),
      topCustomers: topCustomers.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        salesCount: customer._count.sales,
        totalSpent: customer.sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
      })),
      topProducts: topProducts.map(product => ({
        name: product.productName,
        quantitySold: product._sum.quantity || 0,
        revenue: product._sum.totalPrice || 0,
        salesCount: product._count.id || 0
      })),
      salesChart
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error("Sales analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
