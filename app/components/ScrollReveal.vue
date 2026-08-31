<template>
  <div ref="target" class="scroll-reveal" :class="{ 'scroll-reveal-visible': visible }" :style="{ transitionDelay: `${delay}ms` }">
    <slot />
  </div>
</template>

<script setup lang="ts">
// Fades + rises a section into place the first time it scrolls into view -
// the "each scene animates in as you scroll to it" feel from the reference
// invitation, applied to StoryInvite.vue's scenes. Uses @vueuse/nuxt's
// useIntersectionObserver (already a project dependency, auto-imported -
// see useSwipe/onKeyStroke in details.vue for the same pattern) rather than
// hand-rolling an IntersectionObserver.
const props = withDefaults(defineProps<{ delay?: number }>(), { delay: 0 })

const target = ref<HTMLElement | null>(null)
const visible = ref(false)

const { stop } = useIntersectionObserver(
  target,
  ([entry]) => {
    if (entry?.isIntersecting) {
      visible.value = true
      // Reveal-once: a guest scrolling back up shouldn't watch every scene
      // fade out and back in again on repeat.
      stop()
    }
  },
  { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
)
</script>

<style scoped>
.scroll-reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}
.scroll-reveal-visible {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .scroll-reveal {
    transition: opacity 0.3s ease;
    transform: none;
  }
}
</style>
