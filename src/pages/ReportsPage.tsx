// Importers: App.tsx router. Laporan keuangan per periode dengan filter tanggal.
import { useState, useMemo } from 'react'
import { BarChart3, TrendingUp, TrendingDown, ShoppingCart, Receipt, Wallet } from 'lucide-react'
import { useApp } from '../lib/context'
import { calculateReport } from '../lib/operations'
import { formatRupiah, formatDate, todayISO, startOfWeek, startOfMonth, endOfMonth } from '../lib/utils'

type Preset = 'hari' | 'minggu' | 'bulan' | 'custom'

export default function ReportsPage() {
  const { data } = useApp()
  const today = todayISO()
  const [preset, setPreset] = useState<Preset>('bulan')
  const [customStart, setCustomStart] = useState(today)
  const [customEnd, setCustomEnd] = useState(today)

  const { start, end } = useMemo(() => {
    const now = new Date()
    switch (preset) {
      case 'hari': return { start: today, end: today }
      case 'minggu': return { start: startOfWeek(now), end: today }
      case 'bulan': return { start: startOfMonth(now), end: endOfMonth(now) }
      case 'custom': return { start: customStart, end: customEnd }
    }
  }, [preset, today, customStart, customEnd])

  const report = useMemo(() => calculateReport(data, start, end), [data, start, end])

  const presets: { key: Preset; label: string }[] = [
    { key: 'hari', label: 'Hari Ini' },
    { key: 'minggu', label: 'Minggu Ini' },
    { key: 'bulan', label: 'Bulan Ini' },
    { key: 'custom', label: 'Kustom' },
  ]

  const labaKotorColor = report.labaKotor >= 0 ? 'text-green-600' : 'text-red-600'
  const labaOpColor = report.labaOperasional >= 0 ? 'text-green-600' : 'text-red-600'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <BarChart3 className="w-6 h-6" /> Laporan
      </h1>

      {/* Period filter */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {presets.map(p => (
            <button
              key={p.key}
              onClick={() => setPreset(p.key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                preset === p.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {preset === 'custom' && (
          <div className="flex flex-wrap gap-3">
            <label className="flex flex-col text-sm">
              <span className="text-gray-500 mb-1">Dari</span>
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              />
            </label>
            <label className="flex flex-col text-sm">
              <span className="text-gray-500 mb-1">Sampai</span>
              <input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              />
            </label>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card icon={<TrendingUp className="w-5 h-5 text-blue-600" />} label="Omzet Penjualan" value={formatRupiah(report.omzet)} />
        <Card icon={<ShoppingCart className="w-5 h-5 text-orange-600" />} label="Total Pembelian" value={formatRupiah(report.totalPurchases)} />
        <Card icon={<Wallet className="w-5 h-5 text-purple-600" />} label="Pengeluaran Operasional" value={formatRupiah(report.totalExpenses)} />
        <Card icon={<Receipt className="w-5 h-5 text-gray-600" />} label="HPP" value={formatRupiah(report.hpp)} />
        <Card
          icon={<TrendingUp className="w-5 h-5" />}
          label="Laba Kotor"
          value={formatRupiah(report.labaKotor)}
          valueClass={labaKotorColor}
        />
        <Card
          icon={<TrendingDown className="w-5 h-5" />}
          label="Est. Laba Operasional"
          value={formatRupiah(report.labaOperasional)}
          valueClass={labaOpColor}
        />
      </div>

      {/* Transaction counts */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <span>{report.salesCount} penjualan</span>
        <span>{report.purchasesCount} pembelian</span>
        <span>{report.expensesCount} pengeluaran</span>
      </div>

      {/* Transaction lists */}
      {report.salesCount > 0 && (
        <Section title="Penjualan">
          {report.sales.map(s => (
            <Row key={s.id} date={s.date} label={s.items.map(i => i.productName).join(', ')} amount={formatRupiah(s.total)} color="text-green-700" />
          ))}
        </Section>
      )}

      {report.purchasesCount > 0 && (
        <Section title="Pembelian">
          {report.purchases.map(p => (
            <Row key={p.id} date={p.date} label={p.items.map(i => i.productName).join(', ')} amount={formatRupiah(p.total)} color="text-orange-700" />
          ))}
        </Section>
      )}

      {report.expensesCount > 0 && (
        <Section title="Pengeluaran">
          {report.expenses.map(e => (
            <Row key={e.id} date={e.date} label={e.name} amount={formatRupiah(e.amount)} color="text-red-700" />
          ))}
        </Section>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 italic pt-2">
        * Laba merupakan estimasi berdasarkan data yang dicatat, bukan laporan akuntansi atau pajak resmi.
      </p>
    </div>
  )
}

function Card({ icon, label, value, valueClass = 'text-gray-900' }: {
  icon: React.ReactNode; label: string; value: string; valueClass?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-gray-500">{label}</span></div>
      <p className={`text-lg font-bold ${valueClass}`}>{value}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">{children}</div>
    </div>
  )
}

function Row({ date, label, amount, color }: { date: string; label: string; amount: string; color: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <div className="min-w-0">
        <p className="text-gray-900 truncate">{label}</p>
        <p className="text-xs text-gray-400">{formatDate(date)}</p>
      </div>
      <span className={`font-semibold whitespace-nowrap ml-3 ${color}`}>{amount}</span>
    </div>
  )
}
