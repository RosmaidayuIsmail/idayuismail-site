import client, { ensureSchema } from '../lib/db.js'

function buildSystemPrompt(profile, projects, journey, learning) {
  const skills = (() => { try { return JSON.parse(profile?.skills || '[]').join(', ') } catch { return '' } })()

  const projectList = projects.map((p) => {
    let tags = []
    try { tags = JSON.parse(p.tags || '[]') } catch { /* ignore */ }
    return `- "${p.title_en}": ${p.body_en}${p.more_en ? ` ${p.more_en}` : ''}${tags.length ? ` [${tags.join(', ')}]` : ''}${p.link ? ` (live: ${p.link})` : ''}`
  }).join('\n') || '(none listed yet)'

  const journeyList = journey.map((j) => `- ${j.date || ''}: "${j.title_en}" — ${j.body_en}`).join('\n') || '(none listed yet)'
  const learningList = learning.map((l) => `- "${l.title_en}": ${l.body_en}`).join('\n') || '(none listed yet)'

  return `You are the portfolio assistant embedded on ${profile?.name || 'this person'}'s personal website. You answer visitor questions ABOUT ${profile?.name || 'her'} ONLY — her background, skills, projects, and experience — using solely the information given below.

Rules:
- Stay strictly on-topic: only answer questions about ${profile?.name}, her work, and this portfolio. If asked something unrelated (general knowledge, coding help for the visitor's own project, opinions on other topics), politely decline and redirect back to questions about her.
- Never invent details not present below. If you don't know something, say so honestly and suggest they use the Contact section to ask her directly.
- Keep answers concise and warm — a few sentences is usually enough, not an essay.
- Refer to her by name or as "she" — you are representing her, not pretending to be her.
- Write in plain prose only. This reply is shown in a plain-text chat bubble with no formatting support, so do NOT use markdown — no asterisks for bold/italic, no bullet points or dashes, no headers. If listing a few things, write them as a normal sentence separated by commas instead.
- Do not use emoji.

About ${profile?.name}:
- Title: ${profile?.title || ''}
- Location: ${profile?.location || ''}
- Bio: ${profile?.bio_en || ''}
- Skills: ${skills}
- Contact: ${profile?.email || ''}

Projects:
${projectList}

Career journey:
${journeyList}

Currently learning:
${learningList}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end('Method not allowed')
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Chat is not configured yet — ANTHROPIC_API_KEY is missing from the environment.' })
  }

  const { messages } = req.body || {}
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'A message is required.' })
  }

  await ensureSchema()

  const [profileRes, projectsRes, journeyRes, learningRes] = await Promise.all([
    client.execute('SELECT * FROM profile WHERE id = 1'),
    client.execute('SELECT * FROM projects ORDER BY sort_order ASC'),
    client.execute('SELECT * FROM journey ORDER BY sort_order ASC'),
    client.execute('SELECT * FROM learning ORDER BY sort_order ASC'),
  ])

  const systemPrompt = buildSystemPrompt(profileRes.rows[0], projectsRes.rows, journeyRes.rows, learningRes.rows)

  const trimmed = messages.slice(-16).map((m) => ({ role: m.role, content: m.content }))

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: systemPrompt,
        messages: trimmed,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      return res.status(502).json({ error: `Chat service error: ${errText}` })
    }

    const data = await response.json()
    const reply = data.content?.find((b) => b.type === 'text')?.text || "Sorry, I couldn't come up with an answer just then."
    return res.status(200).json({ reply })
  } catch (e) {
    return res.status(500).json({ error: `Chat failed: ${e.message}` })
  }
}
