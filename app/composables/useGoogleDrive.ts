/**
 * Client-side controller for the "Google Drive backup" panel on the Guest
 * List page (DashboardGuestsPanel.vue). Talks to the /api/drive/* server
 * routes - see server/utils/google-drive.ts and server/utils/guest-sync.ts
 * for how the actual OAuth/Drive/auto-sync calls work. Each couple connects
 * their OWN Google Drive; nothing here ever sees a refresh token, only
 * connection status and share links.
 *
 * Once connected, guests.csv/.pdf/.xlsx in that Drive folder auto-update
 * every time a guest submits their RSVP (see app/pages/w/[slug]/rsvp.vue),
 * up until the wedding's own date passes. exportToDrive() below is a manual
 * "sync now" - useful right after connecting, or to force a refresh - and
 * always works regardless of the date.
 */
export function useGoogleDrive(weddingIdSource: () => string | undefined) {
  const { serverFetch } = useServerFetch()
  const toast = useToast()

  const connected = ref(false)
  const driveEmail = ref('')
  const folderLink = ref('')
  const checking = ref(false)
  const connecting = ref(false)
  const exporting = ref(false)

  async function refreshStatus() {
    const weddingId = weddingIdSource()
    if (!weddingId) return
    checking.value = true
    try {
      const result = await serverFetch<{ connected: boolean; driveEmail: string; folderLink: string }>(
        '/api/drive/status',
        { query: { weddingId } }
      )
      connected.value = result.connected
      driveEmail.value = result.driveEmail
      folderLink.value = result.folderLink
    } catch {
      // Silent - the panel just falls back to showing "not connected".
    } finally {
      checking.value = false
    }
  }

  async function connect() {
    const weddingId = weddingIdSource()
    if (!weddingId) return
    connecting.value = true
    try {
      // returnTo: send the browser back to whichever page this was clicked
      // from (the couple's own /dashboard/guests, or an admin managing this
      // wedding from /admin/wedding/{id}/guests) once the OAuth round trip
      // finishes - see server/api/drive/callback.get.ts.
      const returnTo = import.meta.client ? window.location.pathname : undefined
      const result = await serverFetch<{ url: string }>('/api/drive/auth-url', { query: { weddingId, returnTo } })
      if (import.meta.client) window.location.href = result.url
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not start Google Drive connection', color: 'error' })
      connecting.value = false
    }
  }

  async function disconnect() {
    const weddingId = weddingIdSource()
    if (!weddingId) return
    try {
      await serverFetch('/api/drive/disconnect', { method: 'POST', body: { weddingId } })
      connected.value = false
      driveEmail.value = ''
      folderLink.value = ''
      toast.add({ title: 'Google Drive disconnected', color: 'neutral' })
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not disconnect Google Drive', color: 'error' })
    }
  }

  async function exportToDrive() {
    const weddingId = weddingIdSource()
    if (!weddingId) return null
    exporting.value = true
    try {
      const result = await serverFetch<{ csvLink: string; pdfLink: string; xlsxLink: string; folderLink: string }>(
        '/api/drive/export',
        { method: 'POST', body: { weddingId } }
      )
      if (result.folderLink) folderLink.value = result.folderLink
      toast.add({ title: 'Synced to Google Drive', description: 'Your CSV, PDF and Excel exports were refreshed in your connected Drive.', color: 'success' })
      return result
    } catch (error: unknown) {
      console.error(error)
      const message = (error as { data?: { statusMessage?: string } })?.data?.statusMessage || ''
      // Show the real Drive/Google error text (e.g. "invalid_grant", a
      // deleted-folder 404) when the server sent one - previously every
      // failure looked identical ("Could not sync"), which made an
      // already-connected-but-silently-broken connection indistinguishable
      // from one that was never connected at all.
      toast.add({
        title: message.includes('not connected')
          ? 'Connect Google Drive first'
          : message.includes('sync failed')
            ? 'Google Drive sync failed'
            : 'Could not sync to Google Drive',
        description: message.includes('sync failed') ? message : undefined,
        color: 'error'
      })
      return null
    } finally {
      exporting.value = false
    }
  }

  return { connected, driveEmail, folderLink, checking, connecting, exporting, refreshStatus, connect, disconnect, exportToDrive }
}
