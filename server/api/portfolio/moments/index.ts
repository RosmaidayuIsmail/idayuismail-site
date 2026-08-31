import portfolioDb, { ensurePortfolioSchema } from '../../../utils/portfolio-db'

function rowToMoment(row: any) {
  return {
    id: row.id,
    image: row.image,
    caption: row.caption,
    likes: row.likes || 0,
    createdAt: row.created_at,
  }
}

export default defineEventHandler(async (event) => {
  await ensurePortfolioSchema()

  if (event.method === 'GET') {
    const result = await portfolioDb.execute('SELECT * FROM moments ORDER BY created_at DESC, id DESC')
    return result.rows.map(rowToMoment)
  }

  if (event.method === 'POST') {
    const authErr = portfolioAuthError(event)
    if (authErr) return authErr
    const b = await readBody(event)
    if (!b.image && !b.caption) {
      setResponseStatus(event, 400)
      return { error: 'A moment needs at least an image or a caption.' }
    }
    try {
      const result = await portfolioDb.execute({
        sql: `INSERT INTO moments (image, caption) VALUES (?, ?)`,
        args: [b.image || null, b.caption || ''],
      })
      setResponseStatus(event, 201)
      return { ok: true, id: Number(result.lastInsertRowid) }
    } catch (e: any) {
      setResponseStatus(event, 400)
      return { error: `Could not post that moment: ${e.message}` }
    }
  }

  setResponseStatus(event, 405)
  return { error: 'Method not allowed' }
})
