import portfolioDb, { ensurePortfolioSchema } from '../../../utils/portfolio-db'

export default defineEventHandler(async (event) => {
  await ensurePortfolioSchema()

  if (event.method === 'DELETE') {
    const authErr = portfolioAuthError(event)
    if (authErr) return authErr
    const id = getRouterParam(event, 'id') as string
    await portfolioDb.execute({ sql: 'DELETE FROM moments WHERE id = ?', args: [id] })
    return { ok: true }
  }

  setResponseStatus(event, 405)
  return { error: 'Method not allowed' }
})
