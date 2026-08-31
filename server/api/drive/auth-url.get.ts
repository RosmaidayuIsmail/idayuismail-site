import { randomUUID } from 'node:crypto'

/**
 * Step 1 of "Connect Google Drive" (see useGoogleDrive.ts on the client):
 * authenticated call that mints a short-lived, single-use `state` token and
 * hands back the Google consent-screen URL to redirect the browser to.
 *
 * The state token (not the Firebase ID token, which can't survive a full
 * browser redirect through Google) is how the callback route later knows
 * which wedding to attach the resulting connection to.
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
    throw createError({ statusCode: 403, statusMessage: 'You can only connect Drive to your own wedding.' })
  }

  const state = randomUUID()
  await db.doc(`driveOAuthStates/${state}`).set({
    weddingId,
    ownerUid: uid,
    createdAt: Date.now()
  })

  return { url: buildGoogleAuthUrl(state) }
})
