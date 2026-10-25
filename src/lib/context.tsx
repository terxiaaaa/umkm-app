// Importers: App.tsx wraps app, all pages consume via useApp()
// Provides: centralized AppData state, dispatch operations, save to localStorage
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { AppData } from '../types'
import { loadData, saveData } from './storage'
import { getSeedData } from './seed'

interface Toast { id: number; message: string; type: 'success' | 'error' | 'info' }

type FontSize = 'small' | 'normal' | 'large' | 'xlarge'
const FONT_SIZES: Record<FontSize, string> = { small: '14px', normal: '16px', large: '18px', xlarge: '20px' }
const FONT_KEY = 'umkm_font_size'
const TOUR_KEY = 'umkm_tour_done'

interface AppContextType {
  data: AppData
  setData: (updater: (prev: AppData) => AppData) => void
  toast: (message: string, type?: Toast['type']) => void
  toasts: Toast[]
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
  tourDone: boolean
  setTourDone: (v: boolean) => void
}

const AppContext = createContext<AppContextType | null>(null)

let toastId = 0

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setDataRaw] = useState<AppData>(() => {
    const stored = loadData()
    if (stored) return stored
    const seed = getSeedData()
    saveData(seed)
    return seed
  })
  const [toasts, setToasts] = useState<Toast[]>([])

  const [fontSize, setFontSizeRaw] = useState<FontSize>(() => {
    try { return (localStorage.getItem(FONT_KEY) as FontSize) || 'normal' } catch { return 'normal' }
  })
  const [tourDone, setTourDoneRaw] = useState(() => {
    try { return localStorage.getItem(TOUR_KEY) === '1' } catch { return false }
  })

  useEffect(() => { saveData(data) }, [data])

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZES[fontSize]
    try { localStorage.setItem(FONT_KEY, fontSize) } catch {}
  }, [fontSize])

  const setFontSize = useCallback((size: FontSize) => setFontSizeRaw(size), [])
  const setTourDone = useCallback((v: boolean) => {
    setTourDoneRaw(v)
    try { localStorage.setItem(TOUR_KEY, v ? '1' : '') } catch {}
  }, [])

  const setData = useCallback((updater: (prev: AppData) => AppData) => {
    setDataRaw(prev => updater(prev))
  }, [])

  const toast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  return (
    <AppContext.Provider value={{ data, setData, toast, toasts, fontSize, setFontSize, tourDone, setTourDone }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
