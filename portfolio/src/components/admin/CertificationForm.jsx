import { useState } from 'react'
import { Save, Trash2, Award } from 'lucide-react'
import { api } from './adminApi'
import { useConfirm } from './useConfirm'
import Field from './Field'
import LangFields from './LangFields'
import CollapsibleCard from './CollapsibleCard'

export default function CertificationForm({ initial, onSaved, apiKey, defaultOpen }) {
  const [c, setC] = useState(initial)
  const [status, setStatus] = useState('')
  const { confirm, dialog } = useConfirm()
  const isNew = !c.id

  const save = async () => {
    setStatus('Saving…')
    try {
      if (isNew) await api('certifications', 'POST', c, apiKey)
      else await api(`certifications/${c.id}`, 'PUT', c, apiKey)
      setStatus('Saved ✓')
      onSaved()
    } catch (e) { setStatus(`Error: ${e.message}`) }
  }
  const remove = async () => {
    if (!(await confirm(`Delete "${c.text.en}"? This can't be undone.`))) return
    try { await api(`certifications/${c.id}`, 'DELETE', null, apiKey); onSaved() } catch (e) { setStatus(`Error: ${e.message}`) }
  }

  return (
    <>
      <CollapsibleCard icon={<Award size={16} />} title={c.text.en || '(new certification)'} defaultOpen={defaultOpen}>
        <LangFields label="Text" value={c.text} onChange={(v) => setC({ ...c, text: v })} />
        <Field label="Sort order" value={c.sortOrder} onChange={(v) => setC({ ...c, sortOrder: Number(v) || 0 })} />
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
