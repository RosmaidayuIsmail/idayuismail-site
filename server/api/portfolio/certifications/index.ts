import portfolioDb, { ensurePortfolioSchema } from '../../../utils/portfolio-db'

export function rowToCertification(row: any) {
  return {
    id: row.id,
    text: { en: row.text_en, ko: row.text_ko, zh: row.text_zh },
    sortOrder: row.sort_order,
  }
}

export default defineEventHandler(async (event) => {
  await ensurePortfolioSchema()

  if (event.method === 'GET') {
    const result = await portfolioDb.execute('SELECT * FROM certifications ORDER BY sort_order ASC, id ASC')
    return result.rows.map(rowToCertification)
  }

  if (event.method === 'POST') {
    const authErr = portfolioAuthError(event)
    if (authErr) return authErr
    const b = await readBody(event)
    const result = await portfolioDb.execute({
      sql: 'INSERT INTO certifications (text_en, text_ko, text_zh, sort_order) VALUES (?, ?, ?, ?)',
      args: [b.text?.en || '', b.text?.ko || '', b.text?.zh || '', b.sortOrder || 0],
    })
    setResponseStatus(event, 201)
    return { ok: true, id: Number(result.lastInsertRowid) }
  }

  setResponseStatus(event, 405)
  return { error: 'Method not allowed' }
})
