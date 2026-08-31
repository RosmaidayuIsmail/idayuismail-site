import { romanize } from '../lib/romanize'

function wordRoman(word, lang) {
  const result = romanize(word, lang)
  if (!result || result.trim().toLowerCase() === word.trim().toLowerCase()) return null
  return result
}

const CJK = /[\u4e00-\u9fff\u3400-\u4dbf]/

function tokenize(text, lang) {
  if (lang !== 'zh') return text.split(/\s+/).filter(Boolean)

  const tokens = []
  let buffer = ''
  for (const ch of text) {
    if (CJK.test(ch)) {
      if (buffer) { tokens.push(buffer); buffer = '' }
      tokens.push(ch)
    } else if (/\s/.test(ch)) {
      if (buffer) { tokens.push(buffer); buffer = '' }
    } else {
      buffer += ch
    }
  }
  if (buffer) tokens.push(buffer)
  return tokens
}

function RubyLine({ text, lang }) {
  const words = tokenize(text, lang)
  return words.map((word, i) => {
    const roman = wordRoman(word, lang)
    return (
      <span key={i} className="ruby-word">
        <span className="ruby-original">{word}</span>
        {roman && <span className="ruby-roman">{roman}</span>}
      </span>
    )
  })
}

export default function Roman({ as: Tag = 'span', text, lang, show, className = '', ...rest }) {
  if (!text) return null
  if (!show || lang === 'en') {
    return <Tag className={className} {...rest}>{text}</Tag>
  }
  return (
    <Tag className={`${className} ruby-block`} {...rest}>
      <RubyLine text={text} lang={lang} />
    </Tag>
  )
}

export function BilingualBlock({ text, lang, show, className = '', plainClassName = '' }) {
  if (!text) return null

  if (!show || lang === 'en') {
    return <p className={plainClassName} style={{ whiteSpace: 'pre-line' }}>{text}</p>
  }

  const lines = text.split('\n')
  return (
    <div className={className}>
      {lines.map((line, li) => {
        if (!line.trim()) return <div key={li} className="bilingual-gap" />
        return (
          <p key={li} className="ruby-block bilingual-ruby-line">
            <RubyLine text={line} lang={lang} />
          </p>
        )
      })}
    </div>
  )
}
