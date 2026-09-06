import { useEffect, useState } from 'react'
import { Save, Type } from 'lucide-react'
import { api } from './adminApi'
import LangFields from './LangFields'
import CollapsibleCard from './CollapsibleCard'

// Every group's `fields` are [key, label] pairs matching the flat keys the
// /api/portfolio/site-text endpoint stores (dotted for nested UI strings
// like "nav.about" - see server/utils/portfolio-db.ts's seed for the full
// set this was migrated from, portfolio/src/data/content.js's UI object).
const GROUPS = [
  { heading: 'Navigation', fields: [
    ['nav.about', 'About'], ['nav.work', 'Work'], ['nav.journey', 'Journey'],
    ['nav.learning', 'Learning'], ['nav.services', 'Services'], ['nav.contact', 'Contact'],
  ] },
  { heading: 'Hero', fields: [
    ['heroCtaPrimary', 'Primary button'], ['heroCtaSecondary', 'Secondary button'],
    ['vertical', 'Vertical side text'], ['scroll', '"Scroll" hint'],
  ] },
  { heading: 'About & skills', fields: [
    ['aboutLabel', 'About heading'], ['skillsLabel', 'Skills heading'],
  ] },
  { heading: 'Work', fields: [
    ['workLabel', 'Heading'], ['workSub', 'Subheading'], ['workExpand', '"Expand" button'],
    ['workClose', '"Close" button'], ['workVisit', '"Visit live site" button'], ['backToWork', '"Back to work" link'],
  ] },
  { heading: 'Journey & Moments', fields: [
    ['journeyLabel', 'Journey heading'], ['journeySub', 'Journey subheading'],
    ['momentsLabel', 'Moments heading'], ['momentsSub', 'Moments subheading'],
  ] },
  { heading: 'Learning & certifications', fields: [
    ['learningLabel', 'Heading'], ['learningSub', 'Subheading'], ['certLabel', 'Certifications label'],
  ] },
  { heading: 'Services', fields: [
    ['servicesLabel', 'Heading'], ['servicesSub', 'Subheading'], ['cta', '"Get in touch" button'],
  ] },
  { heading: 'Contact', fields: [
    ['contactLabel', 'Heading'], ['contactSub', 'Subheading'],
    ['contactHeading', 'Call-to-action question'], ['sealQuote', 'Seal stamp quote'],
  ] },
  { heading: 'Footer', fields: [
    ['footerLinkLabels.email', 'Email link label'], ['footerLinkLabels.whatsapp', 'WhatsApp link label'],
    ['footerLinkLabels.instagram', 'Instagram link label'], ['footerLinkLabels.linkedin', 'LinkedIn link label'],
    ['footerNote', 'Footer note'],
  ] },
  { heading: 'Misc', fields: [
    ['loading', 'Loading text'], ['notFound', 'Not-found text'],
  ] },
]

const EMPTY_VALUE = { en: '', ko: '', zh: '' }

export default function SiteTextForm({ apiKey }) {
  const [text, setText] = useState(null)
  const [status, setStatus] = useState('')

  useEffect(() => { api('site-text').then(setText).catch(() => setText({})) }, [])
  if (!text) return <p className="admin-status">Loading…</p>

  const setField = (key, value) => setText((t) => ({ ...t, [key]: value }))
  const save = async () => {
    setStatus('Saving…')
    try { await api('site-text', 'PUT', text, apiKey); setStatus('Saved ✓') } catch (e) { setStatus(`Error: ${e.message}`) }
  }

  return (
    <div className="admin-list">
      {GROUPS.map((group) => (
        <CollapsibleCard key={group.heading} icon={<Type size={16} />} title={group.heading}>
          {group.fields.map(([key, label]) => (
            <LangFields key={key} label={label} value={text[key] || EMPTY_VALUE} onChange={(v) => setField(key, v)} />
          ))}
        </CollapsibleCard>
      ))}
      <div className="admin-actions admin-actions-sticky">
        <button onClick={save} className="admin-btn primary"><Save size={14} /> Save all text</button>
        {status && <span className={`admin-status ${status.startsWith('Error') ? 'is-error' : status.includes('✓') ? 'is-success' : ''}`}>{status}</span>}
      </div>
    </div>
  )
}
