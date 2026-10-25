// Importers: AppLayout.tsx. Onboarding tour shown on first visit.
import { useState } from 'react'
import { Package, ShoppingCart, Tag, BarChart3, Settings, ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react'
import { createPortal } from 'react-dom'

const steps = [
  {
    icon: Sparkles,
    title: 'Selamat Datang! 👋',
    desc: 'Aplikasi ini membantu Anda mencatat stok barang, pembelian, penjualan, dan pengeluaran usaha dengan mudah.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Package,
    title: 'Kelola Barang',
    desc: 'Tambah dan atur daftar barang dagangan. Pantau stok, harga beli, harga jual, dan dapatkan peringatan saat stok menipis.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: ShoppingCart,
    title: 'Catat Pembelian',
    desc: 'Setiap pembelian barang dari pemasok akan otomatis menambah stok. Catat juga status pembayaran (lunas/belum).',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Tag,
    title: 'Catat Penjualan',
    desc: 'Catat setiap penjualan — stok berkurang otomatis. Bisa pakai metode tunai, transfer, atau QRIS.',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: BarChart3,
    title: 'Lihat Laporan',
    desc: 'Pantau omzet, laba kotor, dan pengeluaran operasional. Filter berdasarkan hari, minggu, atau bulan.',
    color: 'bg-teal-100 text-teal-600',
  },
  {
    icon: Settings,
    title: 'Atur Sesuai Kebutuhan',
    desc: 'Ubah nama usaha, kategori barang, satuan, dan lainnya di halaman Pengaturan. Anda juga bisa memperbesar ukuran tulisan!',
    color: 'bg-gray-100 text-gray-600',
  },
]

export default function OnboardingTour({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const current = steps[step]
  const Icon = current.icon
  const isLast = step === steps.length - 1

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="flex justify-end p-3 pb-0">
          <button onClick={onDone} className="text-gray-400 hover:text-gray-600 p-1" aria-label="Lewati">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 text-center">
          <div className={`inline-flex p-4 rounded-full ${current.color} mb-4`}>
            <Icon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{current.title}</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{current.desc}</p>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 pb-4">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-blue-600' : 'bg-gray-300'}`}
              aria-label={`Langkah ${i + 1}`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex border-t border-gray-100">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 flex items-center justify-center gap-1 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Kembali
            </button>
          )}
          <button
            onClick={isLast ? onDone : () => setStep(step + 1)}
            className={`flex-1 flex items-center justify-center gap-1 py-3 text-sm font-medium transition-colors ${
              isLast
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'text-blue-600 hover:bg-blue-50'
            } ${step > 0 ? 'border-l border-gray-100' : ''}`}
          >
            {isLast ? 'Mulai Gunakan' : <>Lanjut <ChevronRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
