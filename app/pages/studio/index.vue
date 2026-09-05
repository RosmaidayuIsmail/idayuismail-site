<template>
  <div class="relative min-h-screen text-ink-900 dark:text-gold-50 overflow-x-hidden">
    <!-- Same ambient-glow treatment as the personal hub (app/pages/index.vue)
         so a wide desktop viewport doesn't just read as bare margins either
         side of the content column. -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute -top-24 -right-24 w-[28rem] h-[28rem] bg-emerald-400/10 dark:bg-emerald-500/10 blur-[120px] rounded-full" />
      <div class="absolute bottom-0 -left-24 w-[24rem] h-[24rem] bg-gold-400/10 dark:bg-gold-500/10 blur-[120px] rounded-full" />
    </div>

    <header class="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3 min-w-0">
        <SiteLogoLink label="Back to Idayu Ismail" class="w-10 h-10" />
        <div class="min-w-0">
          <h1 class="font-display text-xl sm:text-2xl font-bold text-ink-950 dark:text-white truncate">Home Studio</h1>
          <p class="text-xs text-ink-900/50 dark:text-white/45">Design your dream house, one room at a time.</p>
        </div>
      </div>
      <ThemeToggle />
    </header>

    <main class="relative z-10 max-w-7xl mx-auto px-6 pb-20">
      <ClientOnly>
        <StudioPlansList />
        <template #fallback>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="i in 3" :key="i" class="h-64 rounded-3xl bg-ink-900/5 dark:bg-white/5 animate-pulse" />
          </div>
        </template>
      </ClientOnly>
    </main>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Home Studio — Idayu Ismail',
  description: 'Draw floor plans, arrange furniture, and preview your dream house in 3D.'
})
</script>
