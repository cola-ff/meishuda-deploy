import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const where: any = {}
    if (customerId) where.customerId = customerId
    if (startDate || endDate) { where.orderDate = {}; if (startDate) where.orderDate.gte = new Date(startDate); if (endDate) where.orderDate.lte = new Date(endDate) }
    const orders = await prisma.order.findMany({
      where, orderBy: { orderDate: 'desc' },
      include: { customer: true, items: { include: { model: { include: { product: true } } } } }
    })
    const headers = ['订单日期', '经销商', '产品线', '型号', '规格', '数量', '单价', '金额', '是否收到款', '是否已开票', '客户备注', '管理员备注']
    const rows: string[][] = []
    for (const order of orders) {
      for (const item of order.items) {
        rows.push([
          new Date(order.orderDate).toLocaleDateString('zh-CN'), order.customer.name,
          item.model.product.name, item.model.name, item.model.spec || '',
          String(item.quantity), String(item.price), String(item.price * item.quantity),
          order.paymentReceived ? '是' : '否', order.invoiceIssued ? '是' : '否',
          order.customerNote || '', order.note || '',
        ])
      }
    }
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    return new NextResponse(csvContent, {
      headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename=orders_export_${new Date().toISOString().slice(0, 10)}.csv` }
    })
  } catch (error) {
    return NextResponse.json({ error: '导出失败' }, { status: 500 })
  }
}
