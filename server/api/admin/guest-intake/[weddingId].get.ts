/**
 * Returns the current guest-intake link's token for this wedding, minting
 * one on first use (see server/utils/guest-intake.ts). Shown on the Guest
 * List page (DashboardGuestsPanel.vue) as a link the couple can be handed
 * directly - no admin dashboard access required on their end.
 *
 * Same authorization shape as /api/guests/export-excel: any signed-in user
 * who owns this wedding. Every admin-created wedding's ownerUid is the
 * superadmin's own uid (see AdminWeddingsList.vue's "Yours" badge), so this
 * also covers her using it from the /admin panel.
 */
export default defineEventHandler(async (event) => {
  const { uid } = await requireAuth(event)
  const weddingId = getRouterParam(event, 'weddingId')
  if (!weddingId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing weddingId.' })
  }

  const weddingSnap = await getAdminDb().doc(`weddings/${weddingId}`).get()
  const wedding = weddingSnap.data() as Record<string, unknown> | undefined
  if (!weddingSnap.exists || wedding?.ownerUid !== uid) {
    throw createError({ statusCode: 403, statusMessage: 'You can only manage your own wedding.' })
  }

  const token = await getOrCreateIntakeToken(weddingId)
  return { token }
})
