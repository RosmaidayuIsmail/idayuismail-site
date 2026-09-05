<template>
  <NuxtLink
    to="/"
    class="group/logo relative inline-flex items-center justify-center shrink-0"
    :aria-label="`Back to ${label}`"
  >
    <img :src="LOGO_SRC" alt="" class="w-full h-full object-contain drop-shadow-sm transition-transform duration-200 group-hover/logo:scale-105">
    <span
      class="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink-950 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/logo:opacity-100 z-50"
    >
      {{ label }}
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
// Small "back to the main site" mark used in headers across WeddingCard,
// Home Studio, and any other door off the personal hub (app/pages/index.vue)
// - always links to "/", the hover label is the only thing that changes per
// page so it reads naturally wherever it's placed.
withDefaults(defineProps<{ label?: string }>(), { label: 'Idayu Ismail' })

const LOGO_SRC = '/idayuismail-logo.svg'
</script>
