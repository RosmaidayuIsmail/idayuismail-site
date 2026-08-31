<template>
  <div class="min-h-screen bg-ink-950 text-white flex flex-col md:flex-row relative">
    
    <!-- Background Abstract Gradients for depth -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute top-0 left-0 w-full h-96 bg-gold-500/5 blur-[120px] rounded-full mix-blend-screen"></div>
      <div class="absolute bottom-0 right-0 w-3/4 h-96 bg-indigo-500/5 blur-[120px] rounded-full mix-blend-screen"></div>
    </div>

    <!-- Sidebar / Topbar -->
    <!-- Sticky positioning here previously misbehaved the same way it did on
         /admin: an aside sized off a flex sibling's height can fail to keep
         its box in sync when that sibling's content grows asynchronously
         right after first paint (this couple's wedding data loading in on
         mount). Fixed positioning (below) anchors to the viewport directly
         instead, so it can't happen regardless of load timing - see
         app/pages/admin.vue for the full writeup. -->
    <aside class="relative z-20 md:w-72 md:fixed md:inset-y-0 md:left-0 md:h-screen md:overflow-y-auto border-b md:border-b-0 md:border-r border-white/5 bg-ink-900/40 backdrop-blur-xl p-5 flex flex-col">
      <NuxtLink to="/weddingcard" class="flex items-center gap-3 px-3 py-4 mb-6 group">
        <div class="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-gold-400/50 transition-colors">
          <UIcon name="i-heroicons-heart" class="w-5 h-5 text-gold-300 group-hover:scale-110 transition-transform" />
        </div>
        <span class="font-display font-semibold text-xl text-gold-100 tracking-wide">WeddingCard</span>
      </NuxtLink>

      <nav class="flex md:flex-col gap-2 overflow-x-auto hide-scrollbar md:overflow-visible pb-2 md:pb-0 -mx-5 px-5 md:mx-0 md:px-0">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link group"
          active-class="nav-link-active"
        >
          <UIcon :name="item.icon" class="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
          <span class="whitespace-nowrap font-medium">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Bottom Status Area -->
      <div class="mt-auto pt-6">
        <div v-if="wedding" class="rounded-xl border border-white/10 bg-white/5 p-4 text-sm mb-4 shadow-inner relative overflow-hidden group hidden md:block">
          <div class="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p class="text-white/40 uppercase tracking-widest text-[0.65rem] font-semibold mb-1 relative z-10">Live Page</p>
          <p class="text-gold-200 truncate font-medium relative z-10">/w/{{ wedding.slug }}</p>
          <div class="flex items-center gap-2 mt-3 relative z-10">
            <UBadge :color="wedding.status === 'published' ? 'success' : 'neutral'" variant="subtle" size="sm" class="shadow-sm">
              <span class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full" :class="wedding.status === 'published' ? 'bg-emerald-400 animate-pulse' : 'bg-white/40'"></span>
                {{ wedding.status === 'published' ? 'Published' : 'Draft' }}
              </span>
            </UBadge>
          </div>
        </div>
        <UButton block variant="ghost" color="neutral" icon="i-heroicons-arrow-right-on-rectangle" class="hover:bg-red-500/10 hover:text-red-400 transition-colors py-2.5 rounded-xl" @click="handleLogout">
          Sign out
        </UButton>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="relative z-10 flex-1 md:ml-72 p-4 md:p-8 lg:p-12 w-full mx-auto max-w-7xl overflow-x-hidden overflow-y-visible">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { logOut } = useAuth()
const { wedding } = useMyWedding()

const { dashboardSettings } = useThemes()
const dashboardPages = [
  { id: 'overview', to: '/dashboard', label: 'Overview', icon: 'i-heroicons-home' },
  { id: 'opening', to: '/dashboard/opening', label: 'Opening Design', icon: 'i-heroicons-envelope' },
  { id: 'editor', to: '/dashboard/editor', label: 'Design Studio', icon: 'i-heroicons-paint-brush' },
  { id: 'rsvp', to: '/dashboard/rsvp-editor', label: 'RSVP Editor', icon: 'i-heroicons-pencil-square' },
  { id: 'guests', to: '/dashboard/guests', label: 'Guest List', icon: 'i-heroicons-users' },
  { id: 'flow', to: '/dashboard/flow', label: 'Day Flow', icon: 'i-heroicons-clock' },
  { id: 'billing', to: '/dashboard/billing', label: 'Billing & Plans', icon: 'i-heroicons-credit-card' }
] as const
const navItems = computed(() => dashboardPages.flatMap((page) => {
  const setting = dashboardSettings.value.navItems.find((item) => item.id === page.id)
  return setting?.enabled === false ? [] : [{ ...page, label: setting?.label?.trim() || page.label }]
}))

async function handleLogout() {
  await logOut()
  await navigateTo('/login')
}
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
  border-color: rgba(255,255,255,0.05);
}

.nav-link-active {
  background: rgba(212, 160, 23, 0.12);
  color: #f3ddaa;
  border-color: rgba(212, 160, 23, 0.2);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
