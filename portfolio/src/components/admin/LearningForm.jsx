import { useState } from 'react'
import { Save, Trash2, BookOpen } from 'lucide-react'
import { api } from './adminApi'
import { useConfirm } from './useConfirm'
import Field from './Field'
import LangFields from './LangFields'
import CollapsibleCard from './CollapsibleCard'

export default function LearningForm({ initial, onSaved, apiKey, defaultOpen }) {
  const [l, setL] = useState(initial)
  const [status, setStatus] = useState('')
  const { confirm, dialog } = useConfirm()
  const isNew = !initial.createdAt

  const save = async () => {
    setStatus('Saving…')
    try {
      if (isNew) await api('learning', 'POST', l, apiKey)
      else await api(`learning/${l.slug}`, 'PUT', l, apiKey)
      setStatus('Saved ✓')
      onSaved()
    } catch (e) { setStatus(`Error: ${e.message}`) }
  }
  const remove = async () => {
    if (!(await confirm(`Delete "${l.title.en}"? This can't be undone.`))) return
    try { await api(`learning/${l.slug}`, 'DELETE', null, apiKey); onSaved() } catch (e) { setStatus(`Error: ${e.message}`) }
  }

  return (
    <>
      <CollapsibleCard icon={<BookOpen size={16} />} title={l.title.en || '(new entry)'} subtitle={l.slug} defaultOpen={defaultOpen}>
        <Field label="Slug (URL path)" value={l.slug} onChange={(v) => setL({ ...l, slug: v })} />
        <LangFields label="Title" value={l.title} onChange={(v) => setL({ ...l, title: v })} />
        <LangFields label="Description" value={l.body} onChange={(v) => setL({ ...l, body: v })} />
        <Field label="Sort order" value={l.sortOrder} onChange={(v) => setL({ ...l, sortOrder: Number(v) || 0 })} />
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
