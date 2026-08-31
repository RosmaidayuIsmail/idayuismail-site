import { z } from 'zod'
import type { ExportableGuest } from '../../utils/guest-export'

const bodySchema = z.object({ weddingId: z.string().min(1) })

/**
 * "Export Excel" button on the Guest List page (DashboardGuestsPanel.vue) -
 * same authorization pattern as the CSV/PDF Drive export
 * (server/api/drive/export.post.ts), but streams the styled .xlsx file
 * straight back as a download instead of uploading it anywhere.
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

  const guestsSnap = await db.collection(`weddings/${weddingId}/guests`).get()
  const guests = guestsSnap.docs.map((d) => d.data() as ExportableGuest)
  const content = wedding?.content as Record<string, unknown> | undefined
  const coupleTitle = [content?.brideName, content?.groomName].filter(Boolean).join(' & ') || String(wedding?.slug || 'Wedding')

  const buffer = await buildGuestXLSX(guests, `${coupleTitle} - Guest List`)

  setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  setHeader(event, 'Content-Disposition', 'attachment; filename="guests.xlsx"')
  return buffer
})
