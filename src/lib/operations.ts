// Importers: context.tsx, all pages. Central business logic — no UI here.
// User: "buat fungsi terpusat seperti createProduct(), createPurchase(), createSale()..."
import type { AppData, Product, Purchase, PurchaseItem, Sale, SaleItem, Expense, StockMovement, Settings } from '../types'
import { uid } from './storage'
import { nowISO, todayISO, isInRange } from './utils'

export const defaultSettings: Settings = {
  businessName: 'Toko Saya',
  categories: ['Minuman', 'Makanan', 'Snack', 'Lainnya'],
  units: ['pcs', 'botol', 'bungkus', 'kg', 'liter', 'box'],
  defaultMinStock: 5,
  expenseCategories: ['Listrik', 'Air', 'Internet', 'Transportasi', 'Sewa', 'Perlengkapan', 'Lainnya'],
}

export function emptyData(): AppData {
  return {
    products: [],
    purchases: [],
    sales: [],
    expenses: [],
    stockMovements: [],
    settings: { ...defaultSettings },
  }
}

// ── Products ──

export function createProduct(data: AppData, p: Omit<Product, 'id' | 'stock' | 'archived' | 'createdAt' | 'updatedAt'>): AppData {
  const now = nowISO()
  const product: Product = {
    ...p,
    id: uid('prod'),
    stock: 0,
    archived: false,
    createdAt: now,
    updatedAt: now,
  }
  return { ...data, products: [...data.products, product] }
}

export function updateProduct(data: AppData, id: string, changes: Partial<Pick<Product, 'name' | 'sku' | 'category' | 'unit' | 'buyPrice' | 'sellPrice' | 'minStock' | 'expiryDate'>>): AppData {
  return {
    ...data,
    products: data.products.map(p =>
      p.id === id ? { ...p, ...changes, updatedAt: nowISO() } : p
    ),
  }
}

export function archiveProduct(data: AppData, id: string): AppData {
  return {
    ...data,
    products: data.products.map(p =>
      p.id === id ? { ...p, archived: true, updatedAt: nowISO() } : p
    ),
  }
}

// ── Stock ──

function adjustStock(data: AppData, productId: string, qty: number, type: StockMovement['type'], reference: string, note: string): AppData {
  const movement: StockMovement = {
    id: uid('sm'),
    productId,
    type,
    quantity: qty,
    reference,
    note,
    createdAt: nowISO(),
  }
  return {
    ...data,
    products: data.products.map(p =>
      p.id === productId ? { ...p, stock: p.stock + qty, updatedAt: nowISO() } : p
    ),
    stockMovements: [...data.stockMovements, movement],
  }
}

// ── Purchases ──

export function createPurchase(data: AppData, purchase: {
  date: string
  items: { productId: string; quantity: number; buyPrice: number }[]
  supplier: string
  paymentStatus: 'lunas' | 'belum_lunas'
  note: string
}): AppData {
  const id = uid('pur')
  const items: PurchaseItem[] = purchase.items.map(it => {
    const prod = data.products.find(p => p.id === it.productId)
    return {
      productId: it.productId,
      productName: prod?.name ?? '',
      quantity: it.quantity,
      buyPrice: it.buyPrice,
      subtotal: it.quantity * it.buyPrice,
    }
  })
  const total = items.reduce((s, i) => s + i.subtotal, 0)
  const rec: Purchase = {
    id,
    date: purchase.date,
    items,
    total,
    supplier: purchase.supplier,
    paymentStatus: purchase.paymentStatus,
    note: purchase.note,
    cancelled: false,
    createdAt: nowISO(),
  }

  let d: AppData = { ...data, purchases: [...data.purchases, rec] }
  for (const it of items) {
    d = adjustStock(d, it.productId, it.quantity, 'in', id, `Pembelian dari ${purchase.supplier || '-'}`)
  }
  return d
}

export function cancelPurchase(data: AppData, id: string): AppData {
  const purchase = data.purchases.find(p => p.id === id)
  if (!purchase || purchase.cancelled) return data

  let d: AppData = {
    ...data,
    purchases: data.purchases.map(p =>
      p.id === id ? { ...p, cancelled: true } : p
    ),
  }
  for (const it of purchase.items) {
    d = adjustStock(d, it.productId, -it.quantity, 'adjustment', id, 'Pembatalan pembelian')
  }
  return d
}

// ── Sales ──

export function canSell(data: AppData, items: { productId: string; quantity: number }[]): string | null {
  for (const it of items) {
    const prod = data.products.find(p => p.id === it.productId)
    if (!prod) return `Barang tidak ditemukan`
    if (prod.stock < it.quantity) return `Stok ${prod.name} tidak cukup (tersedia: ${prod.stock})`
  }
  return null
}

export function createSale(data: AppData, sale: {
  date: string
  items: { productId: string; quantity: number; sellPrice: number }[]
  paymentMethod: Sale['paymentMethod']
  note: string
}): AppData {
  const id = uid('sale')
  const items: SaleItem[] = sale.items.map(it => {
    const prod = data.products.find(p => p.id === it.productId)!
    return {
      productId: it.productId,
      productName: prod.name,
      quantity: it.quantity,
      sellPrice: it.sellPrice,
      costPrice: prod.buyPrice,
      subtotal: it.quantity * it.sellPrice,
    }
  })
  const total = items.reduce((s, i) => s + i.subtotal, 0)
  const totalCost = items.reduce((s, i) => s + i.quantity * i.costPrice, 0)
  const rec: Sale = {
    id,
    date: sale.date,
    items,
    total,
    totalCost,
    paymentMethod: sale.paymentMethod,
    note: sale.note,
    cancelled: false,
    createdAt: nowISO(),
  }

  let d: AppData = { ...data, sales: [...data.sales, rec] }
  for (const it of items) {
    d = adjustStock(d, it.productId, -it.quantity, 'out', id, 'Penjualan')
  }
  return d
}

export function cancelSale(data: AppData, id: string): AppData {
  const sale = data.sales.find(s => s.id === id)
  if (!sale || sale.cancelled) return data

  let d: AppData = {
    ...data,
    sales: data.sales.map(s =>
      s.id === id ? { ...s, cancelled: true } : s
    ),
  }
  for (const it of sale.items) {
    d = adjustStock(d, it.productId, it.quantity, 'adjustment', id, 'Pembatalan penjualan')
  }
  return d
}

// ── Expenses ──

export function createExpense(data: AppData, expense: Omit<Expense, 'id' | 'cancelled' | 'createdAt'>): AppData {
  const rec: Expense = {
    ...expense,
    id: uid('exp'),
    cancelled: false,
    createdAt: nowISO(),
  }
  return { ...data, expenses: [...data.expenses, rec] }
}

export function updateExpense(data: AppData, id: string, changes: Partial<Omit<Expense, 'id' | 'createdAt'>>): AppData {
  return {
    ...data,
    expenses: data.expenses.map(e =>
      e.id === id ? { ...e, ...changes } : e
    ),
  }
}

export function cancelExpense(data: AppData, id: string): AppData {
  return {
    ...data,
    expenses: data.expenses.map(e =>
      e.id === id ? { ...e, cancelled: true } : e
    ),
  }
}

// ── Dashboard ──

export function calculateDashboardSummary(data: AppData) {
  const today = todayISO()
  const activeSales = data.sales.filter(s => !s.cancelled)
  const activePurchases = data.purchases.filter(p => !p.cancelled)
  const activeExpenses = data.expenses.filter(e => !e.cancelled)
  const activeProducts = data.products.filter(p => !p.archived)

  return {
    totalProducts: activeProducts.length,
    lowStockCount: activeProducts.filter(p => p.stock <= p.minStock).length,
    salesToday: activeSales.filter(s => s.date === today).reduce((t, s) => t + s.total, 0),
    purchasesToday: activePurchases.filter(p => p.date === today).reduce((t, p) => t + p.total, 0),
    expensesToday: activeExpenses.filter(e => e.date === today).reduce((t, e) => t + e.amount, 0),
    recentTransactions: [
      ...activeSales.map(s => ({ type: 'sale' as const, date: s.createdAt, total: s.total, id: s.id })),
      ...activePurchases.map(p => ({ type: 'purchase' as const, date: p.createdAt, total: p.total, id: p.id })),
      ...activeExpenses.map(e => ({ type: 'expense' as const, date: e.createdAt, total: e.amount, id: e.id })),
    ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10),
  }
}

// ── Reports ──

export function calculateReport(data: AppData, start: string, end: string) {
  const sales = data.sales.filter(s => !s.cancelled && isInRange(s.date, start, end))
  const purchases = data.purchases.filter(p => !p.cancelled && isInRange(p.date, start, end))
  const expenses = data.expenses.filter(e => !e.cancelled && isInRange(e.date, start, end))

  const omzet = sales.reduce((t, s) => t + s.total, 0)
  const hpp = sales.reduce((t, s) => t + s.totalCost, 0)
  const totalPurchases = purchases.reduce((t, p) => t + p.total, 0)
  const totalExpenses = expenses.reduce((t, e) => t + e.amount, 0)
  const labaKotor = omzet - hpp
  const labaOperasional = labaKotor - totalExpenses

  return {
    omzet,
    hpp,
    labaKotor,
    totalPurchases,
    totalExpenses,
    labaOperasional,
    salesCount: sales.length,
    purchasesCount: purchases.length,
    expensesCount: expenses.length,
    sales,
    purchases,
    expenses,
  }
}

// ── Settings ──

export function updateSettings(data: AppData, changes: Partial<Settings>): AppData {
  return { ...data, settings: { ...data.settings, ...changes } }
}
