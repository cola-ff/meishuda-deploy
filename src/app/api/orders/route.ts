import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const status = searchParams.get('status')
    const where: any = {}
    if (customerId) where.customerId = customerId
    if (status) where.status = status
    const orders = await prisma.order.findMany({
      where, orderBy: { createdAt: 'desc' },
      include: { customer: true, items: { include: { model: { include: { product: true } } } } }
    })
    return NextResponse.json({ orders })
  } catch (error) {
    return NextResponse.json({ error: '获取订单失败' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { customerId, items, note, customerNote } = await request.json()
    if (!customerId || !items || items.length === 0) return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    let totalAmount = 0
    const itemData = []
    for (const item of items) {
      const model = await prisma.productModel.findUnique({ where: { id: item.modelId } })
      const price = model?.price || 0
      totalAmount += price * item.quantity
      itemData.push({ modelId: item.modelId, quantity: item.quantity, price, note: item.note || null })
    }
    const order = await prisma.order.create({
      data: { customerId, totalAmount, note, customerNote, createdBy: 'admin', items: { create: itemData } },
      include: { items: { include: { model: { include: { product: true } } } }, customer: true }
    })
    return NextResponse.json({ order })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: '创建订单失败' }, { status: 500 })
  }
}
