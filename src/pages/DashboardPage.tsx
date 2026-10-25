// Importers: App.tsx router. Dashboard/beranda utama showing summary cards, quick actions, recent transactions.
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Package, AlertTriangle, TrendingUp, ShoppingCart, Receipt, Plus, Tag } from 'lucide-react'
import { useApp } from '../lib/context'
import { calculateDashboardSummary } from '../lib/operations'
import { formatRupiah, formatDateTime } from '../lib/utils'

export default function DashboardPage() {
  const { data } = useApp()
  const summary = useMemo(() => calculateDashboardSummary(data), [data])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Beranda</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SummaryCard
          icon={<Package className="w-5 h-5 text-blue-600" />}
          label="Total Jenis Barang"
          value={String(summary.totalProducts)}
        />
        <SummaryCard
          icon={<AlertTriangle className={`w-5 h-5 ${summary.lowStockCount > 0 ? 'text-red-600' : 'text-gray-400'}`} />}
          label="Stok Menipis"
          value={String(summary.lowStockCount)}
          danger={summary.lowStockCount > 0}
        />
        <SummaryCard
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          label="Penjualan Hari Ini"
          value={formatRupiah(summary.salesToday)}
        />
        <SummaryCard
          icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
          label="Pembelian Hari Ini"
          value={formatRupiah(summary.purchasesToday)}
        />
        <SummaryCard
          icon={<Receipt className="w-5 h-5 text-orange-600" />}
          label="Pengeluaran Hari Ini"
          value={formatRupiah(summary.expensesToday)}
          className="col-span-2 md:col-span-1"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickAction to="/products" icon={<Plus className="w-5 h-5" />} label="Tambah Barang" />
        <QuickAction to="/transactions" icon={<ShoppingCart className="w-5 h-5" />} label="Catat Pembelian" />
        <QuickAction to="/transactions" icon={<Tag className="w-5 h-5" />} label="Catat Penjualan" />
        <QuickAction to="/transactions" icon={<Receipt className="w-5 h-5" />} label="Catat Pengeluaran" />
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Transaksi Terakhir</h2>
        {summary.recentTransactions.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">Belum ada transaksi</p>
        ) : (
          <div className="space-y-2">
            {summary.recentTransactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between bg-white rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <TypeBadge type={tx.type} />
                  <span className="text-sm text-gray-500">{formatDateTime(tx.date)}</span>
                </div>
                <span className="font-semibold text-sm">{formatRupiah(tx.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryCard({ icon, label, value, danger, className }: {
  icon: React.ReactNode; label: string; value: string; danger?: boolean; className?: string
}) {
  return (
    <div className={`bg-white rounded-lg border p-4 ${danger ? 'border-red-300 bg-red-50' : ''} ${className ?? ''}`}>
      <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs text-gray-500">{label}</span></div>
      <p className={`text-lg font-bold ${danger ? 'text-red-600' : ''}`}>{value}</p>
    </div>
  )
}

function QuickAction({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 bg-white border rounded-lg p-3 hover:bg-gray-50 transition-colors text-sm font-medium">
      {icon}{label}
    </Link>
  )
}

function TypeBadge({ type }: { type: 'sale' | 'purchase' | 'expense' }) {
  const styles = {
    sale: 'bg-green-100 text-green-700',
    purchase: 'bg-blue-100 text-blue-700',
    expense: 'bg-red-100 text-red-700',
  }
  const labels = { sale: 'Penjualan', purchase: 'Pembelian', expense: 'Pengeluaran' }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[type]}`}>
      {labels[type]}
    </span>
  )
}
