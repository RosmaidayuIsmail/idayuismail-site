<template>
  <!-- Rendered inside the Details page's card (classic-inner-card/
       classic-inner-card-theme) - times/dots/star/location previously used
       a fixed gold var that read as pale, low-contrast yellow on a light
       theme-tinted card (Matcha Strawberry), so they now follow the
       couple's own --theme-accent instead, same as the Bride/Groom labels
       elsewhere on this card. The description line was hardcoded white,
       which went near-invisible on the same light cards - now --card-text,
       like every other line of body text on this card. -->
  <ol class="flow-timeline">
    <li v-for="item in items" :key="item.id" class="flow-item" :class="{ 'flow-item-highlight': item.highlight }">
      <div class="flow-time">{{ item.time }}</div>
      <div class="flow-dot" />
      <div class="flow-body">
        <p class="flow-title">
          {{ item.title }}
          <span v-if="item.highlight" class="flow-star">&#9733;</span>
        </p>
        <p v-if="item.description" class="flow-description">{{ item.description }}</p>
        <p v-if="item.location" class="flow-location">&#128205; {{ item.location }}</p>
      </div>
    </li>
  </ol>
</template>

<script setup lang="ts">
import type { FlowItem } from '~/composables/useWeddingTypes'

defineProps<{ items: FlowItem[] }>()
</script>

<style scoped>
.flow-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
  max-height: 260px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.flow-item {
  display: grid;
  grid-template-columns: 3.5rem auto 1fr;
  align-items: start;
  gap: 0.5rem;
}

.flow-time {
  font-size: 0.7rem;
  font-variant-numeric: tabular-nums;
  color: var(--theme-accent, #ecc973);
  padding-top: 0.15rem;
}

.flow-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  background: var(--theme-accent, #e3b04a);
  margin-top: 0.35rem;
}

.flow-title {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--card-text, #fff);
}

.flow-description {
  font-size: 0.75rem;
  color: color-mix(in srgb, var(--card-text, #fff) 65%, transparent);
  margin-top: 0.1rem;
}

.flow-location {
  font-size: 0.7rem;
  color: var(--theme-accent, #ecc973);
  opacity: 0.8;
  margin-top: 0.2rem;
}

.flow-star {
  color: var(--theme-accent, #e3b04a);
  font-size: 0.7rem;
  margin-left: 0.15rem;
}

.flow-item-highlight .flow-dot {
  width: 0.7rem;
  height: 0.7rem;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--theme-accent, #e3b04a) 25%, transparent);
}

.flow-item-highlight .flow-title {
  color: var(--theme-accent, #f3ddaa);
}
</style>
