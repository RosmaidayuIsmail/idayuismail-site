export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') {
    setResponseStatus(event, 405)
    return { error: 'Method not allowed' }
  }

  if (!process.env.ADMIN_API_KEY) {
    setResponseStatus(event, 500)
    return { error: 'ADMIN_API_KEY is not configured on the server.' }
  }

  const { key } = (await readBody(event)) || {}
  if (key === process.env.ADMIN_API_KEY) {
    return { ok: true }
  }
  setResponseStatus(event, 401)
  return { error: 'Incorrect key.' }
})
