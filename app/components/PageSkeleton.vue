<template>
  <div class="page-skeleton" :class="`page-skeleton-${variant}`" aria-hidden="true">
    <template v-if="variant === 'page'">
      <div class="sk sk-badge" />
      <div class="sk sk-title" />
      <div class="sk sk-sub" />
      <div class="sk-row">
        <div class="sk sk-card" />
        <div class="sk sk-card" />
        <div class="sk sk-card" />
      </div>
      <div class="sk sk-block" />
    </template>

    <template v-else-if="variant === 'card'">
      <div class="sk sk-card" />
      <div class="sk sk-sub" />
    </template>

    <template v-else>
      <div class="sk sk-line" />
      <div class="sk sk-line sk-line-short" />
      <div class="sk sk-line" />
      <div class="sk sk-line sk-line-short" />
    </template>
  </div>
</template>

<script setup lang="ts">
// Branded loading placeholder matching the gold/ink palette in main.css.
// Pure CSS shimmer (no JS) for performance; under prefers-reduced-motion the
// shimmer is disabled and the blocks render as static tints.
withDefaults(defineProps<{ variant?: 'page' | 'card' | 'list' }>(), {
  variant: 'page'
})
</script>

<style scoped>
.page-skeleton {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 42rem;
  margin: 0 auto;
  padding: 3rem 1.25rem;
}

.sk {
  border-radius: 0.75rem;
  background: linear-gradient(
    100deg,
    color-mix(in srgb, var(--color-gold-500, #d4a017) 8%, transparent) 40%,
    color-mix(in srgb, var(--color-gold-500, #d4a017) 22%, transparent) 50%,
    color-mix(in srgb, var(--color-gold-500, #d4a017) 8%, transparent) 60%
  );
  background-size: 200% 100%;
  animation: sk-shimmer 1.4s ease-in-out infinite;
}

.sk-badge { width: 3rem; height: 3rem; border-radius: 9999px; }
.sk-title { width: 60%; height: 1.75rem; }
.sk-sub { width: 40%; height: 0.9rem; }
.sk-block { width: 100%; height: 8rem; }

.sk-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  width: 100%;
}
.sk-card { width: 100%; height: 5rem; }

.sk-line { width: 100%; height: 1rem; }
.sk-line-short { width: 70%; }

@keyframes sk-shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .sk {
    animation: none;
    background: color-mix(in srgb, var(--color-gold-500, #d4a017) 10%, transparent);
  }
}
</style>
