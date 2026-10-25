// Importers: context.tsx — loads seed data when localStorage is empty
// User: "Sediakan data awal agar aplikasi bisa langsung dicoba"
import type { AppData } from '../types'
import { defaultSettings } from './operations'

export function getSeedData(): AppData {
  const now = '2026-10-25T08:00:00.000Z'
  const today = '2026-10-25'
  const yesterday = '2026-10-24'
  const twoDaysAgo = '2026-10-23'

  const products = [
    { id: 'prod_1', name: 'Air Mineral 600ml', sku: 'AM600', category: 'Minuman', unit: 'botol', buyPrice: 3000, sellPrice: 5000, stock: 20, minStock: 10, expiryDate: '2027-06-01', archived: false, createdAt: now, updatedAt: now },
    { id: 'prod_2', name: 'Mi Instan', sku: 'MI001', category: 'Makanan', unit: 'bungkus', buyPrice: 2500, sellPrice: 3500, stock: 30, minStock: 10, expiryDate: '2027-03-15', archived: false, createdAt: now, updatedAt: now },
    { id: 'prod_3', name: 'Kopi Sachet', sku: 'KS001', category: 'Minuman', unit: 'pcs', buyPrice: 1500, sellPrice: 2500, stock: 15, minStock: 10, expiryDate: '2027-09-01', archived: false, createdAt: now, updatedAt: now },
    { id: 'prod_4', name: 'Roti Tawar', sku: 'RT001', category: 'Makanan', unit: 'pcs', buyPrice: 12000, sellPrice: 15000, stock: 8, minStock: 5, expiryDate: '2026-10-30', archived: false, createdAt: now, updatedAt: now },
    { id: 'prod_5', name: 'Teh Kotak', sku: 'TK001', category: 'Minuman', unit: 'pcs', buyPrice: 3500, sellPrice: 5000, stock: 4, minStock: 10, expiryDate: '2027-01-15', archived: false, createdAt: now, updatedAt: now },
  ]

  const purchases = [
    {
      id: 'pur_1', date: twoDaysAgo, supplier: 'PT Aqua', paymentStatus: 'lunas' as const, note: 'Pembelian rutin',
      items: [{ productId: 'prod_1', productName: 'Air Mineral 600ml', quantity: 24, buyPrice: 3000, subtotal: 72000 }],
      total: 72000, cancelled: false, createdAt: `${twoDaysAgo}T09:00:00.000Z`,
    },
    {
      id: 'pur_2', date: yesterday, supplier: 'Toko Grosir Jaya', paymentStatus: 'lunas' as const, note: '',
      items: [
        { productId: 'prod_2', productName: 'Mi Instan', quantity: 40, buyPrice: 2500, subtotal: 100000 },
        { productId: 'prod_3', productName: 'Kopi Sachet', quantity: 20, buyPrice: 1500, subtotal: 30000 },
      ],
      total: 130000, cancelled: false, createdAt: `${yesterday}T10:00:00.000Z`,
    },
  ]

  const sales = [
    {
      id: 'sale_1', date: yesterday, paymentMethod: 'tunai' as const, note: '',
      items: [
        { productId: 'prod_1', productName: 'Air Mineral 600ml', quantity: 3, sellPrice: 5000, costPrice: 3000, subtotal: 15000 },
        { productId: 'prod_2', productName: 'Mi Instan', quantity: 5, sellPrice: 3500, costPrice: 2500, subtotal: 17500 },
      ],
      total: 32500, totalCost: 21500, cancelled: false, createdAt: `${yesterday}T14:00:00.000Z`,
    },
    {
      id: 'sale_2', date: today, paymentMethod: 'qris' as const, note: 'Pelanggan tetap',
      items: [
        { productId: 'prod_3', productName: 'Kopi Sachet', quantity: 2, sellPrice: 2500, costPrice: 1500, subtotal: 5000 },
        { productId: 'prod_4', productName: 'Roti Tawar', quantity: 1, sellPrice: 15000, costPrice: 12000, subtotal: 15000 },
      ],
      total: 20000, totalCost: 15000, cancelled: false, createdAt: `${today}T08:30:00.000Z`,
    },
  ]

  const expenses = [
    { id: 'exp_1', date: yesterday, name: 'Bayar listrik Oktober', category: 'Listrik', amount: 250000, paymentMethod: 'transfer', note: '', cancelled: false, createdAt: `${yesterday}T08:00:00.000Z` },
    { id: 'exp_2', date: today, name: 'Beli kantong plastik', category: 'Perlengkapan', amount: 35000, paymentMethod: 'tunai', note: '', cancelled: false, createdAt: `${today}T07:00:00.000Z` },
  ]

  const stockMovements = [
    { id: 'sm_1', productId: 'prod_1', type: 'in' as const, quantity: 24, reference: 'pur_1', note: 'Pembelian dari PT Aqua', createdAt: `${twoDaysAgo}T09:00:00.000Z` },
    { id: 'sm_2', productId: 'prod_2', type: 'in' as const, quantity: 40, reference: 'pur_2', note: 'Pembelian dari Toko Grosir Jaya', createdAt: `${yesterday}T10:00:00.000Z` },
    { id: 'sm_3', productId: 'prod_3', type: 'in' as const, quantity: 20, reference: 'pur_2', note: 'Pembelian dari Toko Grosir Jaya', createdAt: `${yesterday}T10:00:00.000Z` },
    { id: 'sm_4', productId: 'prod_1', type: 'out' as const, quantity: -3, reference: 'sale_1', note: 'Penjualan', createdAt: `${yesterday}T14:00:00.000Z` },
    { id: 'sm_5', productId: 'prod_2', type: 'out' as const, quantity: -5, reference: 'sale_1', note: 'Penjualan', createdAt: `${yesterday}T14:00:00.000Z` },
    { id: 'sm_6', productId: 'prod_3', type: 'out' as const, quantity: -2, reference: 'sale_2', note: 'Penjualan', createdAt: `${today}T08:30:00.000Z` },
    { id: 'sm_7', productId: 'prod_4', type: 'out' as const, quantity: -1, reference: 'sale_2', note: 'Penjualan', createdAt: `${today}T08:30:00.000Z` },
  ]

  return {
    products,
    purchases,
    sales,
    expenses,
    stockMovements,
    settings: { ...defaultSettings, businessName: 'Warung Barokah' },
  }
}
