import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const totalCustomers = await prisma.customer.count()
    const totalOrders = await prisma.order.count()
    const orders = await prisma.order.findMany({ select: { totalAmount: true } })
    const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0)
    const pendingOrders = await prisma.order.count({ where: { status: 'pending' } })
    const unpaidOrders = await prisma.order.count({ where: { paymentReceived: false } })
    const uninvoicedOrders = await prisma.order.count({ where: { invoiceIssued: false } })
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentOrders = await prisma.order.findMany({
      where: { orderDate: { gte: sevenDaysAgo } }, orderBy: { createdAt: 'desc' }, take: 10,
      include: { customer: true, items: { include: { model: { include: { product: true } } } } }
    })
    const allItems = await prisma.orderItem.findMany({ include: { model: { include: { product: true } } } })
    const productStats: Record<string, { name: string; quantity: number; amount: number }> = {}
    for (const item of allItems) {
      const pName = item.model.product.name
      if (!productStats[pName]) productStats[pName] = { name: pName, quantity: 0, amount: 0 }
      productStats[pName].quantity += item.quantity
      productStats[pName].amount += item.price * item.quantity
    }
    const customerRanking = await prisma.customer.findMany({ include: { orders: { select: { totalAmount: true } } } })
    const ranked = customerRanking.map(c => ({
      id: c.id, name: c.name,
      totalAmount: c.orders.reduce((sum, o) => sum + o.totalAmount, 0), orderCount: c.orders.length
    })).sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 10)
    return NextResponse.json({ totalCustomers, totalOrders, totalAmount, pendingOrders, unpaidOrders, uninvoicedOrders, recentOrders, productStats: Object.values(productStats), customerRanking: ranked })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: '获取数据失败' }, { status: 500 })
  }
}
