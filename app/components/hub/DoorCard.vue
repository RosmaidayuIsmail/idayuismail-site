<template>
  <NuxtLink
    :to="to"
    class="group block rounded-3xl border border-ink-900/10 dark:border-white/10 bg-white dark:bg-white/[0.03] p-7 shadow-sm hover-lift"
  >
    <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" :class="iconClass">
      <UIcon :name="icon" class="w-6 h-6" />
    </div>
    <h3 class="font-display text-xl font-bold mb-2 text-ink-950 dark:text-white">{{ title }}</h3>
    <p class="text-sm leading-relaxed text-ink-900/60 dark:text-white/60 mb-6">{{ description }}</p>
    <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-600 dark:text-gold-300">
      {{ cta }}
      <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  to: string
  title: string
  description: string
  icon: string
  cta?: string
  iconClass?: string
}>(), {
  cta: 'Enter',
  iconClass: 'bg-gold-400/15 text-gold-600 dark:text-gold-300'
})
</script>
