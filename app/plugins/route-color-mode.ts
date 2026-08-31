// The wedding platform (marketing, auth, dashboards, admin, public invite
// pages) is designed dark-only; the personal hub (/) and Home Studio
// (/studio) are light by default with a user toggle. Force 'dark' whenever
// a wedding route is entered, and leave the stored preference untouched on
// hub/studio routes so the toggle choice survives navigation.
export default defineNuxtPlugin((nuxtApp) => {
  const colorMode = useColorMode()

  const apply = (path: string) => {
    const isWeddingRoute = /^\/(weddingcard|login|signup|verify-email|dashboard|admin|w)(\/|$)/.test(path)
    if (isWeddingRoute) colorMode.preference = 'dark'
  }

  apply(nuxtApp.$router.currentRoute.value.path)
  nuxtApp.$router.beforeEach((to) => apply(to.path))
})
