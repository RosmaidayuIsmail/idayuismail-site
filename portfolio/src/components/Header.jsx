import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, Languages, CaseSensitive } from 'lucide-react'
import { LANG_LABEL, NEXT_LANG, SECTION_IDS } from '../data/content'
import Roman from './Roman'
import './Header.css'

export default function Header({ ui, active, onMenuOpen, profileName }) {
  const location = useLocation()
  const navigate = useNavigate()
  const showRoman = ui.showRoman && ui.lang !== 'en'

  const handleLogoClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault()
      window.history.replaceState(null, '', '/')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate('/')
    }
  }

  return (
    <header className="site-header">
      <div className="header-left">
        <a href="/" className="home-link" aria-label="Back to Idayu Ismail" title="Back to Idayu Ismail">
          <img src={`${import.meta.env.BASE_URL}idayuismail-logo.svg`} alt="" />
        </a>
        <Link to="/" className="logo" onClick={handleLogoClick}>
          <span className="logo-mark">印</span>
          <span className="logo-text">{profileName || 'Rosmaidayu Ismail'}</span>
        </Link>
      </div>

      <nav className="site-nav">
        <div className="nav-links">
          {SECTION_IDS.slice(1).map((id) =>
            id === 'journey' ? (
              <Roman key={id} as={Link} to="/journey" text={ui.t.nav.journey} lang={ui.lang} show={showRoman} className="nav-link" />
            ) : (
              <Roman
                key={id}
                as="a"
                href={`/#${id}`}
                text={ui.t.nav[id]}
                lang={ui.lang}
                show={showRoman}
                className={`nav-link ${active === id ? 'active' : ''}`}
              />
            )
          )}
        </div>

        <button className="lang-toggle" onClick={() => ui.setLang(NEXT_LANG[ui.lang])} aria-label="Switch language">
          <Languages size={13} /> <span>{LANG_LABEL[ui.lang]}</span>
        </button>

        {ui.lang !== 'en' && (
          <button
            className={`roman-toggle ${ui.showRoman ? 'active' : ''}`}
            onClick={() => ui.setShowRoman((s) => !s)}
            aria-label="Toggle romanized pronunciation"
            title="Show romanized pronunciation"
          >
            <CaseSensitive size={14} />
          </button>
        )}

        <button className="menu-btn" onClick={onMenuOpen} aria-label="Open menu">
          <Menu size={22} />
        </button>
      </nav>
    </header>
  )
}
