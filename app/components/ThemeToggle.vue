<template>
  <button
    type="button"
    class="inline-flex items-center justify-center w-10 h-10 rounded-full border border-ink-900/10 dark:border-white/15 bg-white/70 dark:bg-white/5 text-ink-700 dark:text-gold-200 transition-colors hover:border-gold-500/50 hover:text-gold-600 dark:hover:text-gold-300"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggle"
  >
    <UIcon :name="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'" class="w-5 h-5" />
  </button>
</template>

<script setup lang="ts">
const { isDark, toggle } = useThemeToggle()
</script>
