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

function Shell({ children }) {
  const [lang, setLang] = useState('en')
  const [showRoman, setShowRoman] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState('top')
  const location = useLocation()
  const { data: profile } = useApi('profile')

  const ui = { lang, setLang, showRoman, setShowRoman, t: UI[lang] }
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
