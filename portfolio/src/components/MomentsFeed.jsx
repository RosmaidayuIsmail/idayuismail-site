import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import MomentLightbox from './MomentLightbox'
import './MomentsFeed.css'

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr.replace(' ', 'T') + 'Z').getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function MomentsFeed({ ui }) {
  const { data: moments } = useApi('moments')
  const [active, setActive] = useState(null)

  if (!moments || moments.length === 0) return null

  return (
    <div className="moments-feed">
      <div className="moments-feed-head">
        <h2>{ui.t.momentsLabel}</h2>
        <span>{ui.t.momentsSub}</span>
      </div>
      <div className="moments-scroll">
        {moments.map((m) => (
          <button key={m.id} className="moment-card" onClick={() => setActive(m)}>
            {m.image && <img src={m.image} alt="" loading="lazy" />}
            {m.caption && <p className="moment-caption">{m.caption}</p>}
            <span className="moment-card-foot">
              <span className="moment-time">{timeAgo(m.createdAt)}</span>
              {m.likes > 0 && <span className="moment-card-likes"><Heart size={11} fill="currentColor" /> {m.likes}</span>}
            </span>
          </button>
        ))}
      </div>

      {active && <MomentLightbox moment={active} ui={ui} onClose={() => setActive(null)} />}
    </div>
  )
}
