/**
 * Step 2 of "Connect Google Drive" - Google redirects the browser here (a
 * plain GET, no Authorization header) after consent is approved. We look up
 * the `state` token minted by auth-url.get.ts (per-wedding) or
 * admin/drive/auth-url.get.ts (the admin's own single connection) to find
 * which connection this belongs to, exchange the code for tokens, create or
 * find the right Drive folder, save the connection, then bounce the browser
 * back to the right page.
 *
 * The admin's own connection reuses this exact route (stateData.weddingId
 * is set to ADMIN_DRIVE_CONNECTION_ID = 'admin' for that flow) rather than
 * needing a second Google OAuth redirect URI registered in Cloud Console -
 * it's just a different Firestore doc id and a different destination
 * folder/redirect.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = String(query.code || '')
  const state = String(query.state || '')
  const siteUrl = ((useRuntimeConfig().public.siteUrl as string) || '').replace(/\/$/, '')

  const db = getAdminDb()
  const stateRef = state ? db.doc(`driveOAuthStates/${state}`) : null
  const stateSnap = stateRef ? await stateRef.get() : null
  const isAdminConnection = stateSnap?.exists && (stateSnap.data() as { weddingId?: string })?.weddingId === ADMIN_DRIVE_CONNECTION_ID
  const returnTo = (message: string) =>
    sendRedirect(event, `${siteUrl}${isAdminConnection ? '/admin' : '/dashboard/guests'}?drive=${message}`)

  if (query.error) {
    return returnTo('cancelled')
  }
  if (!code || !state || !stateSnap?.exists) {
    return returnTo('error')
  }

  const stateData = stateSnap.data() as { weddingId: string; ownerUid: string; createdAt: number }
  await stateRef!.delete()

  // 15 minute window to complete the consent flow.
  if (Date.now() - stateData.createdAt > 15 * 60 * 1000) {
    return returnTo('expired')
  }

  try {
    const { accessToken, refreshToken, expiresIn } = await exchangeCodeForTokens(code)
    const driveEmail = await fetchGoogleEmail(accessToken)

    let folderId: string
    let folderLink: string
    if (stateData.weddingId === ADMIN_DRIVE_CONNECTION_ID) {
      // The admin's single wide connection - one fixed top-level folder,
      // not tied to any one wedding's slug.
      ;({ folderId, folderLink } = await ensureAppFolder(accessToken, RSVP_LISTS_FOLDER_NAME))
    } else {
      const weddingSnap = await db.doc(`weddings/${stateData.weddingId}`).get()
      const wedding = weddingSnap.data() as Record<string, unknown> | undefined
      const slug = String(wedding?.slug || stateData.weddingId)
      ;({ folderId, folderLink } = await ensureAppFolder(accessToken, `WeddingCard Exports - ${slug}`))
    }

    await driveConnectionRef(stateData.weddingId).set({
      weddingId: stateData.weddingId,
      ownerUid: stateData.ownerUid,
      connected: true,
      refreshToken,
      accessToken,
      accessTokenExpiresAt: Date.now() + expiresIn * 1000,
      driveEmail,
      folderId,
      folderLink,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    // Backfill immediately: without this, a freshly connected folder stays
    // empty until either the couple clicks "Sync now" or the next guest
    // RSVPs, which reads as broken ("I connected and nothing showed up").
    // Connecting should feel like it *did* something right away. A failure
    // here never undoes the connection itself - syncGuestListToDrive()
    // already swallows its own errors, and "Sync now" is always there as a
    // manual retry.
    try {
      if (stateData.weddingId === ADMIN_DRIVE_CONNECTION_ID) {
        // The admin's connection is account-wide, not tied to one wedding -
        // backfill every existing wedding's guest list into "RSVP Lists"
        // at once, so weddings that were already running before she
        // connected show up immediately too.
        const weddingsSnap = await db.collection('weddings').get()
        await Promise.all(weddingsSnap.docs.map((d) => syncGuestListToDrive(d.id)))
      } else {
        await syncGuestListToDrive(stateData.weddingId)
      }
    } catch (error) {
      console.error('Initial Drive sync after connect failed', error)
    }

    return returnTo('connected')
  } catch (error) {
    console.error('Google Drive connect failed', error)
    return returnTo('error')
  }
})
