<template>
  <div class="flex md:flex-col items-center gap-1 overflow-x-auto md:overflow-visible hide-scrollbar p-1.5 md:p-2">
    <button
      v-for="t in tools"
      :key="t.id"
      type="button"
      class="toolbar-btn"
      :class="{ 'toolbar-btn-active': editor.tool.value === t.id }"
      :title="t.label"
      :aria-label="t.label"
      @click="editor.setTool(t.id)"
    >
      <UIcon :name="t.icon" class="w-5 h-5" />
    </button>

    <div class="w-8 h-px md:w-px md:h-8 bg-ink-900/10 dark:bg-white/10 mx-1 shrink-0" />

    <button type="button" class="toolbar-btn" :class="{ 'opacity-40 pointer-events-none': !editor.canUndo.value }" title="Undo (Ctrl+Z)" aria-label="Undo" @click="editor.undo()">
      <UIcon name="i-heroicons-arrow-uturn-left" class="w-5 h-5" />
    </button>
    <button type="button" class="toolbar-btn" :class="{ 'opacity-40 pointer-events-none': !editor.selection.value }" title="Rotate (R)" aria-label="Rotate" @click="editor.rotateSelection()">
      <UIcon name="i-heroicons-arrow-path" class="w-5 h-5" />
    </button>
    <button type="button" class="toolbar-btn" :class="{ 'opacity-40 pointer-events-none': !editor.selection.value }" title="Delete (Del)" aria-label="Delete" @click="editor.deleteSelection()">
      <UIcon name="i-heroicons-trash" class="w-5 h-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import type { StudioEditor, Tool } from '~/composables/useStudioEditor'

defineProps<{ editor: StudioEditor }>()

const tools: { id: Tool; icon: string; label: string }[] = [
  { id: 'select', icon: 'i-heroicons-cursor-arrow-rays', label: 'Select / move (V)' },
  { id: 'wall', icon: 'i-heroicons-minus', label: 'Draw walls (W)' },
  { id: 'room', icon: 'i-heroicons-square-2-stack', label: 'Add room (M) - drag a rectangle' },
  { id: 'door', icon: 'i-heroicons-arrow-right-on-rectangle', label: 'Place door (D)' },
  { id: 'window', icon: 'i-heroicons-window', label: 'Place window (N)' },
  { id: 'furniture', icon: 'i-lucide-armchair', label: 'Place furniture (F)' }
]
</script>

<style scoped>
.toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  color: color-mix(in srgb, var(--color-ink-900) 75%, transparent);
  transition: background-color 0.2s ease, color 0.2s ease;
  flex-shrink: 0;
}
html.dark .toolbar-btn {
  color: rgba(255, 255, 255, 0.7);
}
.toolbar-btn:hover {
  background: rgba(212, 160, 23, 0.12);
  color: #b8860b;
}
html.dark .toolbar-btn:hover {
  color: #ecc973;
}
.toolbar-btn-active {
  background: #d4a017;
  color: #ffffff;
}
.toolbar-btn-active:hover {
  background: #b8860b;
  color: #ffffff;
}
</style>
