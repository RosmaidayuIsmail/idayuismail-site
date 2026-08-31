import client, { ensureSchema } from '../../lib/db.js'
import { checkAuth } from '../../lib/auth.js'

function rowToMoment(row) {
  return {
    id: row.id,
    image: row.image,
    caption: row.caption,
    likes: row.likes || 0,
    createdAt: row.created_at,
  }
}

export default async function handler(req, res) {
  await ensureSchema()

  if (req.method === 'GET') {
    const result = await client.execute('SELECT * FROM moments ORDER BY created_at DESC, id DESC')
    return res.status(200).json(result.rows.map(rowToMoment))
  }

  if (req.method === 'POST') {
    if (!checkAuth(req, res)) return
    const b = req.body
    if (!b.image && !b.caption) {
      return res.status(400).json({ error: 'A moment needs at least an image or a caption.' })
    }
    try {
      const result = await client.execute({
        sql: `INSERT INTO moments (image, caption) VALUES (?, ?)`,
        args: [b.image || null, b.caption || ''],
      })
      return res.status(201).json({ ok: true, id: Number(result.lastInsertRowid) })
    } catch (e) {
      return res.status(400).json({ error: `Could not post that moment: ${e.message}` })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end('Method not allowed')
}
