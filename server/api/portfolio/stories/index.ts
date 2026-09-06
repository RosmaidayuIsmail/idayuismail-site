import portfolioDb, { ensurePortfolioSchema } from '../../../utils/portfolio-db'

function rowToStory(row: any) {
  return {
    id: row.id,
    mediaUrl: row.media_url,
    mediaType: row.media_type,
    caption: row.caption || '',
    createdAt: row.created_at,
  }
}

export default defineEventHandler(async (event) => {
  await ensurePortfolioSchema()

  if (event.method === 'GET') {
    // Lazy expiry: delete anything older than 24h before listing, rather
    // than a separate cron job - this site's post volume doesn't need one.
    await portfolioDb.execute(`DELETE FROM stories WHERE created_at <= datetime('now', '-1 day')`)
    const result = await portfolioDb.execute(`SELECT * FROM stories WHERE created_at > datetime('now', '-1 day') ORDER BY created_at ASC`)
    return result.rows.map(rowToStory)
  }

  if (event.method === 'POST') {
    const authErr = portfolioAuthError(event)
    if (authErr) return authErr
    const b = await readBody(event)
    if (!b.mediaUrl) {
      setResponseStatus(event, 400)
      return { error: 'A story needs mediaUrl (upload the file via /api/portfolio/upload first).' }
    }
    const result = await portfolioDb.execute({
      sql: 'INSERT INTO stories (media_url, media_type, caption) VALUES (?, ?, ?)',
      args: [b.mediaUrl, b.mediaType === 'video' ? 'video' : 'image', (b.caption || '').trim().slice(0, 200) || null],
    })
    setResponseStatus(event, 201)
    return { ok: true, id: Number(result.lastInsertRowid) }
  }

  setResponseStatus(event, 405)
  return { error: 'Method not allowed' }
})
