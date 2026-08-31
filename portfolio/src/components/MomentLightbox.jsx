import { useEffect, useState } from 'react'
import { X, Heart, Send } from 'lucide-react'
import './MomentLightbox.css'

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr.replace(' ', 'T') + 'Z').getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function MomentLightbox({ moment, ui, onClose }) {
  const [likes, setLikes] = useState(moment.likes || 0)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    setLiked(sessionStorage.getItem(`liked-moment-${moment.id}`) === '1')
    fetch(`/api/portfolio/moments/${moment.id}/comments`)
      .then((r) => r.json())
      .then(setComments)
      .catch(() => {})
  }, [moment.id])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleLike = async () => {
    if (liked) return
    setLiked(true)
    setLikes((n) => n + 1)
    sessionStorage.setItem(`liked-moment-${moment.id}`, '1')
    try {
      const res = await fetch(`/api/portfolio/moments/${moment.id}/like`, { method: 'POST' })
      const data = await res.json()
      if (typeof data.likes === 'number') setLikes(data.likes)
    } catch {
      // optimistic update stands even if the network call fails
    }
  }

  const postComment = async (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setPosting(true)
    try {
      await fetch(`/api/portfolio/moments/${moment.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message }),
      })
      setComments((c) => [...c, { name: name || 'Anonymous', message, createdAt: new Date().toISOString() }])
      setMessage('')
    } catch {
      // leave the draft in place so they can retry
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="moment-lightbox-backdrop" onClick={onClose}>
      <div className="moment-lightbox" onClick={(e) => e.stopPropagation()}>
        <button className="moment-lightbox-close" onClick={onClose} aria-label="Close"><X size={20} /></button>

        {moment.image && (
          <div className="moment-lightbox-image">
            <img src={moment.image} alt="" />
          </div>
        )}

        <div className="moment-lightbox-body">
          {moment.caption && <p className="moment-lightbox-caption">{moment.caption}</p>}
          <span className="moment-lightbox-time">{timeAgo(moment.createdAt)}</span>

          <button className={`moment-like-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
            <Heart size={17} fill={liked ? 'currentColor' : 'none'} /> {likes}
          </button>

          <div className="moment-comments">
            {comments.map((c, i) => (
              <div key={i} className="moment-comment">
                <span className="moment-comment-name">{c.name}</span>
                <span className="moment-comment-message">{c.message}</span>
              </div>
            ))}
            {comments.length === 0 && <p className="moment-comments-empty">No replies yet — be the first.</p>}
          </div>

          <form className="moment-comment-form" onSubmit={postComment}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              maxLength={60}
            />
            <div className="moment-comment-row">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Say something…"
                maxLength={500}
              />
              <button type="submit" disabled={posting || !message.trim()} aria-label="Send">
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
