// Importers: App.tsx router. Halaman pengaturan usaha dan reset data.
import { useState } from 'react'
import { Settings2, Plus, X, Trash2, HelpCircle } from 'lucide-react'
import { useApp } from '../lib/context'
import { updateSettings } from '../lib/operations'
import { clearData } from '../lib/storage'
import ConfirmDialog from '../components/ConfirmDialog'

export default function SettingsPage() {
  const { data, setData, toast, setTourDone } = useApp()
  const s = data.settings

  const [businessName, setBusinessName] = useState(s.businessName)
  const [categories, setCategories] = useState<string[]>([...s.categories])
  const [units, setUnits] = useState<string[]>([...s.units])
  const [defaultMinStock, setDefaultMinStock] = useState(s.defaultMinStock)
  const [expenseCategories, setExpenseCategories] = useState<string[]>([...s.expenseCategories])
  const [confirmReset, setConfirmReset] = useState(false)

  function handleSave() {
    setData(prev => updateSettings(prev, {
      businessName: businessName.trim() || 'Toko Saya',
      categories,
      units,
      defaultMinStock,
      expenseCategories,
    }))
    toast('Pengaturan disimpan')
  }

  function handleReset() {
    clearData()
    window.location.reload()
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Settings2 className="w-6 h-6" /> Pengaturan
      </h1>

      {/* Nama Usaha */}
      <Field label="Nama Usaha">
        <input
          type="text"
          value={businessName}
          onChange={e => setBusinessName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </Field>

      {/* Kategori Barang */}
      <ChipList label="Kategori Barang" items={categories} setItems={setCategories} />

      {/* Satuan Barang */}
      <ChipList label="Satuan Barang" items={units} setItems={setUnits} />

      {/* Default Min Stock */}
      <Field label="Batas Minimum Stok Default">
        <input
          type="number"
          min={0}
          value={defaultMinStock}
          onChange={e => setDefaultMinStock(Math.max(0, Number(e.target.value)))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </Field>

      {/* Kategori Pengeluaran */}
      <ChipList label="Kategori Pengeluaran" items={expenseCategories} setItems={setExpenseCategories} />

      {/* Save */}
      <button
        onClick={handleSave}
        className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Simpan Pengaturan
      </button>

      {/* Tutorial replay */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Bantuan</h2>
        <button
          onClick={() => { setTourDone(false); toast('Tutorial dimulai ulang') }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <HelpCircle className="w-4 h-4" /> Ulangi Panduan Aplikasi
        </button>
      </div>

      {/* Danger zone */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-sm font-semibold text-red-600 mb-2">Zona Berbahaya</h2>
        <button
          onClick={() => setConfirmReset(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Reset Semua Data
        </button>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={handleReset}
        title="Reset Semua Data?"
        message="Semua data produk, transaksi, dan pengaturan akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}

function ChipList({ label, items, setItems }: { label: string; items: string[]; setItems: (v: string[]) => void }) {
  const [draft, setDraft] = useState('')

  function add() {
    const v = draft.trim()
    if (!v || items.includes(v)) return
    setItems([...items, v])
    setDraft('')
  }

  return (
    <Field label={label}>
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map(item => (
          <span key={item} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-sm px-2.5 py-1 rounded-full">
            {item}
            <button onClick={() => setItems(items.filter(i => i !== item))} className="text-gray-400 hover:text-red-500">
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Tambah baru..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
        />
        <button
          onClick={add}
          type="button"
          className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </Field>
  )
}
