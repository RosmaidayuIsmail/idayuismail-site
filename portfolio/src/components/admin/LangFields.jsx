import { useState } from 'react'
import { Languages, Loader2 } from 'lucide-react'
import { translate } from './adminApi'

const LANGS = { en: 'EN', ko: 'KO', zh: '中' }

export default function LangFields({ label, value, onChange }) {
  const [active, setActive] = useState('en')
  const [translating, setTranslating] = useState(false)

  const autoTranslate = async () => {
    const source = value.en?.trim()
    if (!source) return
    setTranslating(true)
    try {
      const [ko, zh] = await Promise.all([
        translate(source, 'ko'),
        translate(source, 'zh-CN'),
      ])
      onChange({ ...value, ko, zh })
      setActive('ko')
    } catch (e) {
      alert(`Auto-translate failed: ${e.message}`)
    } finally {
      setTranslating(false)
    }
  }

  return (
    <div className="admin-lang-group">
      <div className="admin-lang-header">
        <span className="admin-lang-label">{label}</span>
        <div className="admin-lang-header-right">
          {active === 'en' && value.en?.trim() && (
            <button
              type="button"
              className="admin-translate-btn"
              onClick={autoTranslate}
              disabled={translating}
              title="Auto-translate EN into KO and ZH"
            >
              {translating ? <Loader2 size={12} className="admin-spin" /> : <Languages size={12} />}
              {translating ? 'Translating…' : 'Auto-translate'}
            </button>
          )}
          <div className="admin-lang-tabs">
            {Object.entries(LANGS).map(([code, lbl]) => (
              <button
                key={code}
                type="button"
                className={`admin-lang-tab ${active === code ? 'active' : ''}`}
                onClick={() => setActive(code)}
              >
                {lbl}
                {value[code] ? <span className="admin-lang-dot" /> : null}
              </button>
            ))}
          </div>
        </div>
      </div>
      <textarea
        className="admin-lang-textarea"
        rows={3}
        value={value[active] || ''}
        onChange={(e) => onChange({ ...value, [active]: e.target.value })}
        placeholder={active === 'en' ? `Write the ${LANGS[active]} version here…` : `Write it here, or fill in EN first and hit "Auto-translate"`}
      />
    </div>
  )
}
