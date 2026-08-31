import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { api } from './adminApi'
import Field from './Field'
import LangFields from './LangFields'

export default function ProfileForm({ apiKey }) {
  const [p, setP] = useState(null)
  const [status, setStatus] = useState('')

  useEffect(() => { api('profile').then(setP).catch(() => setP({ name: '', title: '', location: '', skills: [], email: '', whatsapp: '', instagram: '', linkedin: '' })) }, [])
  if (!p) return <p className="admin-status">Loading…</p>

  const save = async () => {
    setStatus('Saving…')
    try { await api('profile', 'PUT', p, apiKey); setStatus('Saved ✓') } catch (e) { setStatus(`Error: ${e.message}`) }
  }

  return (
    <div className="admin-card admin-card-static">
      <div className="admin-card-body">
        <Field label="Name" value={p.name} onChange={(v) => setP({ ...p, name: v })} />
        <Field label="Title" value={p.title} onChange={(v) => setP({ ...p, title: v })} />
        <Field label="Location" value={p.location} onChange={(v) => setP({ ...p, location: v })} />
        <LangFields label="Bio" value={{ en: p.bio_en, ko: p.bio_ko, zh: p.bio_zh }} onChange={(v) => setP({ ...p, bio_en: v.en, bio_ko: v.ko, bio_zh: v.zh })} />
        <LangFields label="Tagline" value={{ en: p.tag_en, ko: p.tag_ko, zh: p.tag_zh }} onChange={(v) => setP({ ...p, tag_en: v.en, tag_ko: v.ko, tag_zh: v.zh })} />
        <Field label="Skills (comma separated)" value={(p.skills || []).join(', ')} onChange={(v) => setP({ ...p, skills: v.split(',').map((s) => s.trim()).filter(Boolean) })} />
        <Field label="Email" value={p.email || ''} onChange={(v) => setP({ ...p, email: v })} />
        <Field label="WhatsApp link" value={p.whatsapp || ''} onChange={(v) => setP({ ...p, whatsapp: v })} />
        <Field label="Instagram link" value={p.instagram || ''} onChange={(v) => setP({ ...p, instagram: v })} />
        <Field label="LinkedIn link" value={p.linkedin || ''} onChange={(v) => setP({ ...p, linkedin: v })} />
        <div className="admin-actions">
          <button onClick={save} className="admin-btn primary"><Save size={14} /> Save</button>
          {status && <span className={`admin-status ${status.startsWith('Error') ? 'is-error' : status.includes('✓') ? 'is-success' : ''}`}>{status}</span>}
        </div>
      </div>
    </div>
  )
}
