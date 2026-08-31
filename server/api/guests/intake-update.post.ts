import { z } from 'zod'

const bodySchema = z.object({
  weddingId: z.string().min(1),
  key: z.string().min(1),
  guestId: z.string().min(1),
  name: z.string().trim().min(2).max(200),
  phone: z.string().trim().max(30).optional().default(''),
  tier: z.enum(['vip', 'general']).optional().default('general')
})

/**
 * Lets a couple fix a typo, or add/change a phone number on a guest they
 * already added through the intake page (app/pages/w/[slug]/guest-intake.vue)
 * - they have no admin dashboard access to do this any other way. Adding a
 * phone here is what upgrades that guest's WhatsApp link from a generic
 * "pick who to send to" share into one that opens straight into that exact
 * contact's chat (see server/utils/guest-links.ts).
 *
 * Same token gate as intake.post.ts, and just as narrowly scoped: only
 * ever touches name/phone/tier, never RSVP answers, dietary notes, or
 * table assignments - those stay under the seller's admin panel.
 */
export default defineEventHandler(async (event) => {
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Please enter a valid guest name.' })
  }
  const { weddingId, key, guestId, name, phone, tier } = parsed.data

  const ok = await verifyIntakeToken(weddingId, key)
  if (!ok) {
    throw createError({ statusCode: 403, statusMessage: 'This link is invalid or has expired - please ask for a fresh one.' })
  }

  const guestRef = getAdminDb().doc(`weddings/${weddingId}/guests/${guestId}`)
  const snap = await guestRef.get()
  if (!snap.exists) {
    throw createError({ statusCode: 404, statusMessage: 'That guest no longer exists.' })
  }

  await guestRef.update({ name, phone, tier })
  return { ok: true }
})
