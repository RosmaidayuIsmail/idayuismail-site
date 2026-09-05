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
  // Where to bounce the browser back to once the callback finishes - the
  // couple's own /dashboard/guests, or an admin managing this wedding from
  // /admin/wedding/{id}/guests on their behalf (see callback.get.ts, which
  // used to always send admin connections through /dashboard/guests too -
  // the auth middleware there then kicked a superadmin straight back out to
  // the generic /admin, losing which wedding they were on). Only a
  // same-origin relative path is ever trusted - see callback.get.ts.
  const returnTo = String(getQuery(event).returnTo || '')

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
    returnTo,
    createdAt: Date.now()
  })

  return { url: buildGoogleAuthUrl(state) }
})
