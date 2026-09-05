import type { ExportableGuest } from './guest-export'

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

export interface DriveLinks {
  csvLink: string
  pdfLink: string
  xlsxLink: string
  folderLink: string
}

export interface SyncResult {
  weddingSynced: boolean
  adminSynced: boolean
  weddingLinks?: DriveLinks
  // The real Google/Drive error text when weddingSynced is false because a
  // connected wedding's sync actually failed (expired/revoked token,
  // deleted folder, etc.) rather than Drive simply not being connected -
  // see server/api/drive/export.post.ts, which surfaces this in the
  // "Sync now" button's error toast instead of a generic message, since a
  // silently-swallowed cause here is what made this so hard to diagnose
  // without direct access to Vercel's runtime logs.
  weddingError?: string
}

/**
 * Single shared "push the latest guest list into Drive" routine, called by
 * both the manual "Save to Drive" button (server/api/drive/export.post.ts)
 * and automatically after every RSVP submission (server/api/drive/sync.post.ts,
 * fired from app/pages/w/[slug]/rsvp.vue).
 *
 * Always upserts the SAME three fixed filenames (guests.csv/.pdf/.xlsx) via
 * upsertFileInFolder(), so a Drive folder gets one set of files that keeps
 * refreshing in place - never a new timestamped export per submission.
 *
 * Syncs into up to two places, independently and best-effort:
 *   1. the couple's own connected Drive (driveConnections/{weddingId}), if
 *      they've connected one - same as before.
 *   2. the admin's own single connected Drive (driveConnections/admin), if
 *      *she's* connected one, inside a top-level "RSVP Lists" folder with
 *      one subfolder per wedding - for EVERY wedding, whether it's a legacy
 *      self-serve account or one she created herself in /admin.
 * Either half silently no-ops if that Drive isn't connected, or if a Drive
 * API call fails - a Drive hiccup must never block a guest's own RSVP
 * submission or surface as an error on the couple's manual export button
 * for the *other* half's sake.
 *
 * When `skipIfPastDate` is set (used only by the RSVP-triggered auto-sync,
 * never the manual button), this is a no-op once the wedding's own
 * content.dateISO has passed - "the submission count up until the set date
 * only, after the date set ended, it would automatically stop update."
 */
export async function syncGuestListToDrive(
  weddingId: string,
  opts: { skipIfPastDate?: boolean } = {}
): Promise<SyncResult> {
  const db = getAdminDb()
  const weddingSnap = await db.doc(`weddings/${weddingId}`).get()
  if (!weddingSnap.exists) {
    return { weddingSynced: false, adminSynced: false }
  }
  const wedding = weddingSnap.data() as Record<string, unknown>

  const content = wedding.content as Record<string, unknown> | undefined
  const dateISO = String(content?.dateISO || '')
  const todayISO = new Date().toISOString().slice(0, 10)
  if (opts.skipIfPastDate && dateISO && dateISO < todayISO) {
    return { weddingSynced: false, adminSynced: false }
  }

  const guestsSnap = await db.collection(`weddings/${weddingId}/guests`).get()
  const guests = guestsSnap.docs.map((d) => d.data() as ExportableGuest)
  const slug = String(wedding.slug || weddingId)
  const coupleTitle = [content?.brideName, content?.groomName].filter(Boolean).join(' & ') || slug

  // Generating the three files is wrapped on its own - a bug or crash in
  // any one file builder (e.g. the PDF/XLSX generators) must never bubble
  // up as an unhandled exception out of this function. This is called from
  // an unauthenticated route (server/api/drive/sync.post.ts, fired after
  // every RSVP) as well as the manual "Sync now" button
  // (server/api/drive/export.post.ts) - a thrown error here previously
  // propagated straight out of both, uncaught.
  let csv: string
  let pdfBytes: Uint8Array
  let xlsxBuffer: Buffer
  try {
    ;[csv, pdfBytes, xlsxBuffer] = await Promise.all([
      Promise.resolve(buildGuestCSV(guests)),
      buildGuestPDF(guests, `${coupleTitle} - Guest List`),
      buildGuestXLSX(guests, `${coupleTitle} - Guest List`)
    ])
  } catch (error) {
    console.error(`Drive sync (wedding ${weddingId}) - could not build export files`, error)
    return { weddingSynced: false, adminSynced: false }
  }

  let weddingSynced = false
  let weddingLinks: DriveLinks | undefined
  let weddingError: string | undefined
  try {
    const { accessToken, connection } = await getValidAccessToken(weddingId)
    let folderId = connection.folderId
    let folderLink = connection.folderLink || ''
    if (!folderId) {
      // Self-heal: a connection doc that somehow never got a folderId
      // persisted (e.g. an older version of the connect flow, or a partial
      // write) would otherwise re-search-or-create a folder by name on
      // every single sync and never remember it - save it now so this only
      // ever happens once.
      const ensured = await ensureAppFolder(accessToken, clientRsvpFolderName(coupleTitle))
      folderId = ensured.folderId
      folderLink = ensured.folderLink
      await driveConnectionRef(weddingId).update({ folderId, folderLink, updatedAt: new Date().toISOString() })
    }
    const [csvResult, pdfResult, xlsxResult] = await Promise.all([
      upsertFileInFolder(accessToken, folderId, 'guests.csv', 'text/csv', csv),
      upsertFileInFolder(accessToken, folderId, 'guests.pdf', 'application/pdf', pdfBytes),
      upsertFileInFolder(accessToken, folderId, 'guests.xlsx', XLSX_MIME, xlsxBuffer)
    ])
    weddingSynced = true
    weddingLinks = {
      csvLink: csvResult.webViewLink,
      pdfLink: pdfResult.webViewLink,
      xlsxLink: xlsxResult.webViewLink,
      folderLink
    }
  } catch (error) {
    // Not connected yet, or a transient Drive error - never let this half
    // block the other half or the caller's own success path.
    console.error(`Drive sync (wedding ${weddingId}) skipped/failed`, error)
    weddingError = error instanceof Error ? error.message : String(error)
  }

  let adminSynced = false
  try {
    const adminConnection = await getDriveConnection(ADMIN_DRIVE_CONNECTION_ID)
    if (adminConnection?.connected) {
      const { accessToken } = await getValidAccessToken(ADMIN_DRIVE_CONNECTION_ID)
      let rootFolderId = adminConnection.folderId
      if (!rootFolderId) {
        const ensured = await ensureAppFolder(accessToken, RSVP_LISTS_FOLDER_NAME)
        rootFolderId = ensured.folderId
        await driveConnectionRef(ADMIN_DRIVE_CONNECTION_ID).update({ folderId: ensured.folderId, folderLink: ensured.folderLink, updatedAt: new Date().toISOString() })
      }
      const subfolderName = `${coupleTitle} (${slug})`
      const { folderId: subfolderId } = await ensureSubfolder(accessToken, rootFolderId, subfolderName)
      await Promise.all([
        upsertFileInFolder(accessToken, subfolderId, 'guests.csv', 'text/csv', csv),
        upsertFileInFolder(accessToken, subfolderId, 'guests.pdf', 'application/pdf', pdfBytes),
        upsertFileInFolder(accessToken, subfolderId, 'guests.xlsx', XLSX_MIME, xlsxBuffer)
      ])
      adminSynced = true
    }
  } catch (error) {
    console.error(`Drive sync (admin RSVP Lists, wedding ${weddingId}) skipped/failed`, error)
  }

  return { weddingSynced, adminSynced, weddingLinks, weddingError }
}
