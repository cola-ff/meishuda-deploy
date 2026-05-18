import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { order: 'asc' },
      include: { models: { orderBy: { order: 'asc' } } }
    })
    return NextResponse.json({ products })
  } catch (error) {
    return NextResponse.json({ error: '获取产品失败' }, { status: 500 })
  }
}
