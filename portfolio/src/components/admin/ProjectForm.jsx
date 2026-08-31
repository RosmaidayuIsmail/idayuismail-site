import { useState } from 'react'
import { Save, Trash2, Briefcase, Upload, Loader2 } from 'lucide-react'
import { api } from './adminApi'
import { fileToDataURL } from './imageUpload'
import { useConfirm } from './useConfirm'
import Field from './Field'
import LangFields from './LangFields'
import ImagePreview from './ImagePreview'
import CollapsibleCard from './CollapsibleCard'

export default function ProjectForm({ initial, onSaved, apiKey, defaultOpen }) {
  const [p, setP] = useState(initial)
  const [status, setStatus] = useState('')
  const [uploading, setUploading] = useState(false)
  const { confirm, dialog } = useConfirm()
  const isNew = !initial.createdAt
  const imagesStr = Array.isArray(p.images) ? p.images.join('\n') : p.images
  const firstImage = imagesStr.split('\n').map((s) => s.trim()).find(Boolean)

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploading(true)
    setStatus(`Compressing ${files.length} image${files.length > 1 ? 's' : ''}…`)
    try {
      const dataUrls = await Promise.all(files.map((f) => fileToDataURL(f)))
      const existing = imagesStr.split('\n').map((s) => s.trim()).filter(Boolean)
      setP({ ...p, images: [...existing, ...dataUrls].join('\n') })
      setStatus(`Added ${dataUrls.length} photo${dataUrls.length > 1 ? 's' : ''} — remember to hit Save`)
    } catch (err) {
      setStatus(`Error: ${err.message}`)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const save = async () => {
    setStatus('Saving…')
    try {
      const payload = {
        ...p,
        tags: typeof p.tags === 'string' ? p.tags.split(',').map((t) => t.trim()).filter(Boolean) : p.tags,
        images: typeof p.images === 'string' ? p.images.split('\n').map((u) => u.trim()).filter(Boolean) : p.images,
      }
      if (isNew) await api('projects', 'POST', payload, apiKey)
      else await api(`projects/${p.slug}`, 'PUT', payload, apiKey)
      setStatus('Saved ✓')
      onSaved()
    } catch (e) { setStatus(`Error: ${e.message}`) }
  }
  const remove = async () => {
    if (!(await confirm(`Delete "${p.title.en}"? This can't be undone.`))) return
    try { await api(`projects/${p.slug}`, 'DELETE', null, apiKey); onSaved() } catch (e) { setStatus(`Error: ${e.message}`) }
  }

  return (
    <>
      <CollapsibleCard thumbnail={firstImage} icon={<Briefcase size={16} />} title={p.title.en || '(new project)'} subtitle={p.slug} defaultOpen={defaultOpen}>
        <Field label="Slug (URL path)" value={p.slug} onChange={(v) => setP({ ...p, slug: v })} />
        <LangFields label="Title" value={p.title} onChange={(v) => setP({ ...p, title: v })} />
        <LangFields label="Short description" value={p.body} onChange={(v) => setP({ ...p, body: v })} />
        <LangFields label="Expanded detail" value={p.more} onChange={(v) => setP({ ...p, more: v })} />
        <Field label="Tags (comma separated)" value={Array.isArray(p.tags) ? p.tags.join(', ') : p.tags} onChange={(v) => setP({ ...p, tags: v })} />
        <Field label="Live link (optional)" value={p.link || ''} onChange={(v) => setP({ ...p, link: v })} />

        <label className="admin-upload-btn">
          {uploading ? <Loader2 size={15} className="admin-spin" /> : <Upload size={15} />}
          Upload photos from your device
          <input type="file" accept="image/*" multiple onChange={handleUpload} hidden disabled={uploading} />
        </label>

        <Field
          label="Or paste image URLs (one per line)"
          value={imagesStr}
          onChange={(v) => setP({ ...p, images: v })}
          textarea
          hint="First image becomes the card thumbnail; all of them show on the project page. Uploaded photos and pasted URLs both work here."
        />
        <ImagePreview urls={imagesStr} />
        <Field label="Sort order" value={p.sortOrder} onChange={(v) => setP({ ...p, sortOrder: Number(v) || 0 })} />
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
