// Importers: App.tsx router. Layout wrapper with desktop admin auth, bottom navigation taskbar + toast display.
import { useState, useEffect } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Home, Package, ArrowLeftRight, BarChart3, Settings, AArrowUp, AArrowDown, Lock, WifiOff, Smartphone, AlertTriangle, LogOut } from 'lucide-react'
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

export default function AppLayout() {
  const { data, toasts, fontSize, setFontSize, tourDone, setTourDone } = useApp()
  const [isMobile, setIsMobile] = useState(isMobileDevice)
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return sessionStorage.getItem('umkm_admin_auth') === '1'
    } catch {
      return false
    }
  })
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginFailed, setLoginFailed] = useState(false)

  useEffect(() => {
    function handleResize() {
      setIsMobile(isMobileDevice())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (username.trim() === 'user' && password === '1234') {
      setIsAdmin(true)
      setLoginFailed(false)
      try {
        sessionStorage.setItem('umkm_admin_auth', '1')
      } catch {}
    } else {
      setLoginFailed(true)
    }
  }

  function handleLogout() {
    setIsAdmin(false)
    setUsername('')
    setPassword('')
    setLoginFailed(false)
    try {
      sessionStorage.removeItem('umkm_admin_auth')
    } catch {}
  }

  // Desktop view without admin authentication
  if (!isMobile && !isAdmin) {
    // If login was attempted and failed, show the warning screen with error details
    if (loginFailed) {
      return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-20 h-20 bg-red-950/60 border border-red-800 text-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <WifiOff className="w-10 h-10" />
          </div>

          <span className="text-xs uppercase tracking-widest font-mono text-red-400 mb-2 bg-red-950/40 border border-red-900/50 px-3 py-1 rounded-full">
            Akses Ditolak
          </span>

          <h1 className="text-2xl font-bold text-gray-100 mb-2 mt-2">
            Akses Laptop/Desktop Diputus
          </h1>

          {/* Error notice requested by user */}
          <div className="bg-red-900/40 border border-red-700/60 text-red-200 rounded-xl p-3.5 max-w-sm w-full text-xs flex items-start gap-2.5 mb-4 text-left">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300">Username atau password salah!</p>
              <p className="text-red-200/90 mt-0.5">Visual desktop ini khusus untuk admin saja.</p>
            </div>
          </div>

          <p className="text-gray-400 text-sm max-w-sm leading-relaxed mb-6">
            Sistem mendeteksi Anda membuka aplikasi ini dari laptop/PC tanpa kredensial admin yang valid. Sesi perangkat ini dinonaktifkan.
          </p>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 max-w-sm w-full text-left mb-6">
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

          <button
            onClick={() => {
              setLoginFailed(false)
              setPassword('')
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Coba Login Admin Lagi
          </button>
        </div>
      )
    }

    // Default desktop view: Admin Login form
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 select-none">
        <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
          <div className="w-14 h-14 bg-blue-950/60 border border-blue-800 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-gray-100">Login Admin Desktop</h1>
            <p className="text-xs text-gray-400 mt-1">
              Visual desktop ini khusus untuk admin saja
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Masukkan username"
                required
                className="w-full px-3.5 py-2.5 text-sm bg-gray-950 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
                className="w-full px-3.5 py-2.5 text-sm bg-gray-950 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors mt-2"
            >
              Masuk sebagai Admin
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 truncate">
          <h1 className="text-base font-bold text-gray-900 truncate">
            {data.settings.businessName || 'UMKM App'}
          </h1>
          {!isMobile && isAdmin && (
            <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">
              Admin
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Font size toggle */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => { const i = SIZES.indexOf(fontSize); if (i > 0) setFontSize(SIZES[i - 1]) }}
              disabled={fontSize === 'small'}
              className="p-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg disabled:opacity-30 transition-colors"
              aria-label="Perkecil tulisan"
            >
              <AArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => { const i = SIZES.indexOf(fontSize); if (i < SIZES.length - 1) setFontSize(SIZES[i + 1]) }}
              disabled={fontSize === 'xlarge'}
              className="p-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg disabled:opacity-30 transition-colors"
              aria-label="Perbesar tulisan"
            >
              <AArrowUp className="w-4 h-4" />
            </button>
          </div>

          {/* Admin Logout button on desktop */}
          {!isMobile && isAdmin && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 px-2 py-1.5 rounded-lg transition-colors ml-1"
              title="Keluar Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content with bottom padding so taskbar never overlaps */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 pb-24">
        <Outlet />
      </main>

      {/* Bottom Nav Taskbar – stays fixed at bottom across all panels */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-2xl mx-auto flex">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                  isActive ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-800'
                }`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

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
