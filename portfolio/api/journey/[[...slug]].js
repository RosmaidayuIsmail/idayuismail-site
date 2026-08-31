import client, { ensureSchema } from '../../lib/db.js'
import { checkAuth, slugify } from '../../lib/auth.js'

function rowToJourney(row) {
  return {
    id: row.id,
    slug: row.slug,
    date: row.date,
    title: { en: row.title_en, ko: row.title_ko, zh: row.title_zh },
    body: { en: row.body_en, ko: row.body_ko, zh: row.body_zh },
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function listOrCreate(req, res) {
  if (req.method === 'GET') {
    const result = await client.execute('SELECT * FROM journey ORDER BY sort_order ASC, id ASC')
    return res.status(200).json(result.rows.map(rowToJourney))
  }

  if (req.method === 'POST') {
    if (!checkAuth(req, res)) return
    const b = req.body
    const slug = b.slug ? slugify(b.slug) : slugify(b.title?.en || `update-${Date.now()}`)
    try {
      await client.execute({
        sql: `INSERT INTO journey (slug, date, title_en, title_ko, title_zh, body_en, body_ko, body_zh, sort_order)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          slug, b.date || '',
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

async function singleItem(req, res, slug) {
  if (req.method === 'GET') {
    const result = await client.execute({ sql: 'SELECT * FROM journey WHERE slug = ?', args: [slug] })
    if (result.rows.length === 0) return res.status(404).json({ error: 'Entry not found.' })
    return res.status(200).json(rowToJourney(result.rows[0]))
  }

  if (req.method === 'PUT') {
    if (!checkAuth(req, res)) return
    const b = req.body
    await client.execute({
      sql: `UPDATE journey SET date=?, title_en=?, title_ko=?, title_zh=?, body_en=?, body_ko=?, body_zh=?, sort_order=?, updated_at=CURRENT_TIMESTAMP WHERE slug = ?`,
      args: [b.date || '', b.title?.en || '', b.title?.ko || '', b.title?.zh || '', b.body?.en || '', b.body?.ko || '', b.body?.zh || '', b.sortOrder || 0, slug],
    })
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'DELETE') {
    if (!checkAuth(req, res)) return
    await client.execute({ sql: 'DELETE FROM journey WHERE slug = ?', args: [slug] })
    return res.status(200).json({ ok: true })
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
  res.status(405).end('Method not allowed')
}

export default async function handler(req, res) {
  await ensureSchema()
  const parts = req.query.slug
  const slug = Array.isArray(parts) ? parts[0] : parts

  if (!slug) return listOrCreate(req, res)
  return singleItem(req, res, slug)
}
