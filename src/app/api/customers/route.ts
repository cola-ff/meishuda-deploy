import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { orders: true } } }
    })
    return NextResponse.json({ customers })
  } catch (error) {
    return NextResponse.json({ error: '获取客户列表失败' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, contact, phone, address, password, note } = await request.json()
    if (!name) return NextResponse.json({ error: '客户名称不能为空' }, { status: 400 })
    const existing = await prisma.customer.findUnique({ where: { name } })
    if (existing) return NextResponse.json({ error: '客户已存在' }, { status: 409 })
    const customer = await prisma.customer.create({ data: { name, contact, phone, address, password: password || '123456', note } })
    return NextResponse.json({ customer })
  } catch (error) {
    return NextResponse.json({ error: '创建客户失败' }, { status: 500 })
  }
}
