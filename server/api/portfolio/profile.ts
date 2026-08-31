import portfolioDb, { ensurePortfolioSchema } from '../../utils/portfolio-db'

export default defineEventHandler(async (event) => {
  await ensurePortfolioSchema()

  if (event.method === 'GET') {
    const result = await portfolioDb.execute('SELECT * FROM profile WHERE id = 1')
    if (result.rows.length === 0) {
      setResponseStatus(event, 404)
      return { error: 'Profile not seeded yet.' }
    }
    const row = result.rows[0] as Record<string, unknown>
    return { ...row, skills: JSON.parse((row.skills as string) || '[]') }
  }

  if (event.method === 'PUT') {
    const authErr = portfolioAuthError(event)
    if (authErr) return authErr
    const b = await readBody(event)
    await portfolioDb.execute({
      sql: `INSERT INTO profile (id, name, title, location, bio_en, bio_ko, bio_zh, tag_en, tag_ko, tag_zh, skills, email, whatsapp, instagram, linkedin, updated_at)
            VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET
              name=excluded.name, title=excluded.title, location=excluded.location,
              bio_en=excluded.bio_en, bio_ko=excluded.bio_ko, bio_zh=excluded.bio_zh,
              tag_en=excluded.tag_en, tag_ko=excluded.tag_ko, tag_zh=excluded.tag_zh,
              skills=excluded.skills, email=excluded.email, whatsapp=excluded.whatsapp,
              instagram=excluded.instagram, linkedin=excluded.linkedin, updated_at=CURRENT_TIMESTAMP`,
      args: [
        b.name, b.title, b.location, b.bio_en, b.bio_ko, b.bio_zh,
        b.tag_en, b.tag_ko, b.tag_zh, JSON.stringify(b.skills || []),
        b.email, b.whatsapp, b.instagram, b.linkedin,
      ],
    })
    return { ok: true }
  }

  setResponseStatus(event, 405)
  return { error: 'Method not allowed' }
})
