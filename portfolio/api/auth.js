export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end('Method not allowed')
  }

  if (!process.env.ADMIN_API_KEY) {
    return res.status(500).json({ error: 'ADMIN_API_KEY is not configured on the server.' })
  }

  const { key } = req.body || {}
  if (key === process.env.ADMIN_API_KEY) {
    return res.status(200).json({ ok: true })
  }
  return res.status(401).json({ error: 'Incorrect key.' })
}
