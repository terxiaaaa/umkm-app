// Importers: App.tsx router. Transactions page — tabs for Pembelian, Penjualan, Pengeluaran.
import { useState } from 'react'
import { useApp } from '../lib/context'
import { createPurchase, cancelPurchase, canSell, createSale, cancelSale, createExpense, updateExpense, cancelExpense } from '../lib/operations'
import { formatRupiah, formatDate, todayISO } from '../lib/utils'
import ConfirmDialog from '../components/ConfirmDialog'
import { Plus, ShoppingCart, TrendingUp, Wallet, Trash2, Pencil, Ban } from 'lucide-react'
import type { Expense } from '../types'

type Tab = 'pembelian' | 'penjualan' | 'pengeluaran'

interface PurchaseItemForm { productId: string; quantity: string; buyPrice: string }
interface SaleItemForm { productId: string; quantity: string; sellPrice: string }

const inputCls = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
const btnPrimary = 'flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors'
const btnSecondary = 'px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
const badgeCls: Record<string, string> = {
  green: 'inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700',
  yellow: 'inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700',
  red: 'inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700',
  blue: 'inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700',
  purple: 'inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700',
}

export default function TransactionsPage() {
  const { data, setData, toast } = useApp()
  const [tab, setTab] = useState<Tab>('pembelian')

  // ── Pembelian state ──
  const [showPurchaseForm, setShowPurchaseForm] = useState(false)
  const [purDate, setPurDate] = useState(todayISO())
  const [purSupplier, setPurSupplier] = useState('')
  const [purStatus, setPurStatus] = useState<'lunas' | 'belum_lunas'>('lunas')
  const [purNote, setPurNote] = useState('')
  const [purItems, setPurItems] = useState<PurchaseItemForm[]>([{ productId: '', quantity: '', buyPrice: '' }])
  const [cancelPurId, setCancelPurId] = useState<string | null>(null)

  // ── Penjualan state ──
  const [showSaleForm, setShowSaleForm] = useState(false)
  const [saleDate, setSaleDate] = useState(todayISO())
  const [saleMethod, setSaleMethod] = useState<'tunai' | 'transfer' | 'qris' | 'lainnya'>('tunai')
  const [saleNote, setSaleNote] = useState('')
  const [saleItems, setSaleItems] = useState<SaleItemForm[]>([{ productId: '', quantity: '', sellPrice: '' }])
  const [cancelSaleId, setCancelSaleId] = useState<string | null>(null)

  // ── Pengeluaran state ──
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [expDate, setExpDate] = useState(todayISO())
  const [expName, setExpName] = useState('')
  const [expCategory, setExpCategory] = useState(data.settings.expenseCategories[0] ?? '')
  const [expAmount, setExpAmount] = useState('')
  const [expMethod, setExpMethod] = useState('tunai')
  const [expNote, setExpNote] = useState('')
  const [cancelExpId, setCancelExpId] = useState<string | null>(null)

  const activeProducts = data.products.filter(p => !p.archived)

  // ── Helpers ──
  const resetPurchaseForm = () => {
    setPurDate(todayISO()); setPurSupplier(''); setPurStatus('lunas'); setPurNote('')
    setPurItems([{ productId: '', quantity: '', buyPrice: '' }])
    setShowPurchaseForm(false)
  }

  const resetSaleForm = () => {
    setSaleDate(todayISO()); setSaleMethod('tunai'); setSaleNote('')
    setSaleItems([{ productId: '', quantity: '', sellPrice: '' }])
    setShowSaleForm(false)
  }

  const resetExpenseForm = () => {
    setExpDate(todayISO()); setExpName(''); setExpCategory(data.settings.expenseCategories[0] ?? '')
    setExpAmount(''); setExpMethod('tunai'); setExpNote('')
    setEditingExpense(null); setShowExpenseForm(false)
  }

  const updatePurItem = (i: number, key: keyof PurchaseItemForm, val: string) => {
    setPurItems(prev => prev.map((it, idx) => idx === i ? { ...it, [key]: val } : it))
  }

  const updateSaleItem = (i: number, key: keyof SaleItemForm, val: string) => {
    setSaleItems(prev => prev.map((it, idx) => idx === i ? { ...it, [key]: val } : it))
  }

  // Auto-fill price when product selected
  const onPurProductSelect = (i: number, productId: string) => {
    const prod = activeProducts.find(p => p.id === productId)
    setPurItems(prev => prev.map((it, idx) => idx === i ? { ...it, productId, buyPrice: prod ? String(prod.buyPrice) : '' } : it))
  }

  const onSaleProductSelect = (i: number, productId: string) => {
    const prod = activeProducts.find(p => p.id === productId)
    setSaleItems(prev => prev.map((it, idx) => idx === i ? { ...it, productId, sellPrice: prod ? String(prod.sellPrice) : '' } : it))
  }

  // ── Submit handlers ──
  const submitPurchase = (e: React.FormEvent) => {
    e.preventDefault()
    const items = purItems.filter(it => it.productId)
    if (items.length === 0) { toast('Tambahkan minimal 1 item', 'error'); return }
    for (const it of items) {
      const q = Number(it.quantity); const bp = Number(it.buyPrice)
      if (q <= 0 || bp <= 0) { toast('Jumlah dan harga beli harus > 0', 'error'); return }
    }
    setData(d => createPurchase(d, {
      date: purDate,
      items: items.map(it => ({ productId: it.productId, quantity: Number(it.quantity), buyPrice: Number(it.buyPrice) })),
      supplier: purSupplier,
      paymentStatus: purStatus,
      note: purNote,
    }))
    toast('Pembelian berhasil dicatat')
    resetPurchaseForm()
  }

  const submitSale = (e: React.FormEvent) => {
    e.preventDefault()
    const items = saleItems.filter(it => it.productId)
    if (items.length === 0) { toast('Tambahkan minimal 1 item', 'error'); return }
    for (const it of items) {
      const q = Number(it.quantity); const sp = Number(it.sellPrice)
      if (q <= 0 || sp <= 0) { toast('Jumlah dan harga jual harus > 0', 'error'); return }
    }
    const mapped = items.map(it => ({ productId: it.productId, quantity: Number(it.quantity), sellPrice: Number(it.sellPrice) }))
    const err = canSell(data, mapped)
    if (err) { toast(err, 'error'); return }
    setData(d => createSale(d, { date: saleDate, items: mapped, paymentMethod: saleMethod, note: saleNote }))
    toast('Penjualan berhasil dicatat')
    resetSaleForm()
  }

  const submitExpense = (e: React.FormEvent) => {
    e.preventDefault()
    const name = expName.trim()
    const amount = Number(expAmount)
    if (!name) { toast('Nama pengeluaran wajib diisi', 'error'); return }
    if (amount <= 0) { toast('Jumlah harus > 0', 'error'); return }
    if (editingExpense) {
      setData(d => updateExpense(d, editingExpense.id, { date: expDate, name, category: expCategory, amount, paymentMethod: expMethod, note: expNote }))
      toast('Pengeluaran berhasil diperbarui')
    } else {
      setData(d => createExpense(d, { date: expDate, name, category: expCategory, amount, paymentMethod: expMethod, note: expNote }))
      toast('Pengeluaran berhasil dicatat')
    }
    resetExpenseForm()
  }

  const openEditExpense = (exp: Expense) => {
    setEditingExpense(exp)
    setExpDate(exp.date); setExpName(exp.name); setExpCategory(exp.category)
    setExpAmount(String(exp.amount)); setExpMethod(exp.paymentMethod); setExpNote(exp.note)
    setShowExpenseForm(true)
  }

  // ── Computed lists ──
  const purchases = [...data.purchases].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const sales = [...data.sales].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const expenses = [...data.expenses].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const purItemSubtotal = (it: PurchaseItemForm) => (Number(it.quantity) || 0) * (Number(it.buyPrice) || 0)
  const saleItemSubtotal = (it: SaleItemForm) => (Number(it.quantity) || 0) * (Number(it.sellPrice) || 0)
  const purTotal = purItems.reduce((s, it) => s + purItemSubtotal(it), 0)
  const saleTotal = saleItems.reduce((s, it) => s + saleItemSubtotal(it), 0)

  const getStock = (productId: string) => data.products.find(p => p.id === productId)?.stock ?? 0

  const tabs: { key: Tab; label: string; icon: typeof ShoppingCart }[] = [
    { key: 'pembelian', label: 'Pembelian', icon: ShoppingCart },
    { key: 'penjualan', label: 'Penjualan', icon: TrendingUp },
    { key: 'pengeluaran', label: 'Pengeluaran', icon: Wallet },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-4">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════════ TAB: PEMBELIAN ════════════ */}
      {tab === 'pembelian' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Pembelian</h2>
            <button onClick={() => setShowPurchaseForm(true)} className={btnPrimary}>
              <Plus size={16} /> Catat Pembelian
            </button>
          </div>

          {purchases.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-12">Belum ada pembelian.</p>
          ) : (
            <div className="space-y-2">
              {purchases.map(p => (
                <div key={p.id} className={`border border-gray-200 rounded-lg bg-white px-4 py-3 ${p.cancelled ? 'opacity-60' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className={p.cancelled ? 'line-through' : ''}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900">{formatDate(p.date)}</span>
                        {p.supplier && <span className="text-xs text-gray-500">{p.supplier}</span>}
                        <span className={badgeCls[p.paymentStatus === 'lunas' ? 'green' : 'yellow']}>
                          {p.paymentStatus === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                        </span>
                        {p.cancelled && <span className={badgeCls.red}>Dibatalkan</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{formatRupiah(p.total)}</span>
                        <span>{p.items.length} item</span>
                      </div>
                    </div>
                    {!p.cancelled && (
                      <button onClick={() => setCancelPurId(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Ban size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Purchase Form Modal */}
          {showPurchaseForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40" onClick={resetPurchaseForm} />
              <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Catat Pembelian</h2>
                <form onSubmit={submitPurchase} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                      <input type="date" value={purDate} onChange={e => setPurDate(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status Bayar</label>
                      <select value={purStatus} onChange={e => setPurStatus(e.target.value as 'lunas' | 'belum_lunas')} className={inputCls}>
                        <option value="lunas">Lunas</option>
                        <option value="belum_lunas">Belum Lunas</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <input type="text" value={purSupplier} onChange={e => setPurSupplier(e.target.value)} placeholder="Opsional" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                    <input type="text" value={purNote} onChange={e => setPurNote(e.target.value)} placeholder="Opsional" className={inputCls} />
                  </div>

                  {/* Item Rows */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Item</label>
                    <div className="space-y-2">
                      {purItems.map((it, i) => (
                        <div key={i} className="flex gap-2 items-start">
                          <select value={it.productId} onChange={e => onPurProductSelect(i, e.target.value)} className={inputCls + ' flex-[2]'}>
                            <option value="">Pilih barang</option>
                            {activeProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                          <input type="number" min="1" placeholder="Qty" value={it.quantity} onChange={e => updatePurItem(i, 'quantity', e.target.value)} className={inputCls + ' flex-1'} />
                          <input type="number" min="0" placeholder="Harga" value={it.buyPrice} onChange={e => updatePurItem(i, 'buyPrice', e.target.value)} className={inputCls + ' flex-1'} />
                          <div className="flex items-center gap-1 pt-2">
                            <span className="text-xs text-gray-500 whitespace-nowrap w-20 text-right">{formatRupiah(purItemSubtotal(it))}</span>
                            {purItems.length > 1 && (
                              <button type="button" onClick={() => setPurItems(prev => prev.filter((_, idx) => idx !== i))} className="p-1 text-red-400 hover:text-red-600">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => setPurItems(prev => [...prev, { productId: '', quantity: '', buyPrice: '' }])} className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                      <Plus size={14} /> Tambah Item
                    </button>
                    <div className="text-right text-sm font-semibold text-gray-900 mt-2">Total: {formatRupiah(purTotal)}</div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={resetPurchaseForm} className={btnSecondary}>Batal</button>
                    <button type="submit" className={btnPrimary}>Simpan</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════ TAB: PENJUALAN ════════════ */}
      {tab === 'penjualan' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Penjualan</h2>
            <button onClick={() => setShowSaleForm(true)} className={btnPrimary}>
              <Plus size={16} /> Catat Penjualan
            </button>
          </div>

          {sales.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-12">Belum ada penjualan.</p>
          ) : (
            <div className="space-y-2">
              {sales.map(s => {
                const methodLabel: Record<string, string> = { tunai: 'Tunai', transfer: 'Transfer', qris: 'QRIS', lainnya: 'Lainnya' }
                return (
                  <div key={s.id} className={`border border-gray-200 rounded-lg bg-white px-4 py-3 ${s.cancelled ? 'opacity-60' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className={s.cancelled ? 'line-through' : ''}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-900">{formatDate(s.date)}</span>
                          <span className={badgeCls.blue}>{methodLabel[s.paymentMethod] ?? s.paymentMethod}</span>
                          {s.cancelled && <span className={badgeCls.red}>Dibatalkan</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{formatRupiah(s.total)}</span>
                          <span>{s.items.length} item</span>
                        </div>
                      </div>
                      {!s.cancelled && (
                        <button onClick={() => setCancelSaleId(s.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Ban size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Sale Form Modal */}
          {showSaleForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40" onClick={resetSaleForm} />
              <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Catat Penjualan</h2>
                <form onSubmit={submitSale} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                      <input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Metode Bayar</label>
                      <select value={saleMethod} onChange={e => setSaleMethod(e.target.value as 'tunai' | 'transfer' | 'qris' | 'lainnya')} className={inputCls}>
                        <option value="tunai">Tunai</option>
                        <option value="transfer">Transfer</option>
                        <option value="qris">QRIS</option>
                        <option value="lainnya">Lainnya</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                    <input type="text" value={saleNote} onChange={e => setSaleNote(e.target.value)} placeholder="Opsional" className={inputCls} />
                  </div>

                  {/* Item Rows */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Item</label>
                    <div className="space-y-2">
                      {saleItems.map((it, i) => {
                        const stock = getStock(it.productId)
                        return (
                          <div key={i} className="flex gap-2 items-start">
                            <select value={it.productId} onChange={e => onSaleProductSelect(i, e.target.value)} className={inputCls + ' flex-[2]'}>
                              <option value="">Pilih barang</option>
                              {activeProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <div className="flex-1 relative">
                              <input type="number" min="1" placeholder="Qty" value={it.quantity} onChange={e => updateSaleItem(i, 'quantity', e.target.value)} className={inputCls} />
                              {it.productId && <span className="absolute -bottom-4 left-0 text-[10px] text-gray-400">Stok: {stock}</span>}
                            </div>
                            <input type="number" min="0" placeholder="Harga" value={it.sellPrice} onChange={e => updateSaleItem(i, 'sellPrice', e.target.value)} className={inputCls + ' flex-1'} />
                            <div className="flex items-center gap-1 pt-2">
                              <span className="text-xs text-gray-500 whitespace-nowrap w-20 text-right">{formatRupiah(saleItemSubtotal(it))}</span>
                              {saleItems.length > 1 && (
                                <button type="button" onClick={() => setSaleItems(prev => prev.filter((_, idx) => idx !== i))} className="p-1 text-red-400 hover:text-red-600">
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <button type="button" onClick={() => setSaleItems(prev => [...prev, { productId: '', quantity: '', sellPrice: '' }])} className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                      <Plus size={14} /> Tambah Item
                    </button>
                    <div className="text-right text-sm font-semibold text-gray-900 mt-2">Total: {formatRupiah(saleTotal)}</div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={resetSaleForm} className={btnSecondary}>Batal</button>
                    <button type="submit" className={btnPrimary}>Simpan</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════ TAB: PENGELUARAN ════════════ */}
      {tab === 'pengeluaran' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Pengeluaran</h2>
            <button onClick={() => { resetExpenseForm(); setShowExpenseForm(true) }} className={btnPrimary}>
              <Plus size={16} /> Catat Pengeluaran
            </button>
          </div>

          {expenses.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-12">Belum ada pengeluaran.</p>
          ) : (
            <div className="space-y-2">
              {expenses.map(exp => (
                <div key={exp.id} className={`border border-gray-200 rounded-lg bg-white px-4 py-3 ${exp.cancelled ? 'opacity-60' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className={exp.cancelled ? 'line-through' : ''}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900">{exp.name}</span>
                        <span className={badgeCls.purple}>{exp.category}</span>
                        {exp.cancelled && <span className={badgeCls.red}>Dibatalkan</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{formatDate(exp.date)}</span>
                        <span>{formatRupiah(exp.amount)}</span>
                      </div>
                    </div>
                    {!exp.cancelled && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditExpense(exp)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => setCancelExpId(exp.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Ban size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Expense Form Modal */}
          {showExpenseForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40" onClick={resetExpenseForm} />
              <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingExpense ? 'Edit Pengeluaran' : 'Catat Pengeluaran'}
                </h2>
                <form onSubmit={submitExpense} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                    <input type="date" value={expDate} onChange={e => setExpDate(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pengeluaran *</label>
                    <input type="text" value={expName} onChange={e => setExpName(e.target.value)} required className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                      <select value={expCategory} onChange={e => setExpCategory(e.target.value)} className={inputCls}>
                        {data.settings.expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp) *</label>
                      <input type="number" min="1" value={expAmount} onChange={e => setExpAmount(e.target.value)} required className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Metode Bayar</label>
                    <select value={expMethod} onChange={e => setExpMethod(e.target.value)} className={inputCls}>
                      <option value="tunai">Tunai</option>
                      <option value="transfer">Transfer</option>
                      <option value="qris">QRIS</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                    <input type="text" value={expNote} onChange={e => setExpNote(e.target.value)} placeholder="Opsional" className={inputCls} />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={resetExpenseForm} className={btnSecondary}>Batal</button>
                    <button type="submit" className={btnPrimary}>{editingExpense ? 'Simpan' : 'Catat'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Confirm Dialogs ── */}
      <ConfirmDialog
        open={cancelPurId !== null}
        onClose={() => setCancelPurId(null)}
        onConfirm={() => { if (cancelPurId) { setData(d => cancelPurchase(d, cancelPurId)); toast('Pembelian dibatalkan') } }}
        title="Batalkan Pembelian"
        message="Stok akan dikembalikan. Yakin membatalkan pembelian ini?"
      />
      <ConfirmDialog
        open={cancelSaleId !== null}
        onClose={() => setCancelSaleId(null)}
        onConfirm={() => { if (cancelSaleId) { setData(d => cancelSale(d, cancelSaleId)); toast('Penjualan dibatalkan') } }}
        title="Batalkan Penjualan"
        message="Stok akan dikembalikan. Yakin membatalkan penjualan ini?"
      />
      <ConfirmDialog
        open={cancelExpId !== null}
        onClose={() => setCancelExpId(null)}
        onConfirm={() => { if (cancelExpId) { setData(d => cancelExpense(d, cancelExpId)); toast('Pengeluaran dibatalkan') } }}
        title="Batalkan Pengeluaran"
        message="Yakin membatalkan pengeluaran ini?"
      />
    </div>
  )
}
