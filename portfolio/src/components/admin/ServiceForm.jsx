import { useState } from 'react'
import { Save, Trash2, Sparkles } from 'lucide-react'
import { api } from './adminApi'
import { useConfirm } from './useConfirm'
import Field from './Field'
import LangFields from './LangFields'
import CollapsibleCard from './CollapsibleCard'

export default function ServiceForm({ initial, onSaved, apiKey, defaultOpen }) {
  const [s, setS] = useState(initial)
  const [status, setStatus] = useState('')
  const { confirm, dialog } = useConfirm()
  const isNew = !initial.id

  const save = async () => {
    setStatus('Saving…')
    try {
      if (isNew) await api('services', 'POST', s, apiKey)
      else await api(`services/${s.id}`, 'PUT', s, apiKey)
      setStatus('Saved ✓')
      onSaved()
    } catch (e) { setStatus(`Error: ${e.message}`) }
  }
  const remove = async () => {
    if (!(await confirm(`Delete "${s.title.en}"? This can't be undone.`))) return
    try { await api(`services/${s.id}`, 'DELETE', null, apiKey); onSaved() } catch (e) { setStatus(`Error: ${e.message}`) }
  }

  return (
    <>
      <CollapsibleCard icon={<Sparkles size={16} />} title={s.title.en || '(new service)'} subtitle={s.glyph} defaultOpen={defaultOpen}>
        <Field label="Glyph (single character shown on the card)" value={s.glyph} onChange={(v) => setS({ ...s, glyph: v })} />
        <LangFields label="Title" value={s.title} onChange={(v) => setS({ ...s, title: v })} />
        <LangFields label="Description" value={s.body} onChange={(v) => setS({ ...s, body: v })} />
        <Field label="Sort order" value={s.sortOrder} onChange={(v) => setS({ ...s, sortOrder: Number(v) || 0 })} />
        <div className="admin-actions">
          <button onClick={save} className="admin-btn primary"><Save size={14} /> Save</button>
          {!isNew && <button onClick={remove} className="admin-btn danger"><Trash2 size={14} /> Delete</button>}
          {status && <span className={`admin-status ${status.startsWith('Error') ? 'is-error' : status.includes('✓') ? 'is-success' : ''}`}>{status}</span>}
        </div>
      </CollapsibleCard>
      {dialog}
    </>
  )
}
