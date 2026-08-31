<template>
  <div class="empty-state">
    <div class="empty-icon">
      <UIcon :name="icon" class="w-8 h-8" />
    </div>
    <p class="empty-title">{{ title }}</p>
    <p v-if="description" class="empty-desc">{{ description }}</p>
    <UButton v-if="actionLabel" :to="actionTo" size="sm" color="primary" variant="soft" class="mt-4">
      {{ actionLabel }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
// Consistent empty-state block (icon + title + optional description/CTA)
// used wherever a list or panel has no data yet.
defineProps<{
  icon: string
  title: string
  description?: string
  actionLabel?: string
  actionTo?: string
}>()
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1.5rem;
  border: 1px dashed color-mix(in srgb, var(--color-gold-500, #d4a017) 30%, transparent);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--color-gold-500, #d4a017) 4%, transparent);
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 9999px;
  color: var(--color-gold-300, #ecc973);
  background: color-mix(in srgb, var(--color-gold-500, #d4a017) 12%, transparent);
  animation: empty-float 3.5s ease-in-out infinite;
}

.empty-title {
  margin-top: 1rem;
  font-family: var(--font-display);
  font-size: 1.05rem;
  color: var(--color-gold-100, #faf0d6);
}

.empty-desc {
  margin-top: 0.4rem;
  max-width: 26rem;
  font-size: 0.85rem;
  color: color-mix(in srgb, var(--color-gold-50, #fdf8ec) 55%, transparent);
}

@keyframes empty-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

@media (prefers-reduced-motion: reduce) {
  .empty-icon { animation: none; }
}
</style>
