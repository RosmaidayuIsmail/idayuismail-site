import client, { ensureSchema } from '../../lib/db.js'
import { checkAuth, slugify } from '../../lib/auth.js'

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

  if (req.method === 'GET') {
    const result = await client.execute('SELECT * FROM learning ORDER BY sort_order ASC, id ASC')
    return res.status(200).json(result.rows.map(rowToLearning))
  }

  if (req.method === 'POST') {
    if (!checkAuth(req, res)) return
    const b = req.body
    const slug = b.slug ? slugify(b.slug) : slugify(b.title?.en || `entry-${Date.now()}`)
    try {
      await client.execute({
        sql: `INSERT INTO learning (slug, title_en, title_ko, title_zh, body_en, body_ko, body_zh, sort_order)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          slug,
          b.title?.en || '', b.title?.ko || '', b.title?.zh || '',
          b.body?.en || '', b.body?.ko || '', b.body?.zh || '',
          b.sortOrder || 0,
        ],
      })
    } catch (e) {
      return res.status(400).json({ error: `Could not create entry (slug may already exist): ${e.message}` })
    }
    return res.status(201).json({ ok: true, slug })
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end('Method not allowed')
}
