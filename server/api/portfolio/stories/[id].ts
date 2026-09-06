import portfolioDb, { ensurePortfolioSchema } from '../../../utils/portfolio-db'

export default defineEventHandler(async (event) => {
  await ensurePortfolioSchema()
  const id = getRouterParam(event, 'id') as string

  if (event.method === 'DELETE') {
    const authErr = portfolioAuthError(event)
    if (authErr) return authErr
    await portfolioDb.execute({ sql: 'DELETE FROM stories WHERE id = ?', args: [id] })
    return { ok: true }
  }

  setResponseStatus(event, 405)
  return { error: 'Method not allowed' }
})
