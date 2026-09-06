import { useState } from 'react'
import { Trash2, Send, Film, Loader2 } from 'lucide-react'
import { api, uploadFile } from './adminApi'
import { useConfirm } from './useConfirm'

export function StoryComposer({ onPosted, apiKey }) {
  const [media, setMedia] = useState(null) // { url, type } once uploaded
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setStatus('')
    try {
      const result = await uploadFile(file, apiKey)
      setMedia(result)
      setStatus('Uploaded ✓')
    } catch (err) {
      setStatus(`Error: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const post = async () => {
    if (!media) {
      setStatus('Add a photo or video first.')
      return
    }
    setStatus('Posting…')
    try {
      await api('stories', 'POST', { mediaUrl: media.url, mediaType: media.type, caption: caption.trim() }, apiKey)
      setMedia(null)
      setCaption('')
      setStatus('Posted ✓ — visible for 24 hours')
      onPosted()
    } catch (e) {
      setStatus(`Error: ${e.message}`)
    }
  }

  return (
    <div className="admin-card admin-card-static moment-composer">
      <div className="admin-card-body">
        <label className="moment-upload-btn">
          {uploading ? <Loader2 size={16} className="admin-spin" /> : <Film size={16} />}
          {media ? 'Change photo/video' : 'Add a photo or video'}
          <input type="file" accept="image/*,video/*" capture="environment" onChange={handleFile} hidden />
        </label>
        <p className="admin-hint moment-camera-hint">Stories disappear automatically 24 hours after posting.</p>

        {media && (
          <div className="moment-preview">
            {media.type === 'video'
              ? <video src={media.url} muted controls />
              : <img src={media.url} alt="" />}
          </div>
        )}

        <label className="admin-field">
          <span>Caption (optional)</span>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={2}
            placeholder="Add a short caption…"
          />
        </label>

        <div className="admin-actions">
          <button onClick={post} className="admin-btn primary" disabled={uploading}>
            <Send size={14} /> Post story
          </button>
          {status && <span className={`admin-status ${status.startsWith('Error') ? 'is-error' : status.includes('✓') ? 'is-success' : ''}`}>{status}</span>}
        </div>
      </div>
    </div>
  )
}

export function StoryItem({ story, onDeleted, apiKey }) {
  const [status, setStatus] = useState('')
  const { confirm, dialog } = useConfirm()

  const remove = async () => {
    if (!(await confirm("Delete this story? This can't be undone."))) return
    try {
      await api(`stories/${story.id}`, 'DELETE', null, apiKey)
      onDeleted()
    } catch (e) {
      setStatus(`Error: ${e.message}`)
    }
  }

  return (
    <>
      <div className="admin-card moment-item">
        <div className="admin-card-body moment-item-body">
          {story.mediaType === 'video'
            ? <video src={story.mediaUrl} muted className="moment-item-thumb" />
            : <img src={story.mediaUrl} alt="" className="moment-item-thumb" />}
          <div className="moment-item-text">
            <p>{story.caption || <em>(no caption)</em>}</p>
            <span className="admin-hint">{new Date(story.createdAt).toLocaleString()}</span>
          </div>
          <button onClick={remove} className="admin-btn danger"><Trash2 size={14} /></button>
        </div>
        {status && <p className={`admin-status ${status.startsWith('Error') ? 'is-error' : ''}`}>{status}</p>}
      </div>
      {dialog}
    </>
  )
}
