// Importers: App.tsx router. Products CRUD page — list, search, filter, add/edit, archive, stock movement history.
import { useState, useMemo } from 'react'
import { useApp } from '../lib/context'
import { createProduct, updateProduct, archiveProduct } from '../lib/operations'
import { formatRupiah, formatDate, formatDateTime } from '../lib/utils'

import ConfirmDialog from '../components/ConfirmDialog'
import { Plus, Search, ChevronDown, ChevronUp, Pencil, Archive, Package, ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react'
import type { Product } from '../types'

type StockFilter = 'semua' | 'menipis' | 'aman'

interface ProductForm {
  name: string
  sku: string
  category: string
  unit: string
  buyPrice: string
  sellPrice: string
  minStock: string
  expiryDate: string
}

const emptyForm = (settings: { categories: string[]; units: string[] }): ProductForm => ({
  name: '',
  sku: '',
  category: settings.categories[0] ?? '',
  unit: settings.units[0] ?? '',
  buyPrice: '0',
  sellPrice: '0',
  minStock: '5',
  expiryDate: '',
})

const formFromProduct = (p: Product): ProductForm => ({
  name: p.name,
  sku: p.sku,
  category: p.category,
  unit: p.unit,
  buyPrice: String(p.buyPrice),
  sellPrice: String(p.sellPrice),
  minStock: String(p.minStock),
  expiryDate: p.expiryDate ?? '',
})

export default function ProductsPage() {
  const { data, setData, toast } = useApp()
  const { settings } = data

  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [stockFilter, setStockFilter] = useState<StockFilter>('semua')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm(settings))
  const [confirmArchive, setConfirmArchive] = useState<string | null>(null)

  const products = useMemo(() => {
    let list = data.products.filter(p => !p.archived)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q))
    }
    if (catFilter) list = list.filter(p => p.category === catFilter)
    if (stockFilter === 'menipis') list = list.filter(p => p.stock <= p.minStock)
    if (stockFilter === 'aman') list = list.filter(p => p.stock > p.minStock)
    return list
  }, [data.products, search, catFilter, stockFilter])

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm(settings))
    setModalOpen(true)
  }

  const openEdit = (p: Product) => {
    setEditingId(p.id)
    setForm(formFromProduct(p))
    setModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = form.name.trim()
    if (!name) return
    const buyPrice = Math.max(0, Number(form.buyPrice) || 0)
    const sellPrice = Math.max(0, Number(form.sellPrice) || 0)
    const minStock = Math.max(0, Number(form.minStock) || 0)

    if (editingId) {
      setData(d => updateProduct(d, editingId, {
        name,
        sku: form.sku.trim(),
        category: form.category,
        unit: form.unit,
        buyPrice,
        sellPrice,
        minStock,
        expiryDate: form.expiryDate || null,
      }))
      toast('Barang berhasil diperbarui')
    } else {
      setData(d => createProduct(d, {
        name,
        sku: form.sku.trim(),
        category: form.category,
        unit: form.unit,
        buyPrice,
        sellPrice,
        minStock,
        expiryDate: form.expiryDate || null,
      }))
      toast('Barang berhasil ditambahkan')
    }
    setModalOpen(false)
  }

  const handleArchive = (id: string) => {
    setData(d => archiveProduct(d, id))
    toast('Barang diarsipkan')
    if (expandedId === id) setExpandedId(null)
  }

  const movementsFor = (productId: string) =>
    data.stockMovements
      .filter(m => m.productId === productId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const movementBadge = (type: string) => {
    if (type === 'in') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><ArrowDownCircle size={12} /> Masuk</span>
    if (type === 'out') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"><ArrowUpCircle size={12} /> Keluar</span>
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><RefreshCw size={12} /> Penyesuaian</span>
  }

  const f = (key: keyof ProductForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Package size={24} /> Barang
        </h1>
        <button onClick={openAdd} className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={16} /> Tambah Barang
        </button>
      </div>

      {/* Search + Filters */}
      <div className="space-y-2 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari barang..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kategori</option>
            {settings.categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={stockFilter}
            onChange={e => setStockFilter(e.target.value as StockFilter)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="semua">Semua Stok</option>
            <option value="menipis">Stok Menipis</option>
            <option value="aman">Stok Aman</option>
          </select>
        </div>
      </div>

      {/* Product List */}
      {products.length === 0 ? (
        <p className="text-center text-sm text-gray-500 py-12">Belum ada barang.</p>
      ) : (
        <div className="space-y-2">
          {products.map(p => {
            const expanded = expandedId === p.id
            const lowStock = p.stock <= p.minStock
            const movements = expanded ? movementsFor(p.id) : []

            return (
              <div key={p.id} className="border border-gray-200 rounded-lg bg-white">
                {/* Row */}
                <button
                  onClick={() => setExpandedId(expanded ? null : p.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 truncate">{p.name}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{p.category}</span>
                      {lowStock && (
                        <span className="text-xs font-medium text-white bg-red-500 px-2 py-0.5 rounded-full">Stok Menipis</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>Stok: <span className={lowStock ? 'text-red-600 font-semibold' : 'text-gray-900 font-semibold'}>{p.stock}</span> {p.unit}</span>
                      <span>Beli: {formatRupiah(p.buyPrice)}</span>
                      <span>Jual: {formatRupiah(p.sellPrice)}</span>
                    </div>
                  </div>
                  {expanded ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
                </button>

                {/* Expanded Detail */}
                {expanded && (
                  <div className="border-t border-gray-100 px-4 py-3 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-gray-500">SKU:</span> <span className="text-gray-900">{p.sku || '-'}</span></div>
                      <div><span className="text-gray-500">Min Stok:</span> <span className="text-gray-900">{p.minStock}</span></div>
                      <div><span className="text-gray-500">Kadaluarsa:</span> <span className="text-gray-900">{p.expiryDate ? formatDate(p.expiryDate) : '-'}</span></div>
                      <div><span className="text-gray-500">Dibuat:</span> <span className="text-gray-900">{formatDate(p.createdAt)}</span></div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        <Pencil size={12} /> Edit
                      </button>
                      <button onClick={() => setConfirmArchive(p.id)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                        <Archive size={12} /> Arsipkan
                      </button>
                    </div>

                    {/* Stock Movement History */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Riwayat Stok</h3>
                      {movements.length === 0 ? (
                        <p className="text-xs text-gray-400">Belum ada pergerakan stok.</p>
                      ) : (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {movements.map(m => (
                            <div key={m.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                              <div className="flex items-center gap-2">
                                {movementBadge(m.type)}
                                <span className="font-medium text-gray-800">{m.quantity > 0 ? '+' : ''}{m.quantity}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-gray-500">{formatDateTime(m.createdAt)}</div>
                                {m.note && <div className="text-gray-400 truncate max-w-[120px]">{m.note}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? 'Edit Barang' : 'Tambah Barang'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang *</label>
                <input type="text" value={form.name} onChange={f('name')} required className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input type="text" value={form.sku} onChange={f('sku')} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select value={form.category} onChange={f('category')} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {settings.categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
                  <select value={form.unit} onChange={f('unit')} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {settings.units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga Beli</label>
                  <input type="number" min="0" value={form.buyPrice} onChange={f('buyPrice')} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual</label>
                  <input type="number" min="0" value={form.sellPrice} onChange={f('sellPrice')} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Stok</label>
                  <input type="number" min="0" value={form.minStock} onChange={f('minStock')} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kadaluarsa</label>
                  <input type="date" value={form.expiryDate} onChange={f('expiryDate')} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  {editingId ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive Confirm */}
      <ConfirmDialog
        open={confirmArchive !== null}
        onClose={() => setConfirmArchive(null)}
        onConfirm={() => confirmArchive && handleArchive(confirmArchive)}
        title="Arsipkan Barang"
        message="Barang yang diarsipkan tidak akan muncul di daftar. Lanjutkan?"
      />
    </div>
  )
}
