import client, { ensureSchema } from '../../../lib/db.js'

function rowToComment(row) {
  return {
    id: row.id,
    name: row.name || 'Anonymous',
    message: row.message,
    createdAt: row.created_at,
  }
}

async function handleLike(req, res, id) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end('Method not allowed')
  }
  await client.execute({ sql: 'UPDATE moments SET likes = likes + 1 WHERE id = ?', args: [id] })
  const result = await client.execute({ sql: 'SELECT likes FROM moments WHERE id = ?', args: [id] })
  const likes = result.rows[0]?.likes ?? 0
  return res.status(200).json({ ok: true, likes })
}

async function handleComments(req, res, id) {
  if (req.method === 'GET') {
    const result = await client.execute({
      sql: 'SELECT * FROM moment_comments WHERE moment_id = ? ORDER BY created_at ASC',
      args: [id],
    })
    return res.status(200).json(result.rows.map(rowToComment))
  }

  if (req.method === 'POST') {
    const { name, message } = req.body || {}
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'A comment needs a message.' })
    }
    try {
      await client.execute({
        sql: 'INSERT INTO moment_comments (moment_id, name, message) VALUES (?, ?, ?)',
        args: [id, (name || '').trim().slice(0, 60) || null, message.trim().slice(0, 500)],
      })
      return res.status(201).json({ ok: true })
    } catch (e) {
      return res.status(400).json({ error: `Could not post that comment: ${e.message}` })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).end('Method not allowed')
}

export default async function handler(req, res) {
  await ensureSchema()
  const { id, action } = req.query

  if (action === 'like') return handleLike(req, res, id)
  if (action === 'comments') return handleComments(req, res, id)

  return res.status(404).json({ error: 'Unknown action.' })
}
