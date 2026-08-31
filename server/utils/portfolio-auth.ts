import type { H3Event } from 'h3'

// Write endpoints require an x-api-key header matching ADMIN_API_KEY.
// Read (GET) endpoints stay public so the site can render without auth.
export function portfolioAuthError(event: H3Event): { error: string } | null {
  if (!process.env.ADMIN_API_KEY) {
    setResponseStatus(event, 500)
    return { error: 'ADMIN_API_KEY is not configured on the server.' }
  }
  if (getHeader(event, 'x-api-key') !== process.env.ADMIN_API_KEY) {
    setResponseStatus(event, 401)
    return { error: 'Invalid or missing API key.' }
  }
  return null
}

export function portfolioSlugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
