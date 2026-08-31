import type { H3Event } from 'h3'

/**
 * Verifies the caller's Firebase ID token (sent as `Authorization: Bearer`)
 * and returns their uid. Throws 401 otherwise. Used by every /api/payments
 * route that couples invoke.
 */
export async function requireAuth(event: H3Event): Promise<{ uid: string }> {
  const header = getHeader(event, 'authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : ''

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Missing bearer token' })
  }

  try {
    const decoded = await verifyFirebaseIdToken(token)
    return { uid: decoded.uid }
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token' })
  }
}

/**
 * Like requireAuth(), but also checks that the caller's own users/{uid}
 * profile doc has role === 'superadmin' - used to gate every admin-only
 * server route (creating weddings for other people, the admin-wide Google
 * Drive connection, etc). Reads Firestore via the Admin SDK, so this is
 * authoritative even though the client-side role check in
 * middleware/superadmin.ts can't be trusted on its own.
 */
export async function requireSuperAdmin(event: H3Event): Promise<{ uid: string }> {
  const { uid } = await requireAuth(event)
  const snap = await getAdminDb().doc(`users/${uid}`).get()
  const role = (snap.data() as { role?: string } | undefined)?.role
  if (role !== 'superadmin') {
    throw createError({ statusCode: 403, statusMessage: 'Superadmin access required.' })
  }
  return { uid }
}
