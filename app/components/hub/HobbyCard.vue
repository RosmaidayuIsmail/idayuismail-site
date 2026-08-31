<template>
  <NuxtLink v-if="to" :to="to" class="hub-hobby-card group">
    <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-4" :class="iconClass">
      <UIcon :name="icon" class="w-5 h-5" />
    </div>
    <h3 class="font-semibold text-ink-950 dark:text-white mb-1">{{ title }}</h3>
    <p class="text-xs leading-relaxed text-ink-900/55 dark:text-white/50">{{ note }}</p>
    <span class="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold-600 dark:text-gold-300 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
      Open
      <UIcon name="i-heroicons-arrow-right" class="w-3.5 h-3.5" />
    </span>
  </NuxtLink>

  <div v-else class="hub-hobby-card">
    <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-4" :class="iconClass">
      <UIcon :name="icon" class="w-5 h-5" />
    </div>
    <h3 class="font-semibold text-ink-950 dark:text-white mb-1">{{ title }}</h3>
    <p class="text-xs leading-relaxed text-ink-900/55 dark:text-white/50">{{ note }}</p>
    <UBadge color="neutral" variant="subtle" size="xs" class="mt-3">Coming soon</UBadge>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon: string
  title: string
  note: string
  to?: string
  iconClass?: string
}>(), {
  iconClass: 'bg-gold-400/15 text-gold-600 dark:text-gold-300'
})
</script>

<style scoped>
.hub-hobby-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 1.25rem;
  border: 1px solid color-mix(in srgb, var(--color-ink-900) 10%, transparent);
  background: #ffffff;
  padding: 1.25rem;
  box-shadow: 0 1px 2px rgba(20, 30, 50, 0.04);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}
.hub-hobby-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--color-gold-500) 35%, transparent);
  box-shadow: 0 10px 24px -12px rgba(20, 30, 50, 0.25);
}
html.dark .hub-hobby-card {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
}
</style>
