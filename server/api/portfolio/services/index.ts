import portfolioDb, { ensurePortfolioSchema } from '../../../utils/portfolio-db'

export function rowToService(row: any) {
  return {
    id: row.id,
    glyph: row.glyph || '',
    title: { en: row.title_en, ko: row.title_ko, zh: row.title_zh },
    body: { en: row.body_en, ko: row.body_ko, zh: row.body_zh },
    sortOrder: row.sort_order,
  }
}

export default defineEventHandler(async (event) => {
  await ensurePortfolioSchema()

  if (event.method === 'GET') {
    const result = await portfolioDb.execute('SELECT * FROM services ORDER BY sort_order ASC, id ASC')
    return result.rows.map(rowToService)
  }

  if (event.method === 'POST') {
    const authErr = portfolioAuthError(event)
    if (authErr) return authErr
    const b = await readBody(event)
    const result = await portfolioDb.execute({
      sql: `INSERT INTO services (glyph, title_en, title_ko, title_zh, body_en, body_ko, body_zh, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        b.glyph || '',
        b.title?.en || '', b.title?.ko || '', b.title?.zh || '',
        b.body?.en || '', b.body?.ko || '', b.body?.zh || '',
        b.sortOrder || 0,
      ],
    })
    setResponseStatus(event, 201)
    return { ok: true, id: Number(result.lastInsertRowid) }
  }

  setResponseStatus(event, 405)
  return { error: 'Method not allowed' }
})
