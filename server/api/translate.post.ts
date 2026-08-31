import { z } from 'zod'

const bodySchema = z.object({
  text: z.string().min(1).max(5000),
  targetLang: z.string().min(2).max(10),
  provider: z.enum(['google', 'papago']).optional()
})

// Tiny in-memory LRU so identical strings aren't re-translated (and to be a
// good citizen against the upstream APIs). Serverless instances are short-
// lived, so this is best-effort only.
const cache = new Map<string, string>()
function cacheGet(key: string) { return cache.get(key) }
function cacheSet(key: string, value: string) {
  if (cache.size > 500) cache.delete(cache.keys().next().value as string)
  cache.set(key, value)
}

// {guestName}-style tokens must survive translation untouched. Swap them for
// inert placeholders before sending, restore them after.
const TOKEN_RE = /\{[a-zA-Z0-9_]+\}/g
function protectTokens(text: string): { masked: string; tokens: string[] } {
  const tokens: string[] = []
  const masked = text.replace(TOKEN_RE, (m) => {
    tokens.push(m)
    return `⟦${tokens.length - 1}⟧`
  })
  return { masked, tokens }
}
function restoreTokens(text: string, tokens: string[]) {
  return text.replace(/⟦(\d+)⟧/g, (_, i) => tokens[Number(i)] ?? '')
}

async function googleTranslate(text: string, target: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error(`Google translate failed: ${res.status}`)
  const data = await res.json()
  // Shape: [ [ [translated, source, ...], ... ], ... ]
  const segments = Array.isArray(data?.[0]) ? data[0] : []
  return segments.map((seg: unknown[]) => (Array.isArray(seg) ? String(seg[0] ?? '') : '')).join('')
}

async function myMemoryTranslate(text: string, target: string): Promise<string> {
  // Keyless, no signup. Used as a fallback when Google's gtx endpoint is
  // unreachable from the host (e.g. blocked on some serverless networks).
  const source = 'en'
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${encodeURIComponent(target)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`MyMemory translate failed: ${res.status}`)
  const data = await res.json()
  return data?.responseData?.translatedText ?? ''
}

async function papagoTranslate(text: string, target: string): Promise<string> {
  const config = useRuntimeConfig()
  const clientId = (config as { papagoClientId?: string }).papagoClientId || process.env.PAPAGO_CLIENT_ID
  const clientSecret = (config as { papagoClientSecret?: string }).papagoClientSecret || process.env.PAPAGO_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error('Papago keys not configured')
  const source = target === 'ko' ? 'en' : 'ko'
  const res = await fetch('https://openapi.papago.naver.com/v1/translation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-NCP-APIGW-API-KEY-ID': clientId,
      'X-NCP-APIGW-API-KEY': clientSecret
    },
    body: new URLSearchParams({ source, target, text })
  })
  if (!res.ok) throw new Error(`Papago translate failed: ${res.status}`)
  const data = await res.json()
  return data?.message?.result?.translatedText ?? ''
}

/**
 * Translation assist for authoring RSVP/opening languages. Tries Google
 * (keyless gtx endpoint) first, then Papago if keys are present. Preserves
 * {placeholder} tokens. Returns a graceful error if neither works so the UI
 * can fall back to manual entry.
 */
export default defineEventHandler(async (event) => {
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Invalid translation request.' })
  const { text, targetLang, provider } = parsed.data

  const { masked, tokens } = protectTokens(text)
  const cacheKey = `${provider || 'auto'}|${targetLang}|${masked}`
  const hit = cacheGet(cacheKey)
  if (hit) return { translatedText: hit, provider: 'cache' }

  const attempts: Array<{ name: 'google' | 'mymemory' | 'papago'; fn: () => Promise<string> }> = []
  if (provider !== 'papago') attempts.push({ name: 'google', fn: () => googleTranslate(masked, targetLang) })
  if (provider !== 'papago' && provider !== 'google') attempts.push({ name: 'mymemory', fn: () => myMemoryTranslate(masked, targetLang) })
  if (provider !== 'google') attempts.push({ name: 'papago', fn: () => papagoTranslate(masked, targetLang) })

  for (const attempt of attempts) {
    try {
      const translated = restoreTokens(await attempt.fn(), tokens)
      if (translated.trim()) {
        cacheSet(cacheKey, translated)
        return { translatedText: translated, provider: attempt.name }
      }
    } catch {
      // fall through to the next provider
    }
  }

  throw createError({
    statusCode: 502,
    statusMessage: 'Translation unavailable right now. Please translate manually (or add GOOGLE/PAPAGO keys).'
  })
})
