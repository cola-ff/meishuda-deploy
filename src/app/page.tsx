'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

// Types
interface ProductModel {
  id: string; name: string; spec: string | null; price: number; unit: string; order: number
}
interface Product {
  id: string; name: string; order: number; models: ProductModel[]
}
interface Customer {
  id: string; name: string; contact: string | null; phone: string | null
}
interface OrderItem {
  id: string; modelId: string; quantity: number; price: number; note: string | null
  model: ProductModel & { product: Product }
}
interface Order {
  id: string; orderDate: string; status: string; totalAmount: number
  note: string | null; customerNote: string | null; createdBy: string
  paymentReceived: boolean; invoiceIssued: boolean
  customer: Customer; items: OrderItem[]; createdAt: string
}
interface CartItem {
  modelId: string; modelName: string; spec: string; productName: string
  quantity: number; price: number; unit: string; note: string
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'bg-amber-100 text-amber-800' },
  confirmed: { label: '已确认', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: '已发货', color: 'bg-purple-100 text-purple-800' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-800' },
}

export default function Home() {
  const [view, setView] = useState<'home' | 'customer' | 'admin'>('home')
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [adminLoggedIn, setAdminLoggedIn] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data.products || [])
    }
    fetchProducts()
  }, [])

  // ============ HOME PAGE ============
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <span className="text-white text-2xl font-bold">M</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                每舒达订单系统
              </h1>
            </div>
            <p className="text-lg text-slate-500">客户在线下单 · 后台订单管理 · 数据导出</p>
          </div>

          {/* Entry Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="group cursor-pointer hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300 border-0 bg-white/80 backdrop-blur overflow-hidden"
              onClick={() => setView('customer')}>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 group-hover:from-indigo-500/10 group-hover:to-blue-500/10 transition-all" />
              <CardContent className="relative pt-10 pb-10 px-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">客户下单</h2>
                <p className="text-slate-500 leading-relaxed">经销商登录后选择植体型号、填写数量，在线提交订单</p>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-300 border-0 bg-white/80 backdrop-blur overflow-hidden"
              onClick={() => setView('admin')}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 group-hover:from-emerald-500/10 group-hover:to-teal-500/10 transition-all" />
              <CardContent className="relative pt-10 pb-10 px-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-200">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">管理后台</h2>
                <p className="text-slate-500 leading-relaxed">查看订单、管理客户、收款开票标记、备注、导出数据</p>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: '产品线', value: '3', icon: '📦' },
              { label: '植体型号', value: products.reduce((s, p) => s + p.models.length, 0) || '67', icon: '🔧' },
              { label: '在线访问', value: '24h', icon: '🌐' },
            ].map((s, i) => (
              <Card key={i} className="border-0 bg-white/60 backdrop-blur text-center py-6">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-bold text-slate-800">{s.value}</div>
                <div className="text-sm text-slate-400">{s.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ============ CUSTOMER LOGIN ============
  if (view === 'customer' && !customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl shadow-indigo-100 bg-white/90 backdrop-blur">
          <CardContent className="pt-10 pb-8 px-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">客户登录</h2>
              <p className="text-slate-400 mt-1">请输入经销商名称和密码</p>
            </div>
            <CustomerLoginForm onLogin={(c) => setCustomer(c)} onBack={() => setView('home')} />
          </CardContent>
        </Card>
      </div>
    )
  }

  // ============ CUSTOMER ORDER PAGE ============
  if (view === 'customer' && customer) {
    return <CustomerOrderPage customer={customer} products={products} onLogout={() => { setCustomer(null); setView('home') }} />
  }

  // ============ ADMIN LOGIN ============
  if (view === 'admin' && !adminLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl shadow-emerald-100 bg-white/90 backdrop-blur">
          <CardContent className="pt-10 pb-8 px-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">管理后台</h2>
              <p className="text-slate-400 mt-1">请输入管理密码</p>
            </div>
            <AdminLoginForm onLogin={() => setAdminLoggedIn(true)} onBack={() => setView('home')} />
          </CardContent>
        </Card>
      </div>
    )
  }

  // ============ ADMIN DASHBOARD ============
  if (view === 'admin' && adminLoggedIn) {
    return <AdminDashboard onLogout={() => { setAdminLoggedIn(false); setView('home') }} />
  }

  return null
}

// ============ CUSTOMER LOGIN FORM ============
function CustomerLoginForm({ onLogin, onBack }: { onLogin: (c: Customer) => void; onBack: () => void }) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleLogin = async () => {
    if (!name) { toast({ title: '请输入经销商名称', variant: 'destructive' }); return }
    setLoading(true)
    try {
      const res = await fetch('/api/customer/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password })
      })
      const data = await res.json()
      if (data.error) { toast({ title: data.error, variant: 'destructive' }) }
      else { onLogin(data.customer) }
    } catch { toast({ title: '登录失败', variant: 'destructive' }) }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-600 mb-1 block">经销商名称</label>
        <Input placeholder="请输入公司全称" value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()} className="h-12" />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-600 mb-1 block">密码</label>
        <Input type="password" placeholder="默认密码 123456" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()} className="h-12" />
      </div>
      <Button onClick={handleLogin} disabled={loading} className="w-full h-12 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-medium">
        {loading ? '登录中...' : '登 录'}
      </Button>
      <Button variant="ghost" onClick={onBack} className="w-full text-slate-400">← 返回首页</Button>
    </div>
  )
}

// ============ ADMIN LOGIN FORM ============
function AdminLoginForm({ onLogin, onBack }: { onLogin: () => void; onBack: () => void }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleLogin = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await res.json()
      if (data.error) { toast({ title: data.error, variant: 'destructive' }) }
      else { onLogin() }
    } catch { toast({ title: '登录失败', variant: 'destructive' }) }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-600 mb-1 block">管理密码</label>
        <Input type="password" placeholder="请输入管理密码" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()} className="h-12" />
      </div>
      <Button onClick={handleLogin} disabled={loading} className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium">
        {loading ? '登录中...' : '进入后台'}
      </Button>
      <Button variant="ghost" onClick={onBack} className="w-full text-slate-400">← 返回首页</Button>
    </div>
  )
}

// ============ CUSTOMER ORDER PAGE ============
function CustomerOrderPage({ customer, products, onLogout }: { customer: Customer; products: Product[]; onLogout: () => void }) {
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerNote, setCustomerNote] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [tab, setTab] = useState<'order' | 'history'>('order')
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch(`/api/customer/orders?customerId=${customer.id}`)
      const data = await res.json()
      setOrders(data.orders || [])
    }
    fetchOrders()
  }, [customer.id])

  const currentProduct = products.find(p => p.id === selectedProduct)

  const addToCart = (model: ProductModel, product: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.modelId === model.id)
      if (existing) return prev.map(c => c.modelId === model.id ? { ...c, quantity: c.quantity + 1 } : c)
      return [...prev, { modelId: model.id, modelName: model.name, spec: model.spec || '', productName: product.name, quantity: 1, price: model.price, unit: model.unit, note: '' }]
    })
    toast({ title: `已添加 ${model.name}` })
  }

  const updateCartQty = (modelId: string, qty: number) => {
    if (qty <= 0) { setCart(prev => prev.filter(c => c.modelId !== modelId)); return }
    setCart(prev => prev.map(c => c.modelId === modelId ? { ...c, quantity: qty } : c))
  }

  const updateCartNote = (modelId: string, note: string) => {
    setCart(prev => prev.map(c => c.modelId === modelId ? { ...c, note } : c))
  }

  const totalAmount = cart.reduce((s, c) => s + c.price * c.quantity, 0)
  const totalQty = cart.reduce((s, c) => s + c.quantity, 0)

  const submitOrder = async () => {
    if (cart.length === 0) { toast({ title: '请先选择型号', variant: 'destructive' }); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/customer/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          items: cart.map(c => ({ modelId: c.modelId, quantity: c.quantity, note: c.note || undefined })),
          customerNote
        })
      })
      const data = await res.json()
      if (data.error) { toast({ title: data.error, variant: 'destructive' }) }
      else {
        toast({ title: '下单成功！' })
        setCart([]); setCustomerNote('')
        fetchOrders(); setTab('history')
      }
    } catch { toast({ title: '下单失败', variant: 'destructive' }) }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Top Bar */}
      <div className="bg-white/80 backdrop-blur border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <div>
              <h1 className="font-bold text-slate-800">每舒达订单系统</h1>
              <p className="text-xs text-slate-400">{customer.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-slate-400">退出</Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs value={tab} onValueChange={v => setTab(v as 'order' | 'history')}>
          <TabsList className="bg-white/80 backdrop-blur mb-6">
            <TabsTrigger value="order">下单</TabsTrigger>
            <TabsTrigger value="history">我的订单</TabsTrigger>
          </TabsList>

          <TabsContent value="order">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Product Selection */}
              <div className="lg:col-span-2 space-y-6">
                {/* Product Line Selector */}
                <Card className="border-0 shadow-lg shadow-slate-100 bg-white/90 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">选择产品线</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {products.map(p => (
                        <button key={p.id}
                          onClick={() => setSelectedProduct(p.id)}
                          className={`p-4 rounded-xl text-center transition-all duration-200 ${selectedProduct === p.id
                            ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-200 scale-105'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                          <div className="font-bold text-sm">{p.name}</div>
                          <div className="text-xs mt-1 opacity-70">{p.models.length}个型号</div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Model Grid */}
                {currentProduct && (
                  <Card className="border-0 shadow-lg shadow-slate-100 bg-white/90 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{currentProduct.name} — 选择型号</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {currentProduct.models.map(m => {
                          const inCart = cart.find(c => c.modelId === m.id)
                          return (
                            <button key={m.id}
                              onClick={() => addToCart(m, currentProduct)}
                              className={`p-3 rounded-xl text-left transition-all duration-200 relative ${inCart
                                ? 'bg-indigo-50 border-2 border-indigo-300 shadow-md'
                                : 'bg-slate-50 border-2 border-transparent hover:border-indigo-200 hover:bg-indigo-50/50'}`}>
                              {inCart && (
                                <span className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                  {inCart.quantity}
                                </span>
                              )}
                              <div className="font-mono text-sm font-bold text-slate-800">{m.name}</div>
                              <div className="text-xs text-slate-400 mt-1">{m.spec}</div>
                            </button>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Cart */}
              <div className="lg:col-span-1">
                <Card className="border-0 shadow-lg shadow-slate-100 bg-white/90 backdrop-blur sticky top-20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>购物车</span>
                      {totalQty > 0 && <Badge className="bg-indigo-500">{totalQty}颗</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {cart.length === 0 ? (
                      <p className="text-center text-slate-300 py-8">请选择型号添加到购物车</p>
                    ) : (
                      <>
                        {cart.map(item => (
                          <div key={item.modelId} className="p-3 bg-slate-50 rounded-xl space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-mono text-sm font-bold">{item.modelName}</div>
                                <div className="text-xs text-slate-400">{item.productName} · {item.spec}</div>
                              </div>
                              <button onClick={() => setCart(prev => prev.filter(c => c.modelId !== item.modelId))}
                                className="text-slate-300 hover:text-red-400 text-lg leading-none">×</button>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center bg-white rounded-lg border">
                                <button onClick={() => updateCartQty(item.modelId, item.quantity - 1)}
                                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600">-</button>
                                <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                                <button onClick={() => updateCartQty(item.modelId, item.quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600">+</button>
                              </div>
                              <span className="text-xs text-slate-400">{item.unit}</span>
                            </div>
                            <Input placeholder="备注（选填）" value={item.note} onChange={e => updateCartNote(item.modelId, e.target.value)}
                              className="h-8 text-xs" />
                          </div>
                        ))}
                        <Separator />
                        <Textarea placeholder="订单备注（选填，如：对私、加急等）" value={customerNote}
                          onChange={e => setCustomerNote(e.target.value)} className="text-sm" rows={2} />
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-slate-500">合计</span>
                          <span className="text-xl font-bold text-indigo-600">{totalAmount > 0 ? `¥${totalAmount.toLocaleString()}` : `${totalQty}颗`}</span>
                        </div>
                        <Button onClick={submitOrder} disabled={submitting}
                          className="w-full h-12 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-medium text-base">
                          {submitting ? '提交中...' : '提交订单'}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-4">
              {orders.length === 0 ? (
                <Card className="border-0 shadow-lg shadow-slate-100 bg-white/90 backdrop-blur">
                  <CardContent className="py-16 text-center text-slate-300">暂无订单</CardContent>
                </Card>
              ) : orders.map(order => (
                <Card key={order.id} className="border-0 shadow-lg shadow-slate-100 bg-white/90 backdrop-blur">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-sm text-slate-400">{new Date(order.orderDate).toLocaleDateString('zh-CN')}</span>
                        <Badge className={`ml-2 ${STATUS_MAP[order.status]?.color || 'bg-gray-100'}`}>
                          {STATUS_MAP[order.status]?.label || order.status}
                        </Badge>
                      </div>
                      <span className="font-bold text-indigo-600">{order.totalAmount > 0 ? `¥${order.totalAmount.toLocaleString()}` : `${order.items.reduce((s, i) => s + i.quantity, 0)}颗`}</span>
                    </div>
                    <div className="space-y-2">
                      {order.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-sm py-1">
                          <span className="text-slate-600">
                            <span className="font-mono font-bold">{item.model.name}</span>
                            <span className="text-slate-400 ml-2">{item.model.spec}</span>
                          </span>
                          <span className="font-bold">{item.quantity}{item.model.unit}</span>
                        </div>
                      ))}
                    </div>
                    {order.customerNote && (
                      <div className="mt-3 p-2 bg-amber-50 rounded-lg text-sm text-amber-700">备注：{order.customerNote}</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// ============ ADMIN DASHBOARD ============
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<'dashboard' | 'orders' | 'customers'>('dashboard')
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [dashboard, setDashboard] = useState<any>(null)
  const [filterCustomer, setFilterCustomer] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [editNote, setEditNote] = useState('')
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name: '', contact: '', phone: '', password: '123456' })
  const { toast } = useToast()

  useEffect(() => {
    const load = async () => {
      const [dashRes, orderRes, custRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/orders'),
        fetch('/api/customers')
      ])
      setDashboard(await dashRes.json())
      const orderData = await orderRes.json()
      setOrders(orderData.orders || [])
      const custData = await custRes.json()
      setCustomers(custData.customers || [])
    }
    load()
  }, [])

  const updateOrder = async (id: string, data: any) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const result = await res.json()
    if (result.order) { fetchOrders(); fetchDashboard() }
    return result
  }

  const handleExport = () => {
    const params = new URLSearchParams()
    if (filterCustomer !== 'all') params.set('customerId', filterCustomer)
    window.open(`/api/export?${params}`, '_blank')
  }

  const addCustomer = async () => {
    if (!newCustomer.name) { toast({ title: '请输入客户名称', variant: 'destructive' }); return }
    const res = await fetch('/api/customers', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomer)
    })
    const data = await res.json()
    if (data.error) { toast({ title: data.error, variant: 'destructive' }) }
    else { toast({ title: '添加成功' }); setShowAddCustomer(false); setNewCustomer({ name: '', contact: '', phone: '', password: '123456' }); fetchCustomers() }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50">
      {/* Top Bar */}
      <div className="bg-white/80 backdrop-blur border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <h1 className="font-bold text-slate-800">每舒达 · 管理后台</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-slate-400">退出</Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={tab} onValueChange={v => setTab(v as any)}>
          <TabsList className="bg-white/80 backdrop-blur mb-6">
            <TabsTrigger value="dashboard">数据概览</TabsTrigger>
            <TabsTrigger value="orders">订单管理</TabsTrigger>
            <TabsTrigger value="customers">客户管理</TabsTrigger>
          </TabsList>

          {/* ===== DASHBOARD ===== */}
          <TabsContent value="dashboard">
            {dashboard && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: '总客户', value: dashboard.totalCustomers, icon: '👥', color: 'from-blue-500 to-indigo-600' },
                    { label: '总订单', value: dashboard.totalOrders, icon: '📋', color: 'from-indigo-500 to-purple-600' },
                    { label: '总金额', value: `¥${dashboard.totalAmount.toLocaleString()}`, icon: '💰', color: 'from-emerald-500 to-teal-600' },
                    { label: '待收款', value: dashboard.unpaidOrders, icon: '⏳', color: 'from-amber-500 to-orange-600' },
                    { label: '未开票', value: dashboard.uninvoicedOrders, icon: '🧾', color: 'from-rose-500 to-pink-600' },
                  ].map((s, i) => (
                    <Card key={i} className="border-0 shadow-lg shadow-slate-100 bg-white/90 backdrop-blur overflow-hidden">
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${s.color}`} />
                      <CardContent className="pt-6 pb-4 text-center">
                        <div className="text-2xl mb-1">{s.icon}</div>
                        <div className="text-2xl font-bold text-slate-800">{s.value}</div>
                        <div className="text-xs text-slate-400 mt-1">{s.label}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Product Stats */}
                {dashboard.productStats?.length > 0 && (
                  <Card className="border-0 shadow-lg shadow-slate-100 bg-white/90 backdrop-blur">
                    <CardHeader><CardTitle className="text-lg">产品出货统计</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        {dashboard.productStats.map((s: any, i: number) => (
                          <div key={i} className="p-4 bg-slate-50 rounded-xl text-center">
                            <div className="font-bold text-slate-800">{s.name}</div>
                            <div className="text-2xl font-bold text-indigo-600 mt-2">{s.quantity}颗</div>
                            <div className="text-sm text-slate-400">¥{s.amount.toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Customer Ranking */}
                {dashboard.customerRanking?.length > 0 && (
                  <Card className="border-0 shadow-lg shadow-slate-100 bg-white/90 backdrop-blur">
                    <CardHeader><CardTitle className="text-lg">客户排名</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {dashboard.customerRanking.map((c: any, i: number) => (
                          <div key={c.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50">
                            <div className="flex items-center gap-3">
                              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                {i + 1}
                              </span>
                              <span className="text-sm font-medium text-slate-700">{c.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-indigo-600">{c.orderCount}单</span>
                              <span className="text-slate-400 text-sm ml-2">¥{c.totalAmount.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* ===== ORDERS ===== */}
          <TabsContent value="orders">
            <div className="space-y-4">
              {/* Filters */}
              <Card className="border-0 shadow-lg shadow-slate-100 bg-white/90 backdrop-blur">
                <CardContent className="pt-5 pb-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Select value={filterCustomer} onValueChange={setFilterCustomer}>
                      <SelectTrigger className="w-56"><SelectValue placeholder="筛选客户" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部客户</SelectItem>
                        {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-36"><SelectValue placeholder="订单状态" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部状态</SelectItem>
                        {Object.entries(STATUS_MAP).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleExport} variant="outline" className="ml-auto gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      导出Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Order List */}
              {orders.length === 0 ? (
                <Card className="border-0 shadow-lg shadow-slate-100 bg-white/90 backdrop-blur">
                  <CardContent className="py-16 text-center text-slate-300">暂无订单</CardContent>
                </Card>
              ) : orders.map(order => (
                <Card key={order.id} className="border-0 shadow-lg shadow-slate-100 bg-white/90 backdrop-blur overflow-hidden">
                  <div className={`h-1 bg-gradient-to-r ${order.status === 'pending' ? 'from-amber-400 to-orange-500' : order.status === 'completed' ? 'from-emerald-400 to-teal-500' : 'from-blue-400 to-indigo-500'}`} />
                  <CardContent className="pt-5">
                    {/* Order Header */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="text-sm text-slate-400">{new Date(order.orderDate).toLocaleDateString('zh-CN')}</span>
                      <Badge className={STATUS_MAP[order.status]?.color || 'bg-gray-100'}>
                        {STATUS_MAP[order.status]?.label || order.status}
                      </Badge>
                      <Badge variant="outline" className={order.paymentReceived ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}>
                        {order.paymentReceived ? '✓ 已收款' : '✗ 未收款'}
                      </Badge>
                      <Badge variant="outline" className={order.invoiceIssued ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}>
                        {order.invoiceIssued ? '✓ 已开票' : '✗ 未开票'}
                      </Badge>
                      <span className="text-sm text-slate-500 ml-auto">{order.customer.name}</span>
                      <span className="font-bold text-indigo-600 text-lg">
                        {order.totalAmount > 0 ? `¥${order.totalAmount.toLocaleString()}` : `${order.items.reduce((s, i) => s + i.quantity, 0)}颗`}
                      </span>
                    </div>

                    {/* Order Items */}
                    <div className="bg-slate-50 rounded-xl p-3 mb-4">
                      {order.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-sm py-1.5">
                          <span>
                            <span className="font-mono font-bold text-slate-700">{item.model.name}</span>
                            <span className="text-slate-400 ml-2">{item.model.product.name}</span>
                            <span className="text-slate-300 ml-2">{item.model.spec}</span>
                          </span>
                          <span className="font-bold">{item.quantity}{item.model.unit}</span>
                        </div>
                      ))}
                    </div>

                    {/* Notes */}
                    {(order.customerNote || order.note) && (
                      <div className="flex gap-3 mb-4">
                        {order.customerNote && <div className="flex-1 p-2 bg-amber-50 rounded-lg text-sm text-amber-700">客户备注：{order.customerNote}</div>}
                        {order.note && <div className="flex-1 p-2 bg-blue-50 rounded-lg text-sm text-blue-700">管理备注：{order.note}</div>}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Select onValueChange={v => updateOrder(order.id, { status: v })}>
                        <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="改状态" /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_MAP).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant={order.paymentReceived ? "outline" : "default"}
                        className={`h-8 text-xs ${!order.paymentReceived ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
                        onClick={() => updateOrder(order.id, { paymentReceived: !order.paymentReceived })}>
                        {order.paymentReceived ? '取消收款' : '确认收款'}
                      </Button>
                      <Button size="sm" variant={order.invoiceIssued ? "outline" : "default"}
                        className={`h-8 text-xs ${!order.invoiceIssued ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                        onClick={() => updateOrder(order.id, { invoiceIssued: !order.invoiceIssued })}>
                        {order.invoiceIssued ? '取消开票' : '确认开票'}
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="h-8 text-xs"
                            onClick={() => { setEditingOrder(order); setEditNote(order.note || '') }}>
                            备注
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>编辑备注 — {order.customer.name}</DialogTitle></DialogHeader>
                          <Textarea value={editNote} onChange={e => setEditNote(e.target.value)} rows={4} placeholder="输入备注内容" />
                          <Button onClick={async () => {
                            await updateOrder(order.id, { note: editNote })
                            setEditingOrder(null)
                            toast({ title: '备注已保存' })
                          }}>保存备注</Button>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ===== CUSTOMERS ===== */}
          <TabsContent value="customers">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      添加客户
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>添加新客户</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <div><label className="text-sm font-medium text-slate-600 mb-1 block">公司名称 *</label>
                        <Input value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} placeholder="经销商全称" /></div>
                      <div><label className="text-sm font-medium text-slate-600 mb-1 block">联系人</label>
                        <Input value={newCustomer.contact} onChange={e => setNewCustomer({ ...newCustomer, contact: e.target.value })} placeholder="联系人姓名" /></div>
                      <div><label className="text-sm font-medium text-slate-600 mb-1 block">联系电话</label>
                        <Input value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} placeholder="手机号码" /></div>
                      <div><label className="text-sm font-medium text-slate-600 mb-1 block">登录密码</label>
                        <Input value={newCustomer.password} onChange={e => setNewCustomer({ ...newCustomer, password: e.target.value })} placeholder="默认123456" /></div>
                      <Button onClick={addCustomer} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white">添加</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.map(c => (
                  <Card key={c.id} className="border-0 shadow-lg shadow-slate-100 bg-white/90 backdrop-blur">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                          {c.name.charAt(0)}
                        </div>
                        <Badge variant="outline" className="text-xs">{c._count?.orders || 0}单</Badge>
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm mb-1">{c.name}</h3>
                      <div className="text-xs text-slate-400 space-y-0.5">
                        {c.contact && <div>联系人：{c.contact}</div>}
                        {c.phone && <div>电话：{c.phone}</div>}
                        <div>登录密码：{c.password}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
