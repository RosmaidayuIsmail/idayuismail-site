// Proxies to MyMemory's free translation API (no signup/API key required).
// MyMemory hard-caps requests at 500 characters, so longer text gets split
// into sentence-aware chunks, translated piece by piece, then rejoined.

function splitIntoChunks(text: string, maxLen = 450): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+\s*|[^.!?]+$/g) || [text]
  const chunks: string[] = []
  let current = ''

  for (const sentence of sentences) {
    if ((current + sentence).length <= maxLen) {
      current += sentence
      continue
    }
    if (current) chunks.push(current.trim())
    if (sentence.length > maxLen) {
      for (let i = 0; i < sentence.length; i += maxLen) {
        chunks.push(sentence.slice(i, i + maxLen).trim())
      }
      current = ''
    } else {
      current = sentence
    }
  }
  if (current.trim()) chunks.push(current.trim())
  return chunks.filter(Boolean)
}

async function translateChunk(chunk: string, target: string) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|${target}`
  const r = await fetch(url)
  const data = await r.json() as any
  const translated = data?.responseData?.translatedText
  if (!translated || /QUERY LENGTH LIMIT/i.test(translated)) {
    throw new Error(translated || 'No translation returned.')
  }
  return translated as string
}

export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') {
    setResponseStatus(event, 405)
    return { error: 'Method not allowed' }
  }

  const { text, target } = (await readBody(event)) || {}
  if (!text || !target) {
    setResponseStatus(event, 400)
    return { error: 'Both "text" and "target" are required.' }
  }

  try {
    const chunks = splitIntoChunks(text.trim())
    const results: string[] = []
    for (const chunk of chunks) {
      results.push(await translateChunk(chunk, target))
    }
    return { translated: results.join(' ') }
  } catch (e: any) {
    setResponseStatus(event, 502)
    return { error: `Translation failed: ${e.message}` }
  }
})
