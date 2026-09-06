import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import MobileMenu from './components/MobileMenu'
import Home from './pages/Home'
import Journey from './pages/Journey'
import WorkDetail from './pages/WorkDetail'
import LearningDetail from './pages/LearningDetail'
import JourneyDetail from './pages/JourneyDetail'
import Admin from './pages/Admin'
import ChatWidget from './components/ChatWidget'
import { UI, NEXT_LANG } from './data/content'
import { useApi } from './hooks/useApi'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname])
  return null
}

const LANG_STORAGE_KEY = 'portfolio_lang'

// Un-flattens the site_text API's { "nav.about": {en,ko,zh}, ... } into a
// nested object resolved to one language - "nav.about" becomes nav.about,
// a plain key like "heroCtaPrimary" stays top-level. Falls back to
// content.js's UI[lang] value for any key not yet in the DB (e.g. right
// after a fresh deploy before ensurePortfolioSchema's seed has run, or if
// the site-text fetch fails) so the site never shows blank chrome text.
function resolveSiteText(siteText, lang) {
  const out = {}
  for (const [key, value] of Object.entries(siteText || {})) {
    const resolved = value?.[lang] || value?.en || ''
    if (!resolved) continue
    const parts = key.split('.')
    if (parts.length === 1) {
      out[key] = resolved
    } else {
      out[parts[0]] = { ...out[parts[0]], [parts[1]]: resolved }
    }
  }
  return out
}

function resolveServices(services, lang) {
  if (!services || services.length === 0) return null
  return services.map((s) => ({
    glyph: s.glyph,
    title: s.title?.[lang] || s.title?.en || '',
    body: s.body?.[lang] || s.body?.en || '',
  }))
}

function resolveCertifications(certifications, lang) {
  if (!certifications || certifications.length === 0) return null
  return certifications.map((c) => c.text?.[lang] || c.text?.en || '')
}

function Shell({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem(LANG_STORAGE_KEY) || 'en')
  const [showRoman, setShowRoman] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState('top')
  const location = useLocation()
  const { data: profile } = useApi('profile')
  const { data: siteText } = useApi('site-text')
  const { data: dbServices } = useApi('services')
  const { data: dbCertifications } = useApi('certifications')

  const setLang = (next) => {
    localStorage.setItem(LANG_STORAGE_KEY, next)
    setLangState(next)
  }

  // Base per-language chrome text (content.js) with any admin-edited DB
  // values layered on top, so editing one field in admin never has to
  // wait on every other field also existing in the DB.
  const t = {
    ...UI[lang],
    ...resolveSiteText(siteText, lang),
    services: resolveServices(dbServices, lang) || UI[lang].services,
    certifications: resolveCertifications(dbCertifications, lang) || UI[lang].certifications,
  }
  const ui = { lang, setLang, showRoman, setShowRoman, t }
  const isAdmin = location.pathname === '/admin'

  return (
    <>
      {!isAdmin && (
        <>
          <Header ui={ui} active={active} onMenuOpen={() => setMenuOpen(true)} profileName={profile?.name} />
          {menuOpen && <MobileMenu ui={ui} active={active} onClose={() => setMenuOpen(false)} />}
          <ChatWidget />
        </>
      )}
      <Routes>
        <Route path="/" element={<Home ui={ui} setActive={setActive} />} />
        <Route path="/journey" element={<Journey ui={ui} />} />
        <Route path="/work/:slug" element={<WorkDetail ui={ui} />} />
        <Route path="/journey/:slug" element={<JourneyDetail ui={ui} />} />
        <Route path="/learning/:slug" element={<LearningDetail ui={ui} />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/portfolio">
      <ScrollToTop />
      <Shell />
    </BrowserRouter>
  )
}
