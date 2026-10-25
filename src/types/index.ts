export interface Product {
  id: string
  name: string
  sku: string
  category: string
  unit: string
  buyPrice: number
  sellPrice: number
  stock: number
  minStock: number
  expiryDate: string | null
  archived: boolean
  createdAt: string
  updatedAt: string
}

export interface StockMovement {
  id: string
  productId: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reference: string
  note: string
  createdAt: string
}

export interface PurchaseItem {
  productId: string
  productName: string
  quantity: number
  buyPrice: number
  subtotal: number
}

export interface Purchase {
  id: string
  date: string
  items: PurchaseItem[]
  total: number
  supplier: string
  paymentStatus: 'lunas' | 'belum_lunas'
  note: string
  cancelled: boolean
  createdAt: string
}

export interface SaleItem {
  productId: string
  productName: string
  quantity: number
  sellPrice: number
  costPrice: number
  subtotal: number
}

export interface Sale {
  id: string
  date: string
  items: SaleItem[]
  total: number
  totalCost: number
  paymentMethod: 'tunai' | 'transfer' | 'qris' | 'lainnya'
  note: string
  cancelled: boolean
  createdAt: string
}

export interface Expense {
  id: string
  date: string
  name: string
  category: string
  amount: number
  paymentMethod: string
  note: string
  cancelled: boolean
  createdAt: string
}

export interface Settings {
  businessName: string
  categories: string[]
  units: string[]
  defaultMinStock: number
  expenseCategories: string[]
}

export interface AppData {
  products: Product[]
  purchases: Purchase[]
  sales: Sale[]
  expenses: Expense[]
  stockMovements: StockMovement[]
  settings: Settings
}
