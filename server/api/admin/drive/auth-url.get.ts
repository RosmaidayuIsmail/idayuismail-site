import { randomUUID } from 'node:crypto'

/**
 * Step 1 of the admin's own, single, wide "Connect Google Drive" (the
 * "RSVP Lists" panel in /admin - see useAdminGoogleDrive.ts). Reuses the
 * exact same driveOAuthStates/{state} + callback.get.ts flow as the
 * per-wedding connection in server/api/drive/*, just with
 * ADMIN_DRIVE_CONNECTION_ID ('admin') standing in for a weddingId - so no
 * new Google Cloud Console redirect URI is needed.
 */
export default defineEventHandler(async (event) => {
  const { uid } = await requireSuperAdmin(event)

  const state = randomUUID()
  await getAdminDb().doc(`driveOAuthStates/${state}`).set({
    weddingId: ADMIN_DRIVE_CONNECTION_ID,
    ownerUid: uid,
    createdAt: Date.now()
  })

  return { url: buildGoogleAuthUrl(state) }
})
