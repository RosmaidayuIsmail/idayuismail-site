import { z } from 'zod'

const bodySchema = z.object({ weddingId: z.string().min(1) })

/**
 * Fire-and-forget endpoint the RSVP page calls right after a guest's own
 * RSVP write succeeds (app/pages/w/[slug]/rsvp.vue) so the couple's and
 * admin's connected Drive folders "auto update... when there's new guest
 * submit their rsvp" instead of requiring a manual "Save to Drive" click.
 *
 * Deliberately left UNAUTHENTICATED, mirroring the existing public
 * `guests/{guestId}: allow create: if true` Firestore rule for RSVP
 * submissions themselves - a guest filling out the RSVP form has no
 * Firebase session to attach a bearer token to. This route can only
 * re-push a wedding's own already-public-via-RSVP-write guest list into
 * Drive folders their owners explicitly connected via OAuth; it never
 * returns guest data to the caller, so it can't be used to read or exfiltrate
 * anything beyond what the public RSVP write path itself already exposes.
 *
 * `skipIfPastDate: true` is what makes the sync "stop update" once the
 * wedding's own date has passed - see syncGuestListToDrive().
 */
export default defineEventHandler(async (event) => {
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Missing weddingId.' })
  }

  try {
    await syncGuestListToDrive(parsed.data.weddingId, { skipIfPastDate: true })
  } catch (error) {
    // Never let a Drive hiccup surface as a failed RSVP submission - the
    // guest's own Firestore write already succeeded before this was called.
    console.error('Drive auto-sync failed', error)
  }

  return { ok: true }
})
