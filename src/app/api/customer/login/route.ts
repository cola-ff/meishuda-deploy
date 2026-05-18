import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { name, password } = await request.json()
    const customer = await prisma.customer.findUnique({ where: { name } })
    if (!customer) return NextResponse.json({ error: '客户不存在' }, { status: 404 })
    if (customer.password !== password) return NextResponse.json({ error: '密码错误' }, { status: 401 })
    return NextResponse.json({ customer: { id: customer.id, name: customer.name, contact: customer.contact, phone: customer.phone } })
  } catch (error) {
    return NextResponse.json({ error: '登录失败' }, { status: 500 })
  }
}
