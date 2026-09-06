import portfolioDb, { ensurePortfolioSchema } from '../../../utils/portfolio-db'

export default defineEventHandler(async (event) => {
  await ensurePortfolioSchema()
  const id = getRouterParam(event, 'id') as string

  if (event.method === 'PUT') {
    const authErr = portfolioAuthError(event)
    if (authErr) return authErr
    const b = await readBody(event)
    await portfolioDb.execute({
      sql: `UPDATE services SET glyph=?, title_en=?, title_ko=?, title_zh=?, body_en=?, body_ko=?, body_zh=?, sort_order=? WHERE id = ?`,
      args: [
        b.glyph || '',
        b.title?.en || '', b.title?.ko || '', b.title?.zh || '',
        b.body?.en || '', b.body?.ko || '', b.body?.zh || '',
        b.sortOrder || 0,
        id,
      ],
    })
    return { ok: true }
  }

  if (event.method === 'DELETE') {
    const authErr = portfolioAuthError(event)
    if (authErr) return authErr
    await portfolioDb.execute({ sql: 'DELETE FROM services WHERE id = ?', args: [id] })
    return { ok: true }
  }

  setResponseStatus(event, 405)
  return { error: 'Method not allowed' }
})
