import portfolioDb, { ensurePortfolioSchema } from '../../../utils/portfolio-db'

export function rowToProject(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    title: { en: row.title_en, ko: row.title_ko, zh: row.title_zh },
    body: { en: row.body_en, ko: row.body_ko, zh: row.body_zh },
    more: { en: row.more_en, ko: row.more_ko, zh: row.more_zh },
    tags: JSON.parse(row.tags || '[]'),
    link: row.link,
    images: JSON.parse(row.images || '[]'),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export default defineEventHandler(async (event) => {
  await ensurePortfolioSchema()

  if (event.method === 'GET') {
    const result = await portfolioDb.execute('SELECT * FROM projects ORDER BY sort_order ASC, id ASC')
    return result.rows.map(rowToProject)
  }

  if (event.method === 'POST') {
    const authErr = portfolioAuthError(event)
    if (authErr) return authErr
    const b = await readBody(event)
    const slug = b.slug ? portfolioSlugify(b.slug) : portfolioSlugify(b.title?.en || `project-${Date.now()}`)
    try {
      await portfolioDb.execute({
        sql: `INSERT INTO projects (slug, title_en, title_ko, title_zh, body_en, body_ko, body_zh, more_en, more_ko, more_zh, tags, link, images, sort_order)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          slug,
          b.title?.en || '', b.title?.ko || '', b.title?.zh || '',
          b.body?.en || '', b.body?.ko || '', b.body?.zh || '',
          b.more?.en || '', b.more?.ko || '', b.more?.zh || '',
          JSON.stringify(b.tags || []), b.link || null, JSON.stringify(b.images || []), b.sortOrder || 0,
        ],
      })
    } catch (e: any) {
      setResponseStatus(event, 400)
      return { error: `Could not create project (slug may already exist): ${e.message}` }
    }
    setResponseStatus(event, 201)
    return { ok: true, slug }
  }

  setResponseStatus(event, 405)
  return { error: 'Method not allowed' }
})
