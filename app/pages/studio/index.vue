<template>
  <div class="relative min-h-screen text-ink-900 dark:text-gold-50 overflow-x-hidden">
    <!-- Same viewport-scaling ambient glow as the personal hub
         (app/pages/index.vue) - vw-sized (not fixed rem) so it actually
         fills a wide/ultrawide monitor instead of staying a small patch in
         one corner, and fixed (not absolute) so it stays put as a full
         backdrop regardless of how tall the page's content ends up. -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute -top-[15vw] -right-[15vw] w-[48vw] h-[48vw] max-w-[44rem] max-h-[44rem] bg-emerald-400/15 dark:bg-emerald-500/15 blur-[100px] rounded-full" />
      <div class="absolute bottom-[-15vh] -left-[15vw] w-[42vw] h-[42vw] max-w-[38rem] max-h-[38rem] bg-gold-400/15 dark:bg-gold-500/15 blur-[100px] rounded-full" />
      <div class="absolute top-[35vh] left-[35vw] w-[35vw] h-[35vw] max-w-[32rem] max-h-[32rem] bg-sky-400/10 dark:bg-sky-500/10 blur-[100px] rounded-full" />
    </div>

    <header class="relative z-10 max-w-[1600px] mx-auto px-6 pt-8 pb-4 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3 min-w-0">
        <SiteLogoLink label="Back to Idayu Ismail" class="w-10 h-10" />
        <div class="min-w-0">
          <h1 class="font-display text-xl sm:text-2xl font-bold text-ink-950 dark:text-white truncate">Home Studio</h1>
          <p class="text-xs text-ink-900/50 dark:text-white/45">Design your dream house, one room at a time.</p>
        </div>
      </div>
      <ThemeToggle />
    </header>

    <main class="relative z-10 max-w-[1600px] mx-auto px-6 pb-20">
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
