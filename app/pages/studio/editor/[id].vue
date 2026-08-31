<template>
  <div class="h-dvh">
  <ClientOnly>
    <div class="h-full flex flex-col text-ink-900 dark:text-gold-50 overflow-hidden">
    <header class="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 border-b border-ink-900/10 dark:border-white/10 bg-white/70 dark:bg-ink-950/70 backdrop-blur">
      <NuxtLink to="/studio" class="icon-btn" aria-label="Back to plans">
        <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
      </NuxtLink>
      <input
        :value="plan.name"
        class="flex-1 min-w-0 bg-transparent font-display font-bold text-base sm:text-lg text-ink-950 dark:text-white focus:outline-none border-b border-transparent focus:border-gold-500/60 transition-colors"
        aria-label="Plan name"
        @input="rename(($event.target as HTMLInputElement).value)"
      >
      <button type="button" class="icon-btn hidden sm:inline-flex" title="Fit view" @click="fit">
        <UIcon name="i-heroicons-arrows-pointing-out" class="w-5 h-5" />
      </button>
      <button type="button" class="icon-btn" title="Export PNG" @click="onExport">
        <UIcon name="i-heroicons-arrow-down-tray" class="w-5 h-5" />
      </button>
      <button type="button" class="icon-btn" :class="{ 'icon-btn-active': show3D }" title="3D preview" @click="show3D = !show3D; showMood = false">
        <UIcon name="i-heroicons-cube" class="w-5 h-5" />
      </button>
      <button type="button" class="icon-btn" :class="{ 'icon-btn-active': showMood }" title="Moodboard" @click="showMood = !showMood; show3D = false">
        <UIcon name="i-heroicons-photo" class="w-5 h-5" />
      </button>
      <ThemeToggle />
    </header>

    <div class="flex-1 flex min-h-0">
      <aside class="hidden md:block border-r border-ink-900/10 dark:border-white/10 bg-white/60 dark:bg-ink-950/40">
        <StudioToolbar :editor="editor" />
      </aside>

      <div class="flex-1 min-w-0 relative">
        <StudioCanvas2D ref="canvasRef" :plan="plan" :editor="editor" />

        <p class="absolute left-3 top-3 max-w-[70%] text-xs px-2.5 py-1.5 rounded-full bg-white/85 dark:bg-ink-900/85 border border-ink-900/10 dark:border-white/10 text-ink-900/60 dark:text-white/60 pointer-events-none">
          {{ hint }}
        </p>

        <div v-if="editor.tool.value === 'furniture'" class="absolute right-3 top-3 z-10 hidden sm:block">
          <StudioFurnitureLibrary :editor="editor" />
        </div>
        <div v-if="editor.tool.value === 'furniture'" class="absolute inset-x-2 bottom-2 z-10 sm:hidden">
          <StudioFurnitureLibrary :editor="editor" class="w-full max-h-44" />
        </div>

        <div v-if="show3D" class="absolute inset-0 z-20">
          <ClientOnly>
            <StudioCanvas3D :plan="plan" />
            <template #fallback>
              <div class="w-full h-full flex items-center justify-center text-sm text-ink-900/50 dark:text-white/50">Loading 3D…</div>
            </template>
          </ClientOnly>
          <button
            type="button"
            class="absolute top-3 right-3 icon-btn bg-white/85 dark:bg-ink-900/85 border border-ink-900/10 dark:border-white/10 shadow"
            title="Close 3D preview"
            @click="show3D = false"
          >
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
          <p class="absolute left-3 bottom-3 text-xs px-2.5 py-1.5 rounded-full bg-white/85 dark:bg-ink-900/85 border border-ink-900/10 dark:border-white/10 text-ink-900/60 dark:text-white/60 pointer-events-none">
            Drag to orbit, scroll or pinch to zoom.
          </p>
        </div>

        <StudioMoodboard v-if="showMood" class="absolute inset-y-0 right-0 z-20" @close="showMood = false" />
      </div>
    </div>

    <div class="md:hidden border-t border-ink-900/10 dark:border-white/10 bg-white/85 dark:bg-ink-950/85 backdrop-blur">
      <StudioToolbar :editor="editor" />
    </div>
    </div>
    <template #fallback>
      <div class="h-full flex items-center justify-center text-ink-900/50 dark:text-white/50">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
      </div>
    </template>
  </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type { Plan } from '~/composables/useStudioPlan'

const route = useRoute()
const { getPlan, patchPlan, persist } = useStudioPlan()

const plan = computed(() => getPlan(route.params.id as string) as Plan)
if (import.meta.client && !plan.value) {
  await navigateTo('/studio', { replace: true })
}

const editor = useStudioEditor(plan as unknown as Ref<Plan>)
const canvasRef = ref<{ svgEl: SVGSVGElement | null; fit: () => void } | null>(null)
const { exportPng, makeThumbnail } = useStudioExport()
const show3D = ref(false)
const showMood = ref(false)

const planName = ref(plan.value?.name ?? '')
function rename(name: string) {
  planName.value = name
  patchPlan(plan.value.id, { name })
}

let saveTimer: ReturnType<typeof setTimeout> | undefined
watch(plan, () => {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => persist(), 500)
}, { deep: true })

const hints: Record<string, string> = {
  select: 'Drag to move things. Drag empty space to pan. Scroll to zoom.',
  wall: 'Click to start a wall, click again at each corner. Double-click or Enter to finish, Esc to cancel.',
  room: 'Drag a rectangle to add a room.',
  door: 'Click on a wall to cut a door opening.',
  window: 'Click on a wall to cut a window.',
  furniture: 'Pick a piece, then tap the canvas to place it.'
}
const hint = computed(() => hints[editor.tool.value])

function fit() {
  canvasRef.value?.fit()
}

async function onExport() {
  const svg = canvasRef.value?.svgEl
  if (!svg) return
  await exportPng(svg, planName.value || plan.value.name)
  await saveThumbnail()
}

async function saveThumbnail() {
  const svg = canvasRef.value?.svgEl
  if (!svg) return
  try {
    const thumbnail = await makeThumbnail(svg)
    patchPlan(plan.value.id, { thumbnail })
  } catch { /* thumbnail is best-effort */ }
}

function isTyping(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null
  return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
}

onKeyStroke(['Delete', 'Backspace'], (e) => {
  if (isTyping(e)) return
  e.preventDefault()
  editor.deleteSelection()
})
onKeyStroke('r', (e) => {
  if (isTyping(e) || e.metaKey || e.ctrlKey) return
  editor.rotateSelection()
})
onKeyStroke('z', (e) => {
  if (isTyping(e) || !(e.metaKey || e.ctrlKey)) return
  e.preventDefault()
  editor.undo()
})
onKeyStroke('Escape', () => {
  if (editor.wallDraft.value) editor.endWallChain()
  else editor.clearAll()
})
onKeyStroke('Enter', () => editor.endWallChain())
onKeyStroke('v', (e) => { if (!isTyping(e)) editor.setTool('select') })
onKeyStroke('w', (e) => { if (!isTyping(e)) editor.setTool('wall') })
onKeyStroke('m', (e) => { if (!isTyping(e)) editor.setTool('room') })
onKeyStroke('d', (e) => { if (!isTyping(e)) editor.setTool('door') })
onKeyStroke('n', (e) => { if (!isTyping(e)) editor.setTool('window') })
onKeyStroke('f', (e) => { if (!isTyping(e)) editor.setTool('furniture') })

onBeforeUnmount(() => {
  saveThumbnail()
})

useSeoMeta({ title: 'Home Studio — Editor' })
</script>

<style scoped>
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.75rem;
  color: color-mix(in srgb, var(--color-ink-900) 75%, transparent);
  transition: background-color 0.2s ease, color 0.2s ease;
  flex-shrink: 0;
}
html.dark .icon-btn {
  color: rgba(255, 255, 255, 0.7);
}
.icon-btn:hover {
  background: rgba(212, 160, 23, 0.12);
  color: #b8860b;
}
html.dark .icon-btn:hover {
  color: #ecc973;
}
.icon-btn-active {
  background: #d4a017;
  color: #ffffff;
}
.icon-btn-active:hover {
  background: #b8860b;
  color: #ffffff;
}
</style>
