import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function CollapsibleCard({ thumbnail, icon, title, subtitle, defaultOpen, children }) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <div className="admin-card">
      <button type="button" className="admin-card-summary" onClick={() => setOpen((o) => !o)}>
        {thumbnail
          ? <img className="admin-card-thumb" src={thumbnail} alt="" onError={(e) => { e.target.style.visibility = 'hidden' }} />
          : <span className="admin-card-icon">{icon}</span>}
        <span className="admin-card-titles">
          <span className="admin-card-title">{title || 'Untitled'}</span>
          {subtitle && <span className="admin-card-subtitle">{subtitle}</span>}
        </span>
        <ChevronDown size={18} className={`admin-chevron ${open ? 'open' : ''}`} />
      </button>
      <div className={`admin-card-body-wrap ${open ? 'open' : ''}`}>
        <div className="admin-card-body">{children}</div>
      </div>
    </div>
  )
}
