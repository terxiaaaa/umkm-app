// Importers: App.tsx router. Layout wrapper with sidebar (desktop) + bottom nav (mobile) + toast display.
import { useState, useEffect } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Home, Package, ArrowLeftRight, BarChart3, Settings, AArrowUp, AArrowDown, Smartphone, WifiOff } from 'lucide-react'
import { useApp } from '../lib/context'
import OnboardingTour from './OnboardingTour'

function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return true
  const ua = navigator.userAgent || ''
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
  const isTouchScreen = ('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.innerWidth < 1024
  return isMobileUA || isTouchScreen
}

const nav = [
  { to: '/', label: 'Beranda', icon: Home },
  { to: '/products', label: 'Barang', icon: Package },
  { to: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
  { to: '/reports', label: 'Laporan', icon: BarChart3 },
  { to: '/settings', label: 'Pengaturan', icon: Settings },
]

const SIZES = ['small', 'normal', 'large', 'xlarge'] as const
const SIZE_LABELS: Record<string, string> = { small: 'Kecil', normal: 'Normal', large: 'Besar', xlarge: 'Sangat Besar' }

export default function AppLayout() {
  const { data, toasts, fontSize, setFontSize, tourDone, setTourDone } = useApp()
  const [isMobile, setIsMobile] = useState(isMobileDevice)

  useEffect(() => {
    function handleResize() {
      setIsMobile(isMobileDevice())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!isMobile) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-20 h-20 bg-red-950/60 border border-red-800 text-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
          <WifiOff className="w-10 h-10" />
        </div>
        <span className="text-xs uppercase tracking-widest font-mono text-red-400 mb-2 bg-red-950/40 border border-red-900/50 px-3 py-1 rounded-full">
          Localhost Disconnected
        </span>
        <h1 className="text-2xl font-bold text-gray-100 mb-3 mt-2">
          Akses Laptop/Desktop Diputus
        </h1>
        <p className="text-gray-400 text-sm max-w-sm leading-relaxed mb-6">
          Sistem mendeteksi Anda membuka aplikasi ini dari laptop/PC. Sesi di perangkat ini dinonaktifkan otomatis.
        </p>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 max-w-sm w-full text-left">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 mb-2">
            <Smartphone className="w-4 h-4 text-blue-400" />
            Cara Buka di HP:
          </div>
          <ol className="text-xs text-gray-400 space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>Pastikan HP dan laptop terhubung ke Wi-Fi yang sama</li>
            <li>Jalankan <code className="text-blue-400 bg-gray-800 px-1 py-0.5 rounded font-mono">npm run dev -- --host</code> di terminal laptop</li>
            <li>Buka alamat <strong className="text-gray-200">Network IP</strong> yang tampil di terminal melalui browser HP</li>
          </ol>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar – desktop */}
      <aside className="hidden md:flex flex-col w-56 border-r border-gray-200 bg-white">
        <div className="px-5 py-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900 truncate">
            {data.settings.businessName || 'UMKM App'}
          </h1>
        </div>
        <nav className="flex-1 py-2">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
        {/* Font size control */}
        <div className="border-t border-gray-200 px-4 py-3">
          <p className="text-xs text-gray-500 mb-2">Ukuran Tulisan: {SIZE_LABELS[fontSize]}</p>
          <div className="flex gap-1">
            <button
              onClick={() => { const i = SIZES.indexOf(fontSize); if (i > 0) setFontSize(SIZES[i - 1]) }}
              disabled={fontSize === 'small'}
              className="flex-1 flex items-center justify-center py-1.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition-colors"
              aria-label="Perkecil tulisan"
            >
              <AArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => { const i = SIZES.indexOf(fontSize); if (i < SIZES.length - 1) setFontSize(SIZES[i + 1]) }}
              disabled={fontSize === 'xlarge'}
              className="flex-1 flex items-center justify-center py-1.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition-colors"
              aria-label="Perbesar tulisan"
            >
              <AArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 px-4 py-6 pb-20 md:pb-6 md:px-8">
        <Outlet />
      </main>

      {/* Bottom nav – mobile */}
      <nav className="fixed bottom-0 inset-x-0 flex md:hidden bg-white border-t border-gray-200 z-40">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Font size toggle – mobile (floating button) */}
      <div className="fixed top-3 right-3 z-40 md:hidden flex gap-1">
        <button
          onClick={() => { const i = SIZES.indexOf(fontSize); if (i > 0) setFontSize(SIZES[i - 1]) }}
          disabled={fontSize === 'small'}
          className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm disabled:opacity-30"
          aria-label="Perkecil tulisan"
        >
          <AArrowDown className="w-4 h-4" />
        </button>
        <button
          onClick={() => { const i = SIZES.indexOf(fontSize); if (i < SIZES.length - 1) setFontSize(SIZES[i + 1]) }}
          disabled={fontSize === 'xlarge'}
          className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm disabled:opacity-30"
          aria-label="Perbesar tulisan"
        >
          <AArrowUp className="w-4 h-4" />
        </button>
      </div>

      {/* Onboarding Tour */}
      {!tourDone && <OnboardingTour onDone={() => setTourDone(true)} />}

      {/* Toasts */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-xs">
          {toasts.map(t => (
            <div
              key={t.id}
              className={`px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium text-white ${
                t.type === 'error'
                  ? 'bg-red-600'
                  : t.type === 'info'
                    ? 'bg-blue-600'
                    : 'bg-green-600'
              }`}
            >
              {t.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
