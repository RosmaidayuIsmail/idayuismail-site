import portfolioDb, { ensurePortfolioSchema } from '../../../utils/portfolio-db'

export function rowToLearning(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    title: { en: row.title_en, ko: row.title_ko, zh: row.title_zh },
    body: { en: row.body_en, ko: row.body_ko, zh: row.body_zh },
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export default defineEventHandler(async (event) => {
  await ensurePortfolioSchema()

  if (event.method === 'GET') {
    const result = await portfolioDb.execute('SELECT * FROM learning ORDER BY sort_order ASC, id ASC')
    return result.rows.map(rowToLearning)
  }

  if (event.method === 'POST') {
    const authErr = portfolioAuthError(event)
    if (authErr) return authErr
    const b = await readBody(event)
    const slug = b.slug ? portfolioSlugify(b.slug) : portfolioSlugify(b.title?.en || `entry-${Date.now()}`)
    try {
      await portfolioDb.execute({
        sql: `INSERT INTO learning (slug, title_en, title_ko, title_zh, body_en, body_ko, body_zh, sort_order)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          slug,
          b.title?.en || '', b.title?.ko || '', b.title?.zh || '',
          b.body?.en || '', b.body?.ko || '', b.body?.zh || '',
          b.sortOrder || 0,
        ],
      })
    } catch (e: any) {
      setResponseStatus(event, 400)
      return { error: `Could not create entry (slug may already exist): ${e.message}` }
    }
    setResponseStatus(event, 201)
    return { ok: true, slug }
  }

  setResponseStatus(event, 405)
  return { error: 'Method not allowed' }
})
