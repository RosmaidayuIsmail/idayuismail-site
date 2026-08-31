import { useState } from 'react'
import { Trash2, Send, Image as ImageIcon, Loader2, Heart } from 'lucide-react'
import { api } from './adminApi'
import { fileToDataURL, estimateDataUrlKB } from './imageUpload'
import { useConfirm } from './useConfirm'

export function MomentComposer({ onPosted, apiKey }) {
  const [image, setImage] = useState(null)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setStatus('')
    try {
      const dataUrl = await fileToDataURL(file)
      setImage(dataUrl)
      setStatus(`Ready — about ${estimateDataUrlKB(dataUrl)} KB after compression`)
    } catch (err) {
      setStatus(`Error: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const post = async () => {
    if (!image && !caption.trim()) {
      setStatus('Add a photo or write something first.')
      return
    }
    setStatus('Posting…')
    try {
      await api('moments', 'POST', { image, caption: caption.trim() }, apiKey)
      setImage(null)
      setCaption('')
      setStatus('Posted ✓')
      onPosted()
    } catch (e) {
      setStatus(`Error: ${e.message}`)
    }
  }

  return (
    <div className="admin-card admin-card-static moment-composer">
      <div className="admin-card-body">
        <label className="moment-upload-btn">
          {uploading ? <Loader2 size={16} className="admin-spin" /> : <ImageIcon size={16} />}
          {image ? 'Change photo' : 'Add a photo'}
          <input type="file" accept="image/*" capture="environment" onChange={handleFile} hidden />
        </label>
        <p className="admin-hint moment-camera-hint">On your phone this opens the camera directly; on desktop it opens your file browser instead.</p>

        {image && (
          <div className="moment-preview">
            <img src={image} alt="" />
          </div>
        )}

        <label className="admin-field">
          <span>Caption</span>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={2}
            placeholder="What's going on today?"
          />
        </label>

        <div className="admin-actions">
          <button onClick={post} className="admin-btn primary" disabled={uploading}>
            <Send size={14} /> Post
          </button>
          {status && <span className={`admin-status ${status.startsWith('Error') ? 'is-error' : status.includes('✓') ? 'is-success' : ''}`}>{status}</span>}
        </div>
      </div>
    </div>
  )
}

export function MomentItem({ moment, onDeleted, apiKey }) {
  const [status, setStatus] = useState('')
  const { confirm, dialog } = useConfirm()

  const remove = async () => {
    if (!(await confirm("Delete this moment? This can't be undone."))) return
    try {
      await api(`moments/${moment.id}`, 'DELETE', null, apiKey)
      onDeleted()
    } catch (e) {
      setStatus(`Error: ${e.message}`)
    }
  }

  return (
    <>
      <div className="admin-card moment-item">
        <div className="admin-card-body moment-item-body">
          {moment.image && <img src={moment.image} alt="" className="moment-item-thumb" />}
          <div className="moment-item-text">
            <p>{moment.caption || <em>(no caption)</em>}</p>
            <span className="admin-hint">
              {new Date(moment.createdAt).toLocaleString()}
              {moment.likes > 0 && <span className="moment-item-likes"><Heart size={11} fill="currentColor" /> {moment.likes}</span>}
            </span>
          </div>
          <button onClick={remove} className="admin-btn danger"><Trash2 size={14} /></button>
        </div>
        {status && <p className={`admin-status ${status.startsWith('Error') ? 'is-error' : ''}`}>{status}</p>}
      </div>
      {dialog}
    </>
  )
}
