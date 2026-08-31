import { z } from 'zod'

const querySchema = z.object({ weddingId: z.string().min(1), key: z.string().min(1) })

/**
 * Powers the "Your Guest List" section of app/pages/w/[slug]/guest-intake.vue
 * - lets a couple see every guest already on their list (whether added here
 * or by the seller's admin panel), each with a ready-to-share WhatsApp link
 * and RSVP status, WITHOUT giving them read access to the real guest
 * collection (guests/{guestId}: allow read: if isOwner(...) - see
 * firestore.rules) or any of its more sensitive fields (dietary notes,
 * table assignment, wishes). Same token gate as intake.post.ts.
 */
export default defineEventHandler(async (event) => {
  const parsed = querySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Missing weddingId or key.' })
  }
  const { weddingId, key } = parsed.data

  const ok = await verifyIntakeToken(weddingId, key)
  if (!ok) {
    throw createError({ statusCode: 403, statusMessage: 'This link is invalid or has expired - please ask for a fresh one.' })
  }

  const db = getAdminDb()
  const weddingSnap = await db.doc(`weddings/${weddingId}`).get()
  if (!weddingSnap.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Wedding not found.' })
  }
  const wedding = weddingSnap.data() as Record<string, unknown>
  const content = (wedding.content || {}) as Record<string, unknown>
  const slug = String(wedding.slug || weddingId)
  const siteUrl = String(useRuntimeConfig().public.siteUrl || '')

  const guestsSnap = await db.collection(`weddings/${weddingId}/guests`).orderBy('submittedAt', 'desc').get()
  const guests = guestsSnap.docs.map((docSnap) => {
    const g = docSnap.data() as Record<string, unknown>
    const name = String(g.name || '')
    const phone = String(g.phone || '')
    const { inviteUrl, whatsappUrl } = buildGuestLinks(siteUrl, slug, content, docSnap.id, name, phone)
    return {
      id: docSnap.id,
      name,
      phone,
      tier: g.tier === 'vip' ? 'vip' : 'general',
      attending: (g.attending as string) || '',
      inviteUrl,
      whatsappUrl
    }
  })

  return { guests }
})
