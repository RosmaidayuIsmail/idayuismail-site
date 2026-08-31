import client, { ensureSchema } from '../../lib/db.js'
import { checkAuth } from '../../lib/auth.js'

function rowToLearning(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: { en: row.title_en, ko: row.title_ko, zh: row.title_zh },
    body: { en: row.body_en, ko: row.body_ko, zh: row.body_zh },
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export default async function handler(req, res) {
  await ensureSchema()
  const { slug } = req.query

  if (req.method === 'GET') {
    const result = await client.execute({ sql: 'SELECT * FROM learning WHERE slug = ?', args: [slug] })
    if (result.rows.length === 0) return res.status(404).json({ error: 'Entry not found.' })
    return res.status(200).json(rowToLearning(result.rows[0]))
  }

  if (req.method === 'PUT') {
    if (!checkAuth(req, res)) return
    const b = req.body
    await client.execute({
      sql: `UPDATE learning SET title_en=?, title_ko=?, title_zh=?, body_en=?, body_ko=?, body_zh=?, sort_order=?, updated_at=CURRENT_TIMESTAMP WHERE slug = ?`,
      args: [b.title?.en || '', b.title?.ko || '', b.title?.zh || '', b.body?.en || '', b.body?.ko || '', b.body?.zh || '', b.sortOrder || 0, slug],
    })
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'DELETE') {
    if (!checkAuth(req, res)) return
    await client.execute({ sql: 'DELETE FROM learning WHERE slug = ?', args: [slug] })
    return res.status(200).json({ ok: true })
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
  res.status(405).end('Method not allowed')
}
