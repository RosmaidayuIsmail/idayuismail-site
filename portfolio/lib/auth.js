// Very small protection layer: write endpoints (POST/PUT/DELETE) require an
// x-api-key header matching ADMIN_API_KEY. Read (GET) endpoints stay public
// so the site itself can render without auth.
export function checkAuth(req, res) {
  const key = req.headers['x-api-key']
  if (!process.env.ADMIN_API_KEY) {
    res.status(500).json({ error: 'ADMIN_API_KEY is not configured on the server.' })
    return false
  }
  if (key !== process.env.ADMIN_API_KEY) {
    res.status(401).json({ error: 'Invalid or missing API key.' })
    return false
  }
  return true
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
