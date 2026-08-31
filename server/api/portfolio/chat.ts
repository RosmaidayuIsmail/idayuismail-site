import portfolioDb, { ensurePortfolioSchema } from '../../utils/portfolio-db'

function buildSystemPrompt(profile: any, projects: any[], journey: any[], learning: any[]) {
  const skills = (() => { try { return JSON.parse(profile?.skills || '[]').join(', ') } catch { return '' } })()

  const projectList = projects.map((p) => {
    let tags: string[] = []
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

export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') {
    setResponseStatus(event, 405)
    return { error: 'Method not allowed' }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    setResponseStatus(event, 500)
    return { error: 'Chat is not configured yet — ANTHROPIC_API_KEY is missing from the environment.' }
  }

  const { messages } = (await readBody(event)) || {}
  if (!Array.isArray(messages) || messages.length === 0) {
    setResponseStatus(event, 400)
    return { error: 'A message is required.' }
  }

  await ensurePortfolioSchema()

  const [profileRes, projectsRes, journeyRes, learningRes] = await Promise.all([
    portfolioDb.execute('SELECT * FROM profile WHERE id = 1'),
    portfolioDb.execute('SELECT * FROM projects ORDER BY sort_order ASC'),
    portfolioDb.execute('SELECT * FROM journey ORDER BY sort_order ASC'),
    portfolioDb.execute('SELECT * FROM learning ORDER BY sort_order ASC'),
  ])

  const systemPrompt = buildSystemPrompt(profileRes.rows[0], projectsRes.rows, journeyRes.rows, learningRes.rows)

  const trimmed = messages.slice(-16).map((m: any) => ({ role: m.role, content: m.content }))

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
      setResponseStatus(event, 502)
      return { error: `Chat service error: ${errText}` }
    }

    const data = await response.json() as any
    const reply = data.content?.find((b: any) => b.type === 'text')?.text || "Sorry, I couldn't come up with an answer just then."
    return { reply }
  } catch (e: any) {
    setResponseStatus(event, 500)
    return { error: `Chat failed: ${e.message}` }
  }
})
