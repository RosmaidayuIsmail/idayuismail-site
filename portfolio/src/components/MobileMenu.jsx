import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { SECTION_IDS } from '../data/content'
import Roman from './Roman'
import './MobileMenu.css'

export default function MobileMenu({ ui, active, onClose }) {
  const showRoman = ui.showRoman && ui.lang !== 'en'
  return (
    <div className="mobile-menu">
      <button className="mobile-menu-close" onClick={onClose} aria-label="Close menu">
        <X size={26} />
      </button>
      {SECTION_IDS.slice(1).map((id) =>
        id === 'journey' ? (
          <Roman key={id} as={Link} to="/journey" onClick={onClose} text={ui.t.nav.journey} lang={ui.lang} show={showRoman} className="mobile-menu-link" />
        ) : (
          <Roman
            key={id}
            as="a"
            href={`/#${id}`}
            onClick={onClose}
            text={ui.t.nav[id]}
            lang={ui.lang}
            show={showRoman}
            className={`mobile-menu-link ${active === id ? 'active' : ''}`}
          />
        )
      )}
    </div>
  )
}
