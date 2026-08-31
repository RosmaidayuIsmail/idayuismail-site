export default defineNuxtRouteMiddleware(async (to) => {
  // Firebase Auth state only exists client-side, so we let the SSR pass
  // through (the page itself fetches no data until mounted) and enforce
  // the redirect once the client has resolved the real auth state.
  if (import.meta.server) return

  await waitForAuthReady()
  const { currentUser, profile } = useAuthState()

  if (!currentUser.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }

  if (!currentUser.value.emailVerified) {
    return navigateTo('/verify-email')
  }

  // Admin accounts manage the platform catalog, not their own wedding -
  // keep them out of the couple-facing dashboard entirely, the same way
  // the 'superadmin' middleware keeps couples out of /admin.
  if (profile.value?.role === 'superadmin') {
    return navigateTo('/admin')
  }

})
