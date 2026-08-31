<template>
  <div
    aria-hidden="true"
    class="petals-container"
    :class="{ 'petals-tinted': !!color }"
    :style="color ? { '--petal-color': color } : undefined"
  >
    <div
      v-for="i in count"
      :key="i"
      class="petal"
      :style="{ '--i': i - 1, '--duration': `${11 + (i % 6) * 1.6}s` }"
    >
      <svg v-if="styleName === 'confetti'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect
          x="14" y="14" width="36" height="20" rx="3"
          :fill="confettiColors[i % confettiColors.length]"
          :transform="`rotate(${(i * 47) % 360} 32 32)`"
        />
      </svg>
      <svg v-else-if="styleName === 'hearts'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M32 56C18 46 6 36 6 22C6 12 14 6 22 6C27 6 31 9 32 13C33 9 37 6 42 6C50 6 58 12 58 22C58 36 46 46 32 56Z"
          :fill="`rgba(212, 160, 23, ${0.35 + (i % 5) * 0.06})`"
          :stroke="`rgba(243, 221, 170, ${0.55 + (i % 5) * 0.06})`"
          stroke-width="2"
        />
      </svg>
      <svg v-else-if="styleName === 'sparkles'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M32 2 L38 26 L62 32 L38 38 L32 62 L26 38 L2 32 L26 26 Z"
          :fill="`rgba(243, 221, 170, ${0.5 + (i % 5) * 0.08})`"
        />
      </svg>
      <svg v-else-if="styleName === 'stars'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M32 2 L40 24 L62 24 L44 38 L52 60 L32 46 L12 60 L20 38 L2 24 L24 24 Z"
          :fill="`rgba(212, 160, 23, ${0.35 + (i % 5) * 0.06})`"
          :stroke="`rgba(243, 221, 170, ${0.55 + (i % 5) * 0.06})`"
          stroke-width="2"
        />
      </svg>
      <svg v-else viewBox="0 0 64 96" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M32 0C47 32 48 64 32 96C17 64 16 32 32 0Z"
          :fill="`rgba(212, 160, 23, ${0.3 + (i % 5) * 0.06})`"
          :stroke="`rgba(243, 221, 170, ${0.55 + (i % 5) * 0.06})`"
          stroke-width="2"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ count?: number; styleName?: string; color?: string }>(), { count: 20, styleName: 'petals', color: '' })

// A small mixed palette for confetti so pieces aren't all one flat color -
// leans on the theme accent plus a couple of complementary tones.
const confettiColors = [
  'rgba(212, 160, 23, 0.85)',
  'rgba(243, 221, 170, 0.85)',
  'rgba(255, 255, 255, 0.55)',
  'rgba(212, 160, 23, 0.55)'
]
void props
</script>

<style scoped>
/* When a couple picked a petal color, override the SVG fill attributes with
   the chosen color (CSS fill wins over presentation attributes). */
.petals-tinted :deep(svg rect),
.petals-tinted :deep(svg path) {
  fill: var(--petal-color);
}
</style>