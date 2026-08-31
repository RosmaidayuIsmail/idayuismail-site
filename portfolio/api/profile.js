import client, { ensureSchema } from '../lib/db.js'
import { checkAuth } from '../lib/auth.js'

export default async function handler(req, res) {
  await ensureSchema()

  if (req.method === 'GET') {
    const result = await client.execute('SELECT * FROM profile WHERE id = 1')
    if (result.rows.length === 0) return res.status(404).json({ error: 'Profile not seeded yet.' })
    const row = result.rows[0]
    return res.status(200).json({ ...row, skills: JSON.parse(row.skills || '[]') })
  }

  if (req.method === 'PUT') {
    if (!checkAuth(req, res)) return
    const b = req.body
    await client.execute({
      sql: `INSERT INTO profile (id, name, title, location, bio_en, bio_ko, bio_zh, tag_en, tag_ko, tag_zh, skills, email, whatsapp, instagram, linkedin, updated_at)
            VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET
              name=excluded.name, title=excluded.title, location=excluded.location,
              bio_en=excluded.bio_en, bio_ko=excluded.bio_ko, bio_zh=excluded.bio_zh,
              tag_en=excluded.tag_en, tag_ko=excluded.tag_ko, tag_zh=excluded.tag_zh,
              skills=excluded.skills, email=excluded.email, whatsapp=excluded.whatsapp,
              instagram=excluded.instagram, linkedin=excluded.linkedin, updated_at=CURRENT_TIMESTAMP`,
      args: [
        b.name, b.title, b.location, b.bio_en, b.bio_ko, b.bio_zh,
        b.tag_en, b.tag_ko, b.tag_zh, JSON.stringify(b.skills || []),
        b.email, b.whatsapp, b.instagram, b.linkedin,
      ],
    })
    return res.status(200).json({ ok: true })
  }

  res.setHeader('Allow', ['GET', 'PUT'])
  res.status(405).end('Method not allowed')
}
