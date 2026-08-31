import client, { ensureSchema } from '../../lib/db.js'
import { checkAuth } from '../../lib/auth.js'

export default async function handler(req, res) {
  await ensureSchema()
  const { id } = req.query

  if (req.method === 'DELETE') {
    if (!checkAuth(req, res)) return
    await client.execute({ sql: 'DELETE FROM moments WHERE id = ?', args: [id] })
    return res.status(200).json({ ok: true })
  }

  res.setHeader('Allow', ['DELETE'])
  res.status(405).end('Method not allowed')
}
