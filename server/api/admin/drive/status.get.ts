/**
 * Connection-status check for the admin's "RSVP Lists (your Drive)" panel.
 * Only ever returns non-sensitive fields - refresh/access tokens never
 * leave the server.
 */
export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event)
  const connection = await getDriveConnection(ADMIN_DRIVE_CONNECTION_ID)
  return {
    connected: Boolean(connection?.connected),
    driveEmail: connection?.driveEmail || '',
    folderLink: connection?.folderLink || ''
  }
})
