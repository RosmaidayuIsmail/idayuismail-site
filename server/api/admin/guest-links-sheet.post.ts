import { z } from 'zod'

const bodySchema = z.object({ weddingId: z.string().min(1) })

/**
 * Builds a "Guest Links" Google Sheet - one row per guest with their name,
 * tier, phone, RSVP status, personalized invite link, and a ready-to-tap
 * WhatsApp send link - and upserts it into the SAME admin "RSVP
 * Lists/{Couple} (slug)" Drive subfolder that guests.csv/.pdf/.xlsx already
 * sync into (see server/utils/guest-sync.ts). Deliberately uses the
 * ADMIN's own connected Drive (ADMIN_DRIVE_CONNECTION_ID), not the
 * couple's, so this works from the admin panel alone with no dependency on
 * the couple ever connecting their own Drive.
 *
 * Returns the Sheet's shareable link, meant to be copy-pasted or forwarded
 * straight to the couple - "give the link back to the user" - instead of
 * exporting and re-sending a file by hand every time the guest list
 * changes (calling this again just updates the same Sheet in place).
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

  const adminConnection = await getDriveConnection(ADMIN_DRIVE_CONNECTION_ID)
  if (!adminConnection?.connected) {
    throw createError({ statusCode: 409, statusMessage: 'Connect the admin Google Drive first (Guest List > Google Drive backup), then try again.' })
  }

  const content = (wedding?.content || {}) as Record<string, unknown>
  const slug = String(wedding?.slug || weddingId)
  const coupleTitle = [content.brideName, content.groomName].filter(Boolean).join(' & ') || slug
  const siteUrl = String(useRuntimeConfig().public.siteUrl || '')

  const guestsSnap = await db.collection(`weddings/${weddingId}/guests`).get()
  const rows = guestsSnap.docs.map((docSnap) => {
    const g = docSnap.data() as Record<string, unknown>
    const name = String(g.name || '')
    const rawPhone = String(g.phone || '')
    const { inviteUrl, whatsappUrl } = buildGuestLinks(siteUrl, slug, content, docSnap.id, name, rawPhone)
    const attending = g.attending === 'Yes' ? 'Attending' : g.attending === 'No' ? 'Declined' : 'No response yet'
    return [name, g.tier === 'vip' ? 'VIP' : 'General', rawPhone, attending, inviteUrl, whatsappUrl]
  })

  const header = ['Name', 'Tier', 'Phone', 'RSVP Status', 'Personalized Invite Link', 'WhatsApp Send Link']
  const escapeCell = (cell: string) => `"${cell.replace(/"/g, '""')}"`
  const csv = [header, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n')

  const { accessToken } = await getValidAccessToken(ADMIN_DRIVE_CONNECTION_ID)
  let rootFolderId = adminConnection.folderId
  if (!rootFolderId) {
    const ensured = await ensureAppFolder(accessToken, RSVP_LISTS_FOLDER_NAME)
    rootFolderId = ensured.folderId
    await driveConnectionRef(ADMIN_DRIVE_CONNECTION_ID).update({ folderId: ensured.folderId, folderLink: ensured.folderLink, updatedAt: new Date().toISOString() })
  }
  const { folderId: subfolderId } = await ensureSubfolder(accessToken, rootFolderId, `${coupleTitle} (${slug})`)
  const { webViewLink } = await upsertGoogleSheetInFolder(accessToken, subfolderId, 'Guest Links', csv)

  return { ok: true, sheetLink: webViewLink }
})
