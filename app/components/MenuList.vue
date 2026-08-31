<template>
  <!-- Wedding reception food menu, grouped by category and presented like a
       restaurant menu page (the look referenced from menate.com.my's own
       menu page) - dish name, optional short description, optional photo.
       Colors follow the couple's own theme, same as FlowTimeline.vue. -->
  <div class="menu-list">
    <div v-for="group in groups" :key="group.category" class="menu-group">
      <p class="menu-category">{{ group.category }}</p>
      <div class="menu-divider" />
      <div class="menu-items">
        <div v-for="item in group.items" :key="item.id" class="menu-item">
          <img v-if="item.imageUrl" :src="item.imageUrl" alt="" class="menu-item-photo" loading="lazy">
          <div class="menu-item-text">
            <p class="menu-item-name">{{ item.name }}</p>
            <p v-if="item.description" class="menu-item-description">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuItem } from '~/composables/useWeddingTypes'

const props = defineProps<{ items: MenuItem[] }>()

// Groups items by category while keeping first-seen category order, so the
// couple's own ordering (the order they added dishes in) decides how
// categories are listed instead of an alphabetical resort.
const groups = computed(() => {
  const order: string[] = []
  const byCategory = new Map<string, MenuItem[]>()
  for (const item of props.items) {
    const category = item.category?.trim() || 'Menu'
    if (!byCategory.has(category)) {
      byCategory.set(category, [])
      order.push(category)
    }
    byCategory.get(category)!.push(item)
  }
  return order.map((category) => ({ category, items: byCategory.get(category)! }))
})
</script>

<style scoped>
.menu-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: left;
  max-height: 320px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.menu-category {
  font-family: var(--theme-heading-font, serif);
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--theme-accent, #e3b04a);
}

.menu-divider {
  height: 1px;
  margin: 0.35rem 0 0.75rem;
  background: linear-gradient(to right, var(--theme-accent, #e3b04a), transparent);
  opacity: 0.5;
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.menu-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.menu-item-photo {
  width: 3rem;
  height: 3rem;
  border-radius: 0.65rem;
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.menu-item-text {
  min-width: 0;
}

.menu-item-name {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--card-text, #fff);
}

.menu-item-description {
  font-size: 0.75rem;
  color: color-mix(in srgb, var(--card-text, #fff) 65%, transparent);
  margin-top: 0.15rem;
}
</style>
