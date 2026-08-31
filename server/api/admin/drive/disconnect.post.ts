export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event)
  await revokeDriveConnection(ADMIN_DRIVE_CONNECTION_ID)
  return { connected: false }
})
