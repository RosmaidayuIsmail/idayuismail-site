/**
 * Authenticated connection-status check for the Guest List page's Google
 * Drive panel. Only ever returns non-sensitive fields - the refresh/access
 * tokens never leave the server.
 */
export default defineEventHandler(async (event) => {
  const { uid } = await requireAuth(event)
  const weddingId = String(getQuery(event).weddingId || '')
  if (!weddingId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing weddingId.' })
  }

  const db = getAdminDb()
  const weddingSnap = await db.doc(`weddings/${weddingId}`).get()
  const wedding = weddingSnap.data() as Record<string, unknown> | undefined
  if (!weddingSnap.exists || wedding?.ownerUid !== uid) {
    throw createError({ statusCode: 403, statusMessage: 'You can only check your own wedding.' })
  }

  const connection = await getDriveConnection(weddingId)
  return {
    connected: Boolean(connection?.connected),
    driveEmail: connection?.driveEmail || '',
    folderLink: connection?.folderLink || ''
  }
})
