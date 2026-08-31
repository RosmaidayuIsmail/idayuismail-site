// Fixes a real bug: hard-refreshing /admin (or any page whose entire layout
// is gated behind an async "is this user allowed to see this" check, like
// admin.vue's `v-if="!authReady || ..."`) could leave the sidebar looking
// "corrupted" - sticky-positioned elements rendering as if scrolled away,
// content appearing to jump below the fold, etc.
//
// Root cause: on a hard reload, the browser's native scroll-restoration
// tries to put you back at whatever scrollY you were at before reloading.
// It does this very early, often before our own JS has decided how tall
// the page actually is. admin.vue (and similar auth-gated pages) render a
// small centered spinner first, then swap in the *real*, much taller,
// full sidebar+content layout once Firebase confirms who's logged in. If
// the browser already restored you to a deep scrollY meant for the old,
// already-rendered page, that scrollY can end up in a strange spot
// relative to the freshly-mounted layout - especially for `position:
// sticky` elements, which only "engage" correctly once the browser knows
// the real layout. A plain client-side navigation (e.g. login -> /admin)
// doesn't hit this at all, because Nuxt's router always starts a fresh
// navigation at the top of the page - which matches what the user
// reported ("perfect after login, broken after refresh, only logout+
// login fixes it").
//
// Setting `scrollRestoration = 'manual'` here (as early in the client
// boot as possible) stops the browser from trying to restore a stale
// scroll position on load at all - the page simply starts at the top,
// the same as a fresh client-side navigation would.
export default defineNuxtPlugin(() => {
  if (import.meta.client && 'scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual'
  }
})
