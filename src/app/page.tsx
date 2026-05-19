'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

interface ProductModel { id: string; name: string; spec: string | null; price: number; unit: string; order: number }
interface Product { id: string; name: string; order: number; models: ProductModel[] }
interface Customer { id: string; name: string; contact: string | null; phone: string | null }
interface OrderItem { id: string; modelId: string; quantity: number; price: number; note: string | null; model: ProductModel & { product: Product } }
interface Order { id: string; orderDate: string; status: string; totalAmount: number; note: string | null; customerNote: string | null; createdBy: string; paymentReceived: boolean; invoiceIssued: boolean; customer: Customer; items: OrderItem[]; createdAt: string }
interface CartItem { modelId: string; modelName: string; spec: string; productName: string; quantity: number; price: number; unit: string; note: string }

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'bg-amber-100 text-amber-800' },
  confirmed: { label: '已确认', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: '已发货', color: 'bg-purple-100 text-purple-800' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-800' },
}

export default function CustomerPage() {
  const [customer, setCustomer] = useState<Customer | null>(null)
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

  if (!customer) return <CustomerLogin onLogin={setCustomer} />
  return <CustomerOrderPage customer={customer} products={products} onLogout={() => setCustomer(null)} />
}

function CustomerLogin({ onLogin }: { onLogin: (c: Customer) => void }) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleLogin = async () => {
    if (!name) { toast({ title: '请输入经销商名称', variant: 'destructive' }); return }
    setLoading(true)
    try {
      const res = await fetch('/api/customer/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, password }) })
      const data = await res.json()
      if (data.error) toast({ title: data.error, variant: 'destructive' })
      else onLogin(data.customer)
    } catch { toast({ title: '登录失败', variant: 'destructive' }) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl shadow-indigo-100 bg-white/90 backdrop-blur">
        <CardContent className="pt-10 pb-8 px-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
              <span className="text-white text-2xl font-bold">M</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">每舒达 · 在线下单</h2>
            <p className="text-slate-400 mt-1">请输入经销商名称和密码登录</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">经销商名称</label>
              <Input placeholder="请输入公司全称" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} className="h-12" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">密码</label>
              <Input type="password" placeholder="默认密码 123456" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} className="h-12" />
            </div>
            <Button onClick={handleLogin} disabled={loading} className="w-full h-12 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-medium text-base">
              {loading ? '登录中...' : '登 录'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

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
        body: JSON.stringify({ customerId: customer.id, items: cart.map(c => ({ modelId: c.modelId, quantity: c.quantity, note: c.note || undefined })), customerNote })
      })
      const data = await res.json()
      if (data.error) toast({ title: data.error, variant: 'destructive' })
      else { toast({ title: '下单成功！' }); setCart([]); setCustomerNote(''); const fetchOrders = async () => { const r = await fetch(`/api/customer/orders?customerId=${customer.id}`); const d = await r.json(); setOrders(d.orders || []) }; fetchOrders(); setTab('history') }
    } catch { toast({ title: '下单失败', variant: 'destructive' }) }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-white/80 backdrop-blur border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center"><span className="text-white text-sm font-bold">M</span></div>
            <div><h1 className="font-bold text-slate-800">每舒达 · 在线下单</h1><p className="text-xs text-slate-400">{customer.name}</p></div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-slate-400">退出</Button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs value={tab} onValueChange={v => setTab(v as 'order' | 'history')}>
          <TabsList className="bg-white/80 backdrop-blur mb-6"><TabsTrigger value="order">下单</TabsTrigger><TabsTrigger value="history">我的订单</TabsTrigger></TabsList>
          <TabsContent value="order">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-0 shadow-lg shadow-slate-100 bg-white/90 backdrop-blur">
                  <CardHeader className="pb-3"><CardTitle className="text-lg">选择产品线</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {products.map(p => (
                        <button key={p.id} onClick={() => setSelectedProduct(p.id)} className={`p-4 rounded-xl text-center transition-all duration-200 ${selectedProduct === p.id ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-200 scale-105' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                          <div className="font-bold text-sm">{p.name}</div><div className="text-xs mt-1 opacity-70">{p.models.length}个型号</div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                {currentProduct && (
                  <Card className="border-0 shadow-lg shadow-slate-100 bg-white/90 backdrop-blur">
                    <CardHeader className="pb-3"><CardTitle className="text-lg">{currentProduct.name} — 选择型号</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {currentProduct.models.map(m => {
                          const inCart = cart.find(c => c.modelId === m.id)
                          return (
                            <button key={m.id} onClick={() => addToCart(m, currentProduct)} className={`p-3 rounded-xl text-left transition-all duration-200 relative ${inCart ? 'bg-indigo-50 border-2 border-indigo-300 shadow-md' : 'bg-slate-50 border-2 border-transparent hover:border-indigo-200 hover:bg-indigo-50/50'}`}>
                              {inCart && <span className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{inCart.quantity}</span>}
                              <div className="font-mono text-sm font-bold text-slate-800">{m.name}</div><div className="text-xs text-slate-400 mt-1">{m.spec}</div>
                            </button>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              <div className="lg:col-span-1">
                <Card className="border-0 shadow-lg shadow-slate-100 bg-white/90 backdrop-blur sticky top-20">
                  <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center justify-between"><span>购物车</span>{totalQty > 0 && <Badge className="bg-indigo-500">{totalQty}颗</Badge>}</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {cart.length === 0 ? <p className="text-center text-slate-300 py-8">请选择型号添加到购物车</p> : (
                      <>
                        {cart.map(item => (
                          <div key={item.modelId} className="p-3 bg-slate-50 rounded-xl space-y-2">
                            <div className="flex items-start justify-between">
                              <div><div className="font-mono text-sm font-bold">{item.modelName}</div><div className="text-xs text-slate-400">{item.productName} · {item.spec}</div></div>
                              <button onClick={() => setCart(prev => prev.filter(c => c.modelId !== item.modelId))} className="text-slate-300 hover:text-red-400 text-lg leading-none">×</button>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center bg-white rounded-lg border">
                                <button onClick={() => updateCartQty(item.modelId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600">-</button>
                                <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                                <button onClick={() => updateCartQty(item.modelId, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600">+</button>
                              </div>
                              <span className="text-xs text-slate-400">{item.unit}</span>
                            </div>
                            <Input placeholder="备注（选填）" value={item.note} onChange={e => updateCartNote(item.modelId, e.target.value)} className="h-8 text-xs" />
                          </div>
                        ))}
                        <Separator />
                        <Textarea placeholder="订单备注（选填，如：对私、加急等）" value={customerNote} onChange={e => setCustomerNote(e.target.value)} className="text-sm" rows={2} />
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-slate-500">合计</span>
                          <span className="text-xl font-bold text-indigo-600">{totalAmount > 0 ? `¥${totalAmount.toLocaleString()}` : `${totalQty}颗`}</span>
                        </div>
                        <Button onClick={submitOrder} disabled={submitting} className="w-full h-12 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-medium text-base">
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
              {orders.length === 0 ? <Card className="border-0 shadow-lg shadow-slate-100 bg-white/90 backdrop-blur"><CardContent className="py-16 text-center text-slate-300">暂无订单</CardContent></Card> : orders.map(order => (
                <Card key={order.id} className="border-0 shadow-lg shadow-slate-100 bg-white/90 backdrop-blur">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div><span className="text-sm text-slate-400">{new Date(order.orderDate).toLocaleDateString('zh-CN')}</span><Badge className={`ml-2 ${STATUS_MAP[order.status]?.color || 'bg-gray-100'}`}>{STATUS_MAP[order.status]?.label || order.status}</Badge></div>
                      <span className="font-bold text-indigo-600">{order.totalAmount > 0 ? `¥${order.totalAmount.toLocaleString()}` : `${order.items.reduce((s, i) => s + i.quantity, 0)}颗`}</span>
                    </div>
                    <div className="space-y-2">{order.items.map(item => (<div key={item.id} className="flex items-center justify-between text-sm py-1"><span className="text-slate-600"><span className="font-mono font-bold">{item.model.name}</span><span className="text-slate-400 ml-2">{item.model.spec}</span></span><span className="font-bold">{item.quantity}{item.model.unit}</span></div>))}</div>
                    {order.customerNote && <div className="mt-3 p-2 bg-amber-50 rounded-lg text-sm text-amber-700">备注：{order.customerNote}</div>}
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
