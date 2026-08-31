// Proxies to MyMemory's free translation API (no signup/API key required).
// MyMemory hard-caps requests at 500 characters, so longer text (a full bio,
// a project description) gets split into sentence-aware chunks, translated
// piece by piece, then rejoined — transparent to whoever's calling this.

function splitIntoChunks(text, maxLen = 450) {
  const sentences = text.match(/[^.!?]+[.!?]+\s*|[^.!?]+$/g) || [text]
  const chunks = []
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

async function translateChunk(chunk, target) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|${target}`
  const r = await fetch(url)
  const data = await r.json()
  const translated = data?.responseData?.translatedText
  if (!translated || /QUERY LENGTH LIMIT/i.test(translated)) {
    throw new Error(translated || 'No translation returned.')
  }
  return translated
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end('Method not allowed')
  }

  const { text, target } = req.body || {}
  if (!text || !target) {
    return res.status(400).json({ error: 'Both "text" and "target" are required.' })
  }

  try {
    const chunks = splitIntoChunks(text.trim())
    const results = []
    for (const chunk of chunks) {
      results.push(await translateChunk(chunk, target))
    }
    return res.status(200).json({ translated: results.join(' ') })
  } catch (e) {
    return res.status(502).json({ error: `Translation failed: ${e.message}` })
  }
}
