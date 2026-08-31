<template>
  <div class="min-h-screen text-ink-900 dark:text-gold-50">
    <header class="max-w-6xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3 min-w-0">
        <NuxtLink
          to="/"
          class="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full border border-ink-900/10 dark:border-white/15 text-ink-700 dark:text-gold-200 transition-colors hover:border-gold-500/50 hover:text-gold-600 dark:hover:text-gold-300"
          aria-label="Back to home"
        >
          <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
        </NuxtLink>
        <div class="min-w-0">
          <h1 class="font-display text-xl sm:text-2xl font-bold text-ink-950 dark:text-white truncate">Home Studio</h1>
          <p class="text-xs text-ink-900/50 dark:text-white/45">Design your dream house, one room at a time.</p>
        </div>
      </div>
      <ThemeToggle />
    </header>

    <main class="max-w-6xl mx-auto px-6 pb-20">
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
