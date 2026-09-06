import portfolioDb, { ensurePortfolioSchema } from '../../../../utils/portfolio-db'

function rowToComment(row: any) {
  return {
    id: row.id,
    name: row.name || 'Anonymous',
    message: row.message,
    createdAt: row.created_at,
    parentId: row.parent_id ?? null,
  }
}

async function handleLike(event: any, id: string) {
  if (event.method !== 'POST') {
    setResponseStatus(event, 405)
    return { error: 'Method not allowed' }
  }
  await portfolioDb.execute({ sql: 'UPDATE moments SET likes = likes + 1 WHERE id = ?', args: [id] })
  const result = await portfolioDb.execute({ sql: 'SELECT likes FROM moments WHERE id = ?', args: [id] })
  const likes = (result.rows[0] as any)?.likes ?? 0
  return { ok: true, likes }
}

async function handleComments(event: any, id: string) {
  if (event.method === 'GET') {
    const result = await portfolioDb.execute({
      sql: 'SELECT * FROM moment_comments WHERE moment_id = ? ORDER BY created_at ASC',
      args: [id],
    })
    return result.rows.map(rowToComment)
  }

  if (event.method === 'POST') {
    const { name, message, parentId } = (await readBody(event)) || {}
    if (!message || !message.trim()) {
      setResponseStatus(event, 400)
      return { error: 'A comment needs a message.' }
    }
    // Flatten replies-to-replies: if parentId itself has a parent, attach
    // the new comment to that original top-level comment instead - keeps
    // the thread exactly one level deep, matching the frontend's rendering.
    let resolvedParentId: number | null = null
    if (parentId) {
      const parentRow = await portfolioDb.execute({
        sql: 'SELECT id, parent_id FROM moment_comments WHERE id = ? AND moment_id = ?',
        args: [parentId, id],
      })
      const parent = parentRow.rows[0] as any
      if (parent) resolvedParentId = parent.parent_id || parent.id
    }
    try {
      await portfolioDb.execute({
        sql: 'INSERT INTO moment_comments (moment_id, name, message, parent_id) VALUES (?, ?, ?, ?)',
        args: [id, (name || '').trim().slice(0, 60) || null, message.trim().slice(0, 500), resolvedParentId],
      })
      setResponseStatus(event, 201)
      return { ok: true }
    } catch (e: any) {
      setResponseStatus(event, 400)
      return { error: `Could not post that comment: ${e.message}` }
    }
  }

  setResponseStatus(event, 405)
  return { error: 'Method not allowed' }
}

export default defineEventHandler(async (event) => {
  await ensurePortfolioSchema()
  const id = getRouterParam(event, 'id') as string
  const action = getRouterParam(event, 'action')

  if (action === 'like') return handleLike(event, id)
  if (action === 'comments') return handleComments(event, id)

  setResponseStatus(event, 404)
  return { error: 'Unknown action.' }
})
