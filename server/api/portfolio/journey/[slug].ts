import portfolioDb, { ensurePortfolioSchema } from '../../../utils/portfolio-db'
import { rowToJourney } from './index'

export default defineEventHandler(async (event) => {
  await ensurePortfolioSchema()
  const slug = getRouterParam(event, 'slug') as string

  if (event.method === 'GET') {
    const result = await portfolioDb.execute({ sql: 'SELECT * FROM journey WHERE slug = ?', args: [slug] })
    if (result.rows.length === 0) {
      setResponseStatus(event, 404)
      return { error: 'Entry not found.' }
    }
    return rowToJourney(result.rows[0])
  }

  if (event.method === 'PUT') {
    const authErr = portfolioAuthError(event)
    if (authErr) return authErr
    const b = await readBody(event)
    await portfolioDb.execute({
      sql: `UPDATE journey SET date=?, title_en=?, title_ko=?, title_zh=?, body_en=?, body_ko=?, body_zh=?, sort_order=?, updated_at=CURRENT_TIMESTAMP WHERE slug = ?`,
      args: [b.date || '', b.title?.en || '', b.title?.ko || '', b.title?.zh || '', b.body?.en || '', b.body?.ko || '', b.body?.zh || '', b.sortOrder || 0, slug],
    })
    return { ok: true }
  }

  if (event.method === 'DELETE') {
    const authErr = portfolioAuthError(event)
    if (authErr) return authErr
    await portfolioDb.execute({ sql: 'DELETE FROM journey WHERE slug = ?', args: [slug] })
    return { ok: true }
  }

  setResponseStatus(event, 405)
  return { error: 'Method not allowed' }
})
