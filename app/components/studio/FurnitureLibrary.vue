<template>
  <div class="rounded-2xl border border-ink-900/10 dark:border-white/10 bg-white/95 dark:bg-ink-900/95 backdrop-blur shadow-xl p-3 w-56 max-h-72 overflow-y-auto">
    <p class="text-xs font-semibold uppercase tracking-wider text-ink-900/50 dark:text-white/50 mb-2">Furniture</p>
    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="s in FURNITURE_SYMBOLS"
        :key="s.id"
        type="button"
        class="furn-btn"
        :class="{ 'furn-btn-active': editor.furnitureSymbol.value === s.id }"
        :title="s.label"
        @click="select(s.id)"
      >
        <svg :viewBox="`${-s.w / 2 - 0.1} ${-s.h / 2 - 0.1} ${s.w + 0.2} ${s.h + 0.2}`" class="w-9 h-9">
          <g v-html="s.svg(s.w, s.h)" />
        </svg>
        <span class="text-[10px] leading-tight text-center text-ink-900/60 dark:text-white/60">{{ s.label }}</span>
      </button>
    </div>
    <p class="text-[10px] text-ink-900/40 dark:text-white/40 mt-2">Tap the canvas to place. Drag to move, R to rotate.</p>
  </div>
</template>

<script setup lang="ts">
import type { StudioEditor } from '~/composables/useStudioEditor'

const props = defineProps<{ editor: StudioEditor }>()

function select(id: string) {
  props.editor.furnitureSymbol.value = id
}
</script>

<style scoped>
.furn-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.4rem;
  border-radius: 0.75rem;
  border: 1px solid transparent;
  color: #2a4d75;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}
html.dark .furn-btn {
  color: #9db8d6;
}
.furn-btn:hover {
  background: rgba(212, 160, 23, 0.1);
}
.furn-btn-active {
  border-color: #d4a017;
  background: rgba(212, 160, 23, 0.12);
}
</style>
