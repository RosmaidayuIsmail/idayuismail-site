import { z } from 'zod'

const bodySchema = z.object({
  weddingId: z.string().min(1),
  // Present when the guest opened a personalized link generated after the
  // "two Jay" duplicate-guest fix (useGuests.ts's personalizedLink() now
  // embeds the guest's own doc id as ?gid=). Absent for an older link
  // shared before that fix, or a guest who was never pre-added at all.
  gid: z.string().min(1).optional(),
  name: z.string().trim().min(2).max(200),
  attending: z.enum(['Yes', 'No']),
  guestCount: z.number().int().min(0).max(10).optional().default(0),
  specialSeating: z.boolean().optional().default(false),
  dietary: z.string().max(500).optional().default(''),
  doa: z.string().max(500).optional().default('')
})

/**
 * Public RSVP submission endpoint (app/pages/w/[slug]/rsvp.vue's
 * submitForm()). Deliberately UNAUTHENTICATED, same as the Firestore
 * `guests/{guestId}: allow create: if true` rule it replaces for this one
 * write path - a guest filling out the RSVP form has no Firebase session.
 *
 * This exists (rather than writing straight from the client, which is what
 * this page used to do) to fix guests appearing twice: once as manually
 * added by the couple, and again as a separate record after that same
 * guest opened their personalized WhatsApp link and submitted. The client
 * can't fix this alone, because the public RSVP page has no permission to
 * READ the guest list (guests/{guestId}: allow read: if isOwner(...) - see
 * firestore.rules) to check "does a guest with this name/id already
 * exist?" before deciding whether to create or update. The Admin SDK here
 * bypasses that read restriction safely, since this route only ever
 * updates the small set of fields a guest's own RSVP is allowed to touch
 * (see rsvpAnswer below) - never tier, phone, or table assignment, which
 * stay under the couple's own control.
 *
 * Matching logic:
 *   1. `gid` present and that guest doc still exists -> update it in place.
 *   2. `gid` missing (an older link shared before this fix) or the guest
 *      behind it was since deleted -> fall back to an exact-name match
 *      against this wedding's existing guests. Only auto-matches when
 *      EXACTLY ONE guest has that exact name - two guests sharing a name
 *      is rare but real, and guessing wrong would silently overwrite the
 *      wrong person's RSVP, which is worse than the duplicate this fixes.
 *   3. No id, and no unambiguous name match -> this is a genuinely new
 *      guest (never pre-added by the couple), so create a fresh record,
 *      exactly like the public RSVP form has always done.
 */
export default defineEventHandler(async (event) => {
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid RSVP payload.' })
  }
  const { weddingId, gid, name, attending, guestCount, specialSeating, dietary, doa } = parsed.data

  const db = getAdminDb()
  const weddingRef = db.doc(`weddings/${weddingId}`)
  const weddingSnap = await weddingRef.get()
  if (!weddingSnap.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Wedding not found.' })
  }

  const guestsCol = weddingRef.collection('guests')
  const submittedAt = new Date().toISOString()
  const rsvpAnswer = {
    name,
    attending,
    guestCount: attending === 'Yes' ? guestCount : 0,
    specialSeating: attending === 'Yes' ? specialSeating : false,
    dietary: attending === 'Yes' ? dietary : '',
    doa,
    submittedAt
  }

  let guestRef = gid ? guestsCol.doc(gid) : null
  let isExisting = false
  if (guestRef) {
    isExisting = (await guestRef.get()).exists
  }

  if (!isExisting) {
    const byName = await guestsCol.where('name', '==', name).get()
    if (byName.size === 1) {
      guestRef = byName.docs[0]!.ref
      isExisting = true
    }
  }

  if (!guestRef) {
    guestRef = guestsCol.doc()
  }

  if (isExisting) {
    // merge: true + only ever these fields - a guest's own RSVP, submitted
    // through a link the couple shared, can never touch the tier, phone,
    // or table assignment fields the couple's own dashboard controls.
    await guestRef.set(rsvpAnswer, { merge: true })
  } else {
    await guestRef.set({ ...rsvpAnswer, tier: 'general', phone: '' })
  }

  if (doa) {
    // Same doc id as the guest (guestRef.id) - see useGuests.ts's
    // removeGuest(), which relies on this to cascade-delete a guest's wish
    // off the public Wishes Wall when the couple deletes that guest.
    await weddingRef.collection('wishes').doc(guestRef.id).set({ name, doa, submittedAt }, { merge: true })
  }

  return { ok: true, guestId: guestRef.id }
})
