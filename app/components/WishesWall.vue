<template>
  <!-- Rendered on the RSVP thank-you screen, inside .classic-rsvp-card/
       .classic-rsvp-card-theme, so text follows --card-text (previously a
       fixed white regardless of card style). -->
  <div>
    <h3 class="text-center font-display text-xl mb-4" :style="{ color: 'var(--theme-accent)' }">
      {{ title }}
    </h3>

    <div v-if="wishes.length" class="grid gap-3 sm:grid-cols-2">
      <TransitionGroup name="wish" tag="div" class="contents">
        <div v-for="wish in wishes" :key="wish.id" class="wish-card">
          <p class="text-sm text-[color-mix(in_srgb,var(--card-text)_90%,transparent)] leading-relaxed">&ldquo;{{ wish.doa }}&rdquo;</p>
          <p class="mt-2 text-xs uppercase tracking-wide" :style="{ color: 'var(--theme-accent)', opacity: 0.8 }">
            &mdash; {{ wish.name || 'Anonymous' }}
          </p>
        </div>
      </TransitionGroup>
    </div>

    <p v-else class="text-center text-sm text-[color-mix(in_srgb,var(--card-text)_60%,transparent)] italic">
      {{ emptyText }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ weddingId: string; maxCount?: number; title?: string; emptyText?: string }>(), {
  maxCount: 9,
  title: 'Wishes & Blessings',
  emptyText: 'Be the first to leave a wish 💛'
})
const { wishes } = useWishes(props.weddingId, props.maxCount)
</script>

<style scoped>
.wish-card {
  border-radius: 0.75rem;
  padding: 1rem;
  background: color-mix(in srgb, var(--card-text, #fff) 5%, transparent);
  border: 1px solid color-mix(in srgb, var(--theme-accent, #d4a017) 25%, transparent);
}

.wish-enter-active,
.wish-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.wish-enter-from,
.wish-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.wish-leave-active {
  position: absolute;
}

.wish-move {
  transition: transform 0.5s ease;
}

@media (prefers-reduced-motion: reduce) {
  .wish-enter-active,
  .wish-leave-active,
  .wish-move {
    transition: none;
  }
  .wish-enter-from,
  .wish-leave-to {
    opacity: 1;
    transform: none;
  }
}
</style>
