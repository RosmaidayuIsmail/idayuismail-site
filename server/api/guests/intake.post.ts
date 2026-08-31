import { z } from 'zod'

const bodySchema = z.object({
  weddingId: z.string().min(1),
  key: z.string().min(1),
  name: z.string().trim().min(2).max(200),
  phone: z.string().trim().max(30).optional().default(''),
  tier: z.enum(['vip', 'general']).optional().default('general')
})

/**
 * Public, unauthenticated guest-intake submission - the couple's own
 * no-login way to add a VIP/General guest (name + optional phone) via
 * app/pages/w/[slug]/guest-intake.vue, without ever seeing the admin Guest
 * List dashboard. Gated by a per-wedding secret `key` (see
 * server/utils/guest-intake.ts) instead of a Firebase session, since this
 * page is opened from a link the couple was handed, not a login - the same
 * reason server/api/guests/rsvp.post.ts exists for the guest-facing RSVP
 * form.
 */
export default defineEventHandler(async (event) => {
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Please enter a valid guest name.' })
  }
  const { weddingId, key, name, phone, tier } = parsed.data

  const ok = await verifyIntakeToken(weddingId, key)
  if (!ok) {
    throw createError({ statusCode: 403, statusMessage: 'This link is invalid or has expired - please ask for a fresh one.' })
  }

  const db = getAdminDb()
  const weddingSnap = await db.doc(`weddings/${weddingId}`).get()
  if (!weddingSnap.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Wedding not found.' })
  }

  await db.collection(`weddings/${weddingId}/guests`).add({
    name,
    phone,
    tier,
    attending: '',
    guestCount: 0,
    specialSeating: false,
    dietary: '',
    doa: '',
    tableAssignment: '',
    submittedAt: new Date().toISOString(),
    invited: true
  })

  return { ok: true }
})
