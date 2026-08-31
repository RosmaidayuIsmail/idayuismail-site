<template>
  <!-- Gate on the client-side auth check ourselves, in addition to the
       'superadmin' route middleware. The middleware can't run its check
       during SSR (Firebase Auth only exists client-side), so without this
       guard the page below would briefly render its full content on the
       server before the client redirects an unauthorized visitor away -
       a flash of the real dashboard, not just a layout glitch. -->
  <div v-if="!authReady || !currentUser || profile?.role !== 'superadmin'" class="min-h-screen invite-backdrop flex items-center justify-center text-white/60">
    <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gold-400" />
  </div>

  <!-- Platform controls only: this page controls the user-facing dashboard
       catalog/defaults, not an individual couple's invitation. -->
  <div v-else class="min-h-screen bg-ink-950 text-white flex flex-col md:flex-row relative">
    <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute top-0 left-0 w-full h-96 bg-indigo-500/5 blur-[120px] rounded-full mix-blend-screen"></div>
      <div class="absolute bottom-0 right-0 w-3/4 h-96 bg-gold-500/5 blur-[120px] rounded-full mix-blend-screen"></div>
    </div>

    <aside class="relative z-20 md:w-72 md:fixed md:inset-y-0 md:left-0 md:h-screen md:overflow-y-auto border-b md:border-b-0 md:border-r border-white/5 bg-ink-900/40 backdrop-blur-xl p-5 flex flex-col">
      <div class="flex items-center gap-3 px-3 py-4 mb-2">
        <div class="p-2 rounded-lg bg-white/5 border border-white/10">
          <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-gold-300" />
        </div>
        <span class="font-display font-semibold text-xl text-gold-100 tracking-wide">Admin</span>
      </div>
      <p class="px-3 text-xs text-white/40 mb-6 leading-relaxed">Editing what every couple can choose from - not any one couple's own wedding.</p>

      <nav class="flex md:flex-col gap-2 overflow-x-auto hide-scrollbar md:overflow-visible pb-2 md:pb-0 -mx-5 px-5 md:mx-0 md:px-0">
        <button
          v-for="item in navItems"
          :key="item.id"
          type="button"
          class="nav-link group"
          :class="{ 'nav-link-active': section === item.id }"
          @click="section = item.id"
        >
          <UIcon :name="item.icon" class="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
          <span class="whitespace-nowrap font-medium">{{ item.label }}</span>
        </button>
      </nav>

      <div class="mt-auto pt-6">
        <UButton block variant="ghost" color="neutral" icon="i-heroicons-arrow-right-on-rectangle" class="hover:bg-red-500/10 hover:text-red-400 transition-colors py-2.5 rounded-xl" @click="handleLogout">
          Sign out
        </UButton>
      </div>
    </aside>

    <main class="relative z-10 flex-1 md:ml-72 p-4 md:p-8 lg:p-12 w-full mx-auto max-w-6xl overflow-x-hidden">
      <div class="mb-8">
        <h1 class="text-2xl sm:text-3xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-100 via-gold-300 to-gold-500 tracking-tight">
          {{ currentNavItem.label }}
        </h1>
        <p class="text-sm text-white/50 mt-1.5">{{ currentNavItem.description }}</p>
      </div>

      <AdminDashboardControls v-if="section === 'dashboard'" />
      <AdminStarterDefaults v-else-if="section === 'starter-defaults'" />
      <AdminRsvpCatalog v-else-if="section === 'rsvp'" />
      <AdminDayFlowControls v-else-if="section === 'day-flow'" />
      <AdminGuestListControls v-else-if="section === 'guests'" />
      <AdminCustomCode v-else-if="section === 'custom-code'" />
      <AdminWeddingsList v-else-if="section === 'weddings'" />
      <AdminPhysicalOrders v-else-if="section === 'physical-orders'" />
      <AdminCatalogManager v-else :section="section" />
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'superadmin' })

const { logOut } = useAuth()
const { currentUser, profile, authReady } = useAuthState()

type Section = 'dashboard' | 'themes' | 'fonts' | 'presets' | 'rsvp' | 'opening-styles' | 'design-options' | 'day-flow' | 'guests' | 'custom-code' | 'starter-defaults' | 'weddings' | 'physical-orders'

const navItems: { id: Section; label: string; icon: string; description: string }[] = [
  { id: 'weddings', label: 'Weddings & Sync', icon: 'i-heroicons-rectangle-stack', description: 'The admin home - every wedding on the platform, plus applying the platform template to weddings that already exist.' },
  { id: 'physical-orders', label: 'Physical Card Orders', icon: 'i-heroicons-square-3-stack-3d', description: 'Every couple\'s physical card order across the platform - confirm, move through production, and mark shipped.' },
  { id: 'dashboard', label: 'User Dashboard', icon: 'i-heroicons-squares-2x2', description: 'Control the labels and enabled pages every user sees in their dashboard.' },
  { id: 'themes', label: 'Design Studio', icon: 'i-heroicons-swatch', description: 'Themes and palette pricing available in the user Design Studio.' },
  { id: 'fonts', label: 'Typography', icon: 'i-heroicons-language', description: 'Fonts available in user font pickers across the app.' },
  { id: 'design-options', label: 'Design Options', icon: 'i-heroicons-adjustments-horizontal', description: 'Which ornaments, particle styles, and top icons users can select in Design Studio.' },
  { id: 'presets', label: 'Opening Languages', icon: 'i-heroicons-pencil-square', description: 'One-click Opening Design language presets shown to users.' },
  { id: 'rsvp', label: 'RSVP Languages', icon: 'i-heroicons-chat-bubble-left-right', description: 'RSVP language presets shown to users with every editable prompt.' },
  { id: 'opening-styles', label: 'Opening Styles', icon: 'i-heroicons-envelope-open', description: 'Choose which opening animations users can select.' },
  { id: 'day-flow', label: 'Day Flow', icon: 'i-heroicons-clock', description: 'Quick Start timeline presets and page labels for the Day Flow page.' },
  { id: 'guests', label: 'Guest List', icon: 'i-heroicons-users', description: 'Page labels, tier names, and optional columns on the Guest List page.' },
  { id: 'custom-code', label: 'Custom Code', icon: 'i-heroicons-code-bracket-square', description: 'Sandboxed CSS/HTML/JS injected into every live wedding page.' },
  { id: 'starter-defaults', label: 'Starter Defaults', icon: 'i-heroicons-document-duplicate', description: 'What a brand-new wedding starts with - story text, buttons, petals, ornament, and a starter flow.' }
]

const section = ref<Section>('weddings')
const currentNavItem = computed(() => navItems.find((item) => item.id === section.value)!)

// Bug fix: hard-refreshing this page used to leave the sidebar looking
// "corrupted" - its dark panel stopping partway down the page instead of
// running the full height, only fixed by logging out and back in. The
// <aside> below used to be `position: sticky` with a fixed `h-screen`
// height, sized relative to its flex sibling (<main>). That combination is
// known to misbehave when the sibling's content height changes shortly
// after the initial paint (exactly what happens here: the Weddings list
// loads asynchronously right after mount and the page grows taller) -
// some browsers don't reliably recompute a sticky element's box once its
// container's height changes out from under it on first load, even though
// they do on every scroll/resize afterward. A plain client-side navigation
// (like the one right after logging in) never hits this, because that
// navigation happens after the async content is already loaded.
//
// Fix: the <aside> is now `position: fixed` instead of `sticky` (see its
// class list below - md:fixed md:inset-y-0 md:left-0 - with <main> given a
// matching md:ml-72 to leave room for it). A fixed element is anchored to
// the viewport directly and never depends on a sibling's height at all, so
// this entire class of bug can't happen regardless of when content loads.
//
// Kept as a smaller belt-and-suspenders measure: force scroll-to-top the
// moment the real layout appears, and stop the browser from trying to
// restore a stale scroll position on reload at all (see
// app/plugins/scroll-restoration.client.ts).
const ready = computed(() => authReady.value && !!currentUser.value && profile.value?.role === 'superadmin')
watch(ready, (isReady) => {
  if (isReady && import.meta.client) {
    nextTick(() => window.scrollTo(0, 0))
  }
}, { immediate: true })

async function handleLogout() {
  await logOut()
  await navigateTo('/login')
}

useSeoMeta({ title: 'Platform Admin \u2014 WeddingCard', robots: 'noindex, nofollow' })
</script>

<style scoped>
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.04);
  color: white;
  border-color: rgba(255, 255, 255, 0.05);
}

.nav-link-active {
  background: rgba(212, 160, 23, 0.12);
  color: #f3ddaa;
  border-color: rgba(212, 160, 23, 0.2);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
