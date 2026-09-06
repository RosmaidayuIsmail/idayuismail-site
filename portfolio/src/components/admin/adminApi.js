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

// Multipart upload to /api/portfolio/upload (used by Stories - unlike
// Moments/Projects, which inline a compressed base64 image directly into
// the DB, Stories go through real server-side storage since photo+video at
// Stories volume doesn't fit in a SQLite text column - see
// server/api/portfolio/upload.ts).
export async function uploadFile(file, key) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/portfolio/upload', {
    method: 'POST',
    headers: { 'x-api-key': key },
    body: formData,
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `Upload failed (${res.status})`)
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
