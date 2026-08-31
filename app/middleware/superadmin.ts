export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  await waitForAuthReady()
  const { currentUser, profile } = useAuthState()

  if (!currentUser.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }

  if (!currentUser.value.emailVerified) {
    return navigateTo('/verify-email')
  }

  if (profile.value?.role !== 'superadmin') {
    return navigateTo('/dashboard')
  }

  // /admin/wedding/[id]/* is how a superadmin opens and edits one specific
  // wedding - their own included, if their account also owns one. The
  // couple-facing /dashboard is intentionally off-limits to superadmin
  // accounts (see middleware/auth.ts), so this is the only in-app way for
  // a superadmin to manage a wedding's own content. Reachable via the
  // "Manage" button on each row in Weddings & Sync (AdminWeddingsList.vue).
})
