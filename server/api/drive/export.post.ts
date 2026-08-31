import { z } from 'zod'

const bodySchema = z.object({ weddingId: z.string().min(1) })

/**
 * "Save to Drive" button next to Export CSV / Print-PDF / Export Excel on
 * the Guest List page. Delegates to the same syncGuestListToDrive() routine
 * the RSVP-triggered auto-sync uses (server/api/drive/sync.post.ts), so a
 * manual click and an automatic RSVP both upsert the exact same three fixed
 * filenames (guests.csv/.pdf/.xlsx) into the couple's folder - and, if the
 * admin has her own Drive connected, into her "RSVP Lists" folder too -
 * instead of creating a new timestamped file each time.
 */
export default defineEventHandler(async (event) => {
  const { uid } = await requireAuth(event)
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Missing weddingId.' })
  }
  const { weddingId } = parsed.data

  const db = getAdminDb()
  const weddingSnap = await db.doc(`weddings/${weddingId}`).get()
  const wedding = weddingSnap.data() as Record<string, unknown> | undefined
  if (!weddingSnap.exists || wedding?.ownerUid !== uid) {
    throw createError({ statusCode: 403, statusMessage: 'You can only export your own wedding.' })
  }

  // Manual clicks never respect the "stop after the wedding date" cutoff -
  // that only applies to the automatic RSVP-triggered sync.
  const result = await syncGuestListToDrive(weddingId)
  if (!result.weddingSynced || !result.weddingLinks) {
    // Surface the real Drive/Google error when there was one (expired or
    // revoked token, a folder that got deleted, etc.) instead of always
    // claiming "not connected" - that generic message was actively
    // misleading when the connection *looked* fine in the UI but every
    // sync was silently failing underneath, with no way to tell why short
    // of Vercel's own runtime logs.
    throw createError({
      statusCode: 409,
      statusMessage: result.weddingError
        ? `Google Drive sync failed: ${result.weddingError}`
        : 'Google Drive is not connected for this wedding yet.'
    })
  }

  return {
    csvLink: result.weddingLinks.csvLink,
    pdfLink: result.weddingLinks.pdfLink,
    xlsxLink: result.weddingLinks.xlsxLink,
    folderLink: result.weddingLinks.folderLink
  }
})
