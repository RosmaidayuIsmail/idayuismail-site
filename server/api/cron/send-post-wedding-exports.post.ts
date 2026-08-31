import type { ExportableGuest } from '../../utils/guest-export'

/**
 * Countdown-end automation: meant to be hit once a day by an external
 * scheduler (Vercel Cron / Google Cloud Scheduler / cron-job.org - see
 * README notes) with header `x-cron-secret: <NUXT_CRON_SECRET>`.
 *
 * Finds every wedding whose event date has already passed and that hasn't
 * been processed yet, builds a fresh CSV + PDF of its guest list, and
 * emails both to the wedding OWNER's own account email (via Firebase Auth,
 * not each individual guest - the guest list contains every other guest's
 * phone/dietary/RSVP details, so broadcasting the whole file to every guest
 * would leak everyone's info to everyone else. If per-guest personalized
 * emails are wanted instead, that would be a separate, narrower feature).
 *
 * Independent of the Google Drive integration - this runs (and emails the
 * couple) whether or not that wedding has ever connected Drive.
 */
export default defineEventHandler(async (event) => {
  const providedSecret = getHeader(event, 'x-cron-secret') || ''
  const expectedSecret = useRuntimeConfig().cronSecret as string
  if (!expectedSecret || providedSecret !== expectedSecret) {
    throw createError({ statusCode: 401, statusMessage: 'Missing or invalid cron secret.' })
  }

  if (!isResendConfigured()) {
    return { processed: 0, skipped: 'Resend is not configured yet (NUXT_RESEND_API_KEY / NUXT_RESEND_FROM_EMAIL).' }
  }

  const db = getAdminDb()
  const todayISO = new Date().toISOString().slice(0, 10)

  // No composite index needed for a single inequality + in-memory filter -
  // this is a low-traffic app (see nuxt.config.ts's own routeRules comment),
  // so scanning all weddings once a day is cheap and avoids a fragile
  // composite Firestore index on a nested field.
  const weddingsSnap = await db.collection('weddings').get()

  const processed: string[] = []
  const failed: Array<{ weddingId: string; error: string }> = []

  for (const doc of weddingsSnap.docs) {
    const wedding = doc.data() as Record<string, unknown>
    if (wedding.postWeddingExportSent) continue

    const content = wedding.content as Record<string, unknown> | undefined
    const dateISO = String(content?.dateISO || '')
    if (!dateISO || dateISO > todayISO) continue // no date set, or wedding hasn't happened yet

    const weddingId = doc.id
    try {
      const guestsSnap = await db.collection(`weddings/${weddingId}/guests`).get()
      const guests = guestsSnap.docs.map((g) => g.data() as ExportableGuest)

      const ownerUid = String(wedding.ownerUid || '')
      // Reads the owner's email from their own users/{uid} profile doc
      // (written at signup - see useAuth.ts) rather than firebase-admin/auth,
      // which this codebase deliberately avoids: its jwks-rsa dependency
      // require()s ESM-only jose and crashes Vercel's serverless runtime at
      // boot (see the comment in server/utils/firebase-admin.ts).
      const ownerSnap = await db.doc(`users/${ownerUid}`).get()
      const ownerProfile = ownerSnap.data() as { email?: string; displayName?: string } | undefined
      if (!ownerProfile?.email) {
        failed.push({ weddingId, error: 'Account has no email on file' })
        continue
      }

      const coupleTitle = [content?.brideName, content?.groomName].filter(Boolean).join(' & ') || String(wedding.slug || 'Your wedding')
      const csv = buildGuestCSV(guests)
      const pdfBytes = await buildGuestPDF(guests, `${coupleTitle} - Guest List`)

      await sendEmail({
        to: ownerProfile.email,
        subject: `${coupleTitle} - your final guest list`,
        html: `<p>Hi${ownerProfile.displayName ? ` ${ownerProfile.displayName}` : ''},</p>
<p>Your wedding day has come and gone - congratulations! Attached is your final guest list, exported as CSV and PDF, with everyone's RSVP status, guest counts, dietary notes, and wishes.</p>
<p>Guests: ${guests.length} · Attending: ${guests.filter((g) => g.attending === 'Yes').length}</p>
<p>With love,<br/>WeddingCard</p>`,
        attachments: [
          { filename: 'guests.csv', content: Buffer.from(csv, 'utf8').toString('base64') },
          { filename: 'guests.pdf', content: Buffer.from(pdfBytes).toString('base64') }
        ]
      })

      await doc.ref.update({ postWeddingExportSent: true })
      processed.push(weddingId)
    } catch (error) {
      failed.push({ weddingId, error: error instanceof Error ? error.message : String(error) })
    }
  }

  return { processed: processed.length, weddingIds: processed, failed }
})
