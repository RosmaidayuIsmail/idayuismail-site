import { useState } from 'react'

const STORAGE_KEY = 'admin_session_key'

export function useAuth() {
  const [key, setKeyState] = useState(() => localStorage.getItem(STORAGE_KEY) || '')

  const login = (k) => {
    localStorage.setItem(STORAGE_KEY, k)
    setKeyState(k)
  }
  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setKeyState('')
  }

  return { key, isAuthed: !!key, login, logout }
}

export async function api(path, method = 'GET', body, key) {
  const res = await fetch(`/api/portfolio/${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(key ? { 'x-api-key': key } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `Request failed (${res.status})`)
  return res.json()
}

export async function translate(text, target) {
  const res = await fetch('/api/portfolio/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, target }),
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Translation failed')
  const data = await res.json()
  return data.translated
}
