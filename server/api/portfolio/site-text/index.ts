import portfolioDb, { ensurePortfolioSchema } from '../../../utils/portfolio-db'

export default defineEventHandler(async (event) => {
  await ensurePortfolioSchema()

  if (event.method === 'GET') {
    const result = await portfolioDb.execute('SELECT * FROM site_text')
    const out: Record<string, { en: string; ko: string; zh: string }> = {}
    for (const row of result.rows as any[]) {
      out[row.key] = { en: row.value_en || '', ko: row.value_ko || '', zh: row.value_zh || '' }
    }
    return out
  }

  if (event.method === 'PUT') {
    const authErr = portfolioAuthError(event)
    if (authErr) return authErr
    // Body is the same shape GET returns: { [key]: { en, ko, zh } } - bulk
    // upsert every key in one call, since this is edited as one settings
    // form in admin rather than a list of individually add/removed items.
    const b = (await readBody(event)) as Record<string, { en?: string; ko?: string; zh?: string }>
    for (const [key, value] of Object.entries(b || {})) {
      await portfolioDb.execute({
        sql: `INSERT INTO site_text (key, value_en, value_ko, value_zh) VALUES (?, ?, ?, ?)
              ON CONFLICT(key) DO UPDATE SET value_en=excluded.value_en, value_ko=excluded.value_ko, value_zh=excluded.value_zh`,
        args: [key, value?.en || '', value?.ko || '', value?.zh || ''],
      })
    }
    return { ok: true }
  }

  setResponseStatus(event, 405)
  return { error: 'Method not allowed' }
})
