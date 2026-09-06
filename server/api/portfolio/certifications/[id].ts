import portfolioDb, { ensurePortfolioSchema } from '../../../utils/portfolio-db'

export default defineEventHandler(async (event) => {
  await ensurePortfolioSchema()
  const id = getRouterParam(event, 'id') as string

  if (event.method === 'PUT') {
    const authErr = portfolioAuthError(event)
    if (authErr) return authErr
    const b = await readBody(event)
    await portfolioDb.execute({
      sql: 'UPDATE certifications SET text_en=?, text_ko=?, text_zh=?, sort_order=? WHERE id = ?',
      args: [b.text?.en || '', b.text?.ko || '', b.text?.zh || '', b.sortOrder || 0, id],
    })
    return { ok: true }
  }

  if (event.method === 'DELETE') {
    const authErr = portfolioAuthError(event)
    if (authErr) return authErr
    await portfolioDb.execute({ sql: 'DELETE FROM certifications WHERE id = ?', args: [id] })
    return { ok: true }
  }

  setResponseStatus(event, 405)
  return { error: 'Method not allowed' }
})
