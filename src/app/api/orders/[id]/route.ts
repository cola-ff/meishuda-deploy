import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const data: any = {}
    if (body.status !== undefined) data.status = body.status
    if (body.note !== undefined) data.note = body.note
    if (body.paymentReceived !== undefined) data.paymentReceived = body.paymentReceived
    if (body.invoiceIssued !== undefined) data.invoiceIssued = body.invoiceIssued
    const order = await prisma.order.update({
      where: { id }, data,
      include: { customer: true, items: { include: { model: { include: { product: true } } } } }
    })
    return NextResponse.json({ order })
  } catch (error) {
    return NextResponse.json({ error: '更新订单失败' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.orderItem.deleteMany({ where: { orderId: id } })
    await prisma.order.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: '删除订单失败' }, { status: 500 })
  }
}
