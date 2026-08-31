import { pinyin } from 'pinyin-pro'

// Revised Romanization of Korean (RR) — South Korea's official standard.
// Implemented directly via Unicode Hangul syllable decomposition instead of
// a third-party package, since the popular npm options for this turned out
// to be written for old-school <script> tag sites and crash under Vite/bundlers.
const CHO = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h']
const JUNG = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i']
const JONG = ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l', 'p', 'l', 'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't']

function romanizeKorean(text) {
  let result = ''
  for (const ch of text) {
    const code = ch.codePointAt(0) - 0xac00
    if (code < 0 || code > 11171) {
      result += ch
      continue
    }
    const choIdx = Math.floor(code / 588)
    const jungIdx = Math.floor((code % 588) / 28)
    const jongIdx = code % 28
    result += CHO[choIdx] + JUNG[jungIdx] + JONG[jongIdx]
  }
  return result
}

export function romanize(text, lang) {
  if (!text) return ''
  if (lang === 'zh') {
    return pinyin(text, { toneType: 'symbol', nonZh: 'consecutive' })
  }
  if (lang === 'ko') {
    return romanizeKorean(text)
  }
  return ''
}
