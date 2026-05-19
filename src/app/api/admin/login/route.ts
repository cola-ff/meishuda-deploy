import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    if (password === (process.env.ADMIN_PASSWORD || 'meishuda2024')) {
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: '密码错误' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: '登录失败' }, { status: 500 })
  }
}
