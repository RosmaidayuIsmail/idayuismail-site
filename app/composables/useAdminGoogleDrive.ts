/**
 * Client-side controller for the admin's own, single "RSVP Lists (your
 * Drive)" panel in /admin - a SEPARATE Google Drive connection from any
 * per-wedding one (see useGoogleDrive.ts), owned by the superadmin account
 * only. Talks to the /api/admin/drive/* routes, which reuse the exact same
 * OAuth callback as the per-wedding flow under the fixed connection id
 * "admin" (server/utils/google-drive.ts's ADMIN_DRIVE_CONNECTION_ID).
 *
 * Once connected, every wedding's guests.csv/.pdf/.xlsx auto-sync into a
 * top-level "RSVP Lists" folder in this Drive (one subfolder per wedding) -
 * both legacy self-serve accounts and weddings created from /admin - any
 * time a guest RSVPs, via the same server/utils/guest-sync.ts routine the
 * per-wedding "Google Drive backup" panel uses.
 */
export function useAdminGoogleDrive() {
  const { serverFetch } = useServerFetch()
  const toast = useToast()

  const connected = ref(false)
  const driveEmail = ref('')
  const folderLink = ref('')
  const checking = ref(false)
  const connecting = ref(false)

  async function refreshStatus() {
    checking.value = true
    try {
      const result = await serverFetch<{ connected: boolean; driveEmail: string; folderLink: string }>('/api/admin/drive/status')
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
    connecting.value = true
    try {
      const result = await serverFetch<{ url: string }>('/api/admin/drive/auth-url')
      if (import.meta.client) window.location.href = result.url
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not start Google Drive connection', color: 'error' })
      connecting.value = false
    }
  }

  async function disconnect() {
    try {
      await serverFetch('/api/admin/drive/disconnect', { method: 'POST' })
      connected.value = false
      driveEmail.value = ''
      folderLink.value = ''
      toast.add({ title: 'Google Drive disconnected', color: 'neutral' })
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not disconnect Google Drive', color: 'error' })
    }
  }

  return { connected, driveEmail, folderLink, checking, connecting, refreshStatus, connect, disconnect }
}
