import type { AppData } from '../types'

const STORAGE_KEY = 'umkm_app_data'

export function loadData(): AppData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Gagal menyimpan data:', e)
  }
}

export function clearData(): void {
  localStorage.removeItem(STORAGE_KEY)
}

let _uid = Date.now()
export function uid(prefix: string): string {
  return `${prefix}_${(++_uid).toString(36)}`
}
