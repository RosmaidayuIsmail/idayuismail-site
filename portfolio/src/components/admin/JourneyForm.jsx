import { useState } from 'react'
import { Save, Trash2, Milestone } from 'lucide-react'
import { api } from './adminApi'
import { useConfirm } from './useConfirm'
import Field from './Field'
import LangFields from './LangFields'
import CollapsibleCard from './CollapsibleCard'

export default function JourneyForm({ initial, onSaved, apiKey, defaultOpen }) {
  const [j, setJ] = useState(initial)
  const [status, setStatus] = useState('')
  const { confirm, dialog } = useConfirm()
  const isNew = !initial.createdAt

  const save = async () => {
    setStatus('Saving…')
    try {
      if (isNew) await api('journey', 'POST', j, apiKey)
      else await api(`journey/${j.slug}`, 'PUT', j, apiKey)
      setStatus('Saved ✓')
      onSaved()
    } catch (e) { setStatus(`Error: ${e.message}`) }
  }
  const remove = async () => {
    if (!(await confirm(`Delete "${j.title.en}"? This can't be undone.`))) return
    try { await api(`journey/${j.slug}`, 'DELETE', null, apiKey); onSaved() } catch (e) { setStatus(`Error: ${e.message}`) }
  }

  return (
    <>
      <CollapsibleCard icon={<Milestone size={16} />} title={j.title.en || '(new update)'} subtitle={j.date || j.slug} defaultOpen={defaultOpen}>
        <Field label="Slug (URL path)" value={j.slug} onChange={(v) => setJ({ ...j, slug: v })} />
        <Field label={'Date (e.g. "Jan 2026")'} value={j.date} onChange={(v) => setJ({ ...j, date: v })} />
        <LangFields label="Title" value={j.title} onChange={(v) => setJ({ ...j, title: v })} />
        <LangFields label="Description" value={j.body} onChange={(v) => setJ({ ...j, body: v })} />
        <Field label="Sort order" value={j.sortOrder} onChange={(v) => setJ({ ...j, sortOrder: Number(v) || 0 })} />
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
