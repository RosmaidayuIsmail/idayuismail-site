import { useCallback, useRef, useState } from 'react'
import Loading from './Loading'
import { romanize } from '../lib/romanize'
import Roman from './Roman'
import './Hero.css'

export default function Hero({ ui, profile }) {
  const heroRef = useRef(null)
  const [trail, setTrail] = useState({ x: 0, y: 0, show: false })

  const handleMove = useCallback((e) => {
    const rect = heroRef.current.getBoundingClientRect()
    setTrail({ x: e.clientX - rect.left, y: e.clientY - rect.top, show: true })
  }, [])

  if (!profile) {
    return (
      <section id="top" className="hero hero-loading">
        <Loading label={ui.t.loading} />
      </section>
    )
  }

  const [first, ...rest] = profile.name.split(' ')
  const lastName = rest.join(' ')
  const showRoman = ui.showRoman && ui.lang !== 'en'
  const tagText = profile[`tag_${ui.lang}`] || profile.tag_en

  return (
    <section
      id="top"
      ref={heroRef}
      className="hero"
      onMouseMove={handleMove}
      onMouseLeave={() => setTrail((s) => ({ ...s, show: false }))}
    >
      <div className="hero-frame" />
      {trail.show && <div className="ink-trail" style={{ left: trail.x, top: trail.y }} />}

      <div className="hero-inner">
        <div className="hero-text">
          <span className="hero-eyebrow">{profile.name} — {profile.title}</span>
          <h1 className="hero-title">{first}<br />{lastName}</h1>
          <Roman as="p" text={tagText} lang={ui.lang} show={showRoman} className="hero-tag" />
          <div className="hero-cta-row">
            <a href="#work" className="hero-cta primary">{ui.t.heroCtaPrimary}</a>
            <a href="#contact" className="hero-cta secondary">{ui.t.heroCtaSecondary}</a>
          </div>
        </div>
        <div className="hero-vertical-wrap">
          {ui.t.vertical.split('').map((ch, i) =>
            ch === ' ' ? (
              <div key={i} className="hero-vchar-gap" />
            ) : (
              <div key={i} className="hero-vchar-row">
                <span className="hero-vchar">{ch}</span>
                {showRoman && <span className="hero-vchar-roman">{romanize(ch, ui.lang)}</span>}
              </div>
            )
          )}
        </div>
      </div>

      <div className="scroll-cue">{ui.t.scroll}</div>
    </section>
  )
}
