<template>
  <div ref="containerEl" class="relative w-full h-full overflow-hidden" :style="{ background: palette.bg }">
    <svg
      ref="svgEl"
      class="block w-full h-full touch-none select-none"
      :style="{ cursor: editor.tool.value === 'select' ? 'default' : 'crosshair' }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @pointerleave="editor.ghost.value = null"
      @dblclick="editor.endWallChain()"
    >
      <rect x="0" y="0" width="100%" height="100%" :fill="palette.bg" />
      <g :transform="`translate(${editor.view.x} ${editor.view.y}) scale(${editor.view.scale})`">
        <line
          v-for="g in gridLines"
          :key="g.key"
          :x1="g.x1" :y1="g.y1" :x2="g.x2" :y2="g.y2"
          :stroke="g.major ? palette.gridMajor : palette.grid"
          :stroke-width="1 / editor.view.scale"
        />

        <g v-for="room in plan.rooms" :key="room.id">
          <polygon
            :points="polyPoints(room.polygon)"
            :fill="palette.room"
            :stroke="isSelected('room', room.id) ? palette.accent : palette.roomStroke"
            :stroke-width="isSelected('room', room.id) ? 0.07 : 0.03"
          />
          <text
            :x="centroid(room.polygon).x" :y="centroid(room.polygon).y - 0.1"
            text-anchor="middle"
            :fill="palette.text"
            :font-size="0.4"
            font-family="Poppins, sans-serif"
          >{{ room.label }}</text>
          <text
            :x="centroid(room.polygon).x" :y="centroid(room.polygon).y + 0.35"
            text-anchor="middle"
            :fill="palette.text"
            :font-size="0.28"
            opacity="0.65"
            font-family="Poppins, sans-serif"
          >{{ polygonArea(room.polygon).toFixed(1) }} m²</text>
        </g>

        <g v-for="wall in plan.walls" :key="wall.id">
          <line
            v-for="(seg, i) in wallSegments(wall)"
            :key="i"
            :x1="seg.a.x" :y1="seg.a.y" :x2="seg.b.x" :y2="seg.b.y"
            :stroke="palette.wall"
            :stroke-width="wall.thickness"
            stroke-linecap="square"
          />
          <g v-for="op in openingsOf(wall)" :key="op.id">
            <line
              v-if="isSelected('opening', op.id)"
              :x1="along(wall, op.offset).x" :y1="along(wall, op.offset).y"
              :x2="along(wall, op.offset + op.width).x" :y2="along(wall, op.offset + op.width).y"
              :stroke="palette.accent" :stroke-width="wall.thickness + 0.12" opacity="0.45"
            />
            <g v-if="op.type === 'door'">
              <line
                :x1="along(wall, op.offset).x" :y1="along(wall, op.offset).y"
                :x2="doorTip(wall, op).x" :y2="doorTip(wall, op).y"
                :stroke="palette.wall" :stroke-width="0.05"
              />
              <path :d="doorArc(wall, op)" fill="none" :stroke="palette.wall" :stroke-width="0.025" />
            </g>
            <g v-else>
              <line
                :x1="along(wall, op.offset).x" :y1="along(wall, op.offset).y"
                :x2="along(wall, op.offset + op.width).x" :y2="along(wall, op.offset + op.width).y"
                :stroke="palette.wall" :stroke-width="0.06"
              />
              <line
                v-for="s in [-1, 1]" :key="s"
                :x1="along(wall, op.offset).x + normal(wall).x * 0.07 * s" :y1="along(wall, op.offset).y + normal(wall).y * 0.07 * s"
                :x2="along(wall, op.offset + op.width).x + normal(wall).x * 0.07 * s" :y2="along(wall, op.offset + op.width).y + normal(wall).y * 0.07 * s"
                :stroke="palette.wall" :stroke-width="0.02"
              />
            </g>
          </g>
          <line
            v-if="isSelected('wall', wall.id)"
            :x1="wall.start.x" :y1="wall.start.y" :x2="wall.end.x" :y2="wall.end.y"
            :stroke="palette.accent" :stroke-width="wall.thickness + 0.1" opacity="0.4"
          />
          <text
            v-if="isSelected('wall', wall.id) || editor.tool === 'select'"
            v-show="isSelected('wall', wall.id)"
            :x="wallMid(wall).x + normal(wall).x * 0.45" :y="wallMid(wall).y + normal(wall).y * 0.45"
            text-anchor="middle"
            :fill="palette.accent"
            :font-size="0.3"
            font-family="Poppins, sans-serif"
          >{{ dist(wall.start, wall.end).toFixed(2) }} m</text>
        </g>

        <g v-if="editor.wallDraft.value">
          <line
            :x1="editor.wallDraft.value.start.x" :y1="editor.wallDraft.value.start.y"
            :x2="(editor.ghost.value ?? editor.wallDraft.value.start).x" :y2="(editor.ghost.value ?? editor.wallDraft.value.start).y"
            :stroke="palette.accent" :stroke-width="0.15" stroke-dasharray="0.2 0.12" opacity="0.8"
          />
          <text
            v-if="editor.ghost.value"
            :x="(editor.ghost.value.x + editor.wallDraft.value.start.x) / 2 + 0.3"
            :y="(editor.ghost.value.y + editor.wallDraft.value.start.y) / 2 - 0.3"
            :fill="palette.accent" :font-size="0.3"
            font-family="Poppins, sans-serif"
          >{{ dist(editor.wallDraft.value.start, editor.ghost.value).toFixed(2) }} m</text>
          <circle :cx="editor.wallDraft.value.start.x" :cy="editor.wallDraft.value.start.y" r="0.09" :fill="palette.accent" />
        </g>

        <rect
          v-if="editor.roomDraft.value"
          :x="Math.min(editor.roomDraft.value.a.x, editor.roomDraft.value.b.x)"
          :y="Math.min(editor.roomDraft.value.a.y, editor.roomDraft.value.b.y)"
          :width="Math.abs(editor.roomDraft.value.b.x - editor.roomDraft.value.a.x)"
          :height="Math.abs(editor.roomDraft.value.b.y - editor.roomDraft.value.a.y)"
          :fill="palette.room"
          :stroke="palette.accent"
          :stroke-width="0.05"
          stroke-dasharray="0.2 0.12"
        />

        <g
          v-for="f in plan.furniture"
          :key="f.id"
          :transform="`translate(${f.x} ${f.y}) rotate(${f.rotation})`"
          :style="{ color: isSelected('furniture', f.id) ? palette.accent : palette.furn }"
        >
          <g v-html="getFurnitureSymbol(f.symbol).svg(f.w, f.h)" />
        </g>

        <g v-if="editor.ghost.value && editor.tool !== 'select'">
          <line :x1="editor.ghost.value.x - 0.4" :y1="editor.ghost.value.y" :x2="editor.ghost.value.x + 0.4" :y2="editor.ghost.value.y" :stroke="palette.accent" :stroke-width="0.02" opacity="0.7" />
          <line :x1="editor.ghost.value.x" :y1="editor.ghost.value.y - 0.4" :x2="editor.ghost.value.x" :y2="editor.ghost.value.y + 0.4" :stroke="palette.accent" :stroke-width="0.02" opacity="0.7" />
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import type { Plan, Wall, Opening, Pt } from '~/composables/useStudioPlan'
import type { StudioEditor } from '~/composables/useStudioEditor'

const props = defineProps<{
  plan: Plan
  editor: StudioEditor
}>()

const containerEl = ref<HTMLElement | null>(null)
const svgEl = ref<SVGSVGElement | null>(null)
const size = ref({ w: 800, h: 600 })

const { isDark } = useThemeToggle()
const palette = computed(() => isDark.value
  ? {
      bg: '#081527',
      grid: 'rgba(255,255,255,0.05)',
      gridMajor: 'rgba(255,255,255,0.1)',
      wall: '#e8d9b0',
      text: '#f3ddaa',
      room: 'rgba(227,176,74,0.1)',
      roomStroke: 'rgba(227,176,74,0.35)',
      furn: '#9db8d6',
      accent: '#e3b04a'
    }
  : {
      bg: '#fbf9f5',
      grid: 'rgba(20,42,69,0.06)',
      gridMajor: 'rgba(20,42,69,0.13)',
      wall: '#142a45',
      text: '#142a45',
      room: 'rgba(212,160,23,0.08)',
      roomStroke: 'rgba(184,134,11,0.4)',
      furn: '#2a4d75',
      accent: '#b8860b'
    })

const gridLines = computed(() => {
  const { scale, x, y } = props.editor.view
  const x0 = (0 - x) / scale
  const x1 = (size.value.w - x) / scale
  const y0 = (0 - y) / scale
  const y1 = (size.value.h - y) / scale
  const step = scale >= 50 ? 0.5 : 1
  const lines: { key: string; x1: number; y1: number; x2: number; y2: number; major: boolean }[] = []
  if ((x1 - x0) / step > 300 || (y1 - y0) / step > 300) return lines
  for (let gx = Math.floor(x0 / step) * step; gx <= x1; gx += step) {
    lines.push({ key: `v${gx}`, x1: gx, y1: y0, x2: gx, y2: y1, major: Math.abs(gx % 1) < 0.001 })
  }
  for (let gy = Math.floor(y0 / step) * step; gy <= y1; gy += step) {
    lines.push({ key: `h${gy}`, x1: x0, y1: gy, x2: x1, y2: gy, major: Math.abs(gy % 1) < 0.001 })
  }
  return lines
})

function polyPoints(poly: Pt[]): string {
  return poly.map((p) => `${p.x},${p.y}`).join(' ')
}

function centroid(poly: Pt[]): Pt {
  const n = poly.length || 1
  return {
    x: poly.reduce((s, p) => s + p.x, 0) / n,
    y: poly.reduce((s, p) => s + p.y, 0) / n
  }
}

function isSelected(kind: string, id: string): boolean {
  const sel = props.editor.selection.value
  return sel?.kind === kind && sel.id === id
}

function wallSegments(wall: Wall): { a: Pt; b: Pt }[] {
  const len = dist(wall.start, wall.end)
  if (len === 0) return []
  const ops = props.plan.openings
    .filter((o) => o.wallId === wall.id)
    .sort((a, b) => a.offset - b.offset)
  const cuts: number[] = [0]
  ops.forEach((o) => cuts.push(Math.max(0, Math.min(len, o.offset)), Math.max(0, Math.min(len, o.offset + o.width))))
  cuts.push(len)
  const segs: { a: Pt; b: Pt }[] = []
  for (let i = 0; i < cuts.length - 1; i += 2) {
    const t0 = cuts[i]
    const t1 = cuts[i + 1]
    if (t1 - t0 < 0.01) continue
    segs.push({ a: along(wall, t0), b: along(wall, t1) })
  }
  return segs
}

function openingsOf(wall: Wall): Opening[] {
  return props.plan.openings.filter((o) => o.wallId === wall.id)
}

function along(wall: Wall, t: number): Pt {
  const len = dist(wall.start, wall.end) || 1
  const ux = (wall.end.x - wall.start.x) / len
  const uy = (wall.end.y - wall.start.y) / len
  return { x: wall.start.x + ux * t, y: wall.start.y + uy * t }
}

function normal(wall: Wall): Pt {
  const len = dist(wall.start, wall.end) || 1
  return { x: -(wall.end.y - wall.start.y) / len, y: (wall.end.x - wall.start.x) / len }
}

function doorTip(wall: Wall, op: Opening): Pt {
  const hinge = along(wall, op.offset)
  const n = normal(wall)
  return { x: hinge.x + n.x * op.width, y: hinge.y + n.y * op.width }
}

function doorArc(wall: Wall, op: Opening): string {
  const tip = doorTip(wall, op)
  const far = along(wall, op.offset + op.width)
  return `M ${tip.x} ${tip.y} A ${op.width} ${op.width} 0 0 1 ${far.x} ${far.y}`
}

function wallMid(wall: Wall): Pt {
  return { x: (wall.start.x + wall.end.x) / 2, y: (wall.start.y + wall.end.y) / 2 }
}

// ---- pointer handling ----
const pointers = new Map<number, Pt>()
let pinch: { d: number; center: Pt } | null = null
let lastScreen: Pt | null = null

function screenPt(e: PointerEvent | WheelEvent): Pt {
  const rect = svgEl.value!.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function onPointerDown(e: PointerEvent) {
  if (e.button === 1) e.preventDefault()
  try {
    svgEl.value?.setPointerCapture(e.pointerId)
  } catch { /* synthetic pointers can't be captured */ }
  const sp = screenPt(e)
  pointers.set(e.pointerId, sp)
  if (pointers.size === 2) {
    const [p1, p2] = [...pointers.values()]
    pinch = { d: dist(p1, p2), center: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 } }
    return
  }
  lastScreen = sp
  props.editor.beginPointer(props.editor.screenToWorld(sp), e.button)
}

function onPointerMove(e: PointerEvent) {
  const sp = screenPt(e)
  const tracked = pointers.has(e.pointerId)
  if (tracked) pointers.set(e.pointerId, sp)

  if (pinch && pointers.size >= 2) {
    const [p1, p2] = [...pointers.values()]
    const d = dist(p1, p2)
    const center = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
    if (pinch.d > 0) props.editor.zoomAt(center, d / pinch.d)
    props.editor.panBy(center.x - pinch.center.x, center.y - pinch.center.y)
    pinch = { d, center }
    return
  }

  if (tracked && props.editor.isPanning() && lastScreen) {
    props.editor.panBy(sp.x - lastScreen.x, sp.y - lastScreen.y)
  }
  lastScreen = tracked ? sp : lastScreen
  props.editor.movePointer(props.editor.screenToWorld(sp))
}

function onPointerUp(e: PointerEvent) {
  pointers.delete(e.pointerId)
  if (pointers.size < 2) pinch = null
  if (pointers.size === 0) {
    props.editor.endPointer()
    lastScreen = null
  }
}

onMounted(() => {
  const el = containerEl.value
  if (!el) return
  const measure = () => {
    size.value = { w: el.clientWidth, h: el.clientHeight }
  }
  measure()
  props.editor.fitView(size.value.w, size.value.h)
  new ResizeObserver(measure).observe(el)

  el.addEventListener('wheel', (e: WheelEvent) => {
    e.preventDefault()
    props.editor.zoomAt(screenPt(e), e.deltaY < 0 ? 1.12 : 0.9)
  }, { passive: false })
})

defineExpose({
  svgEl,
  fit: () => props.editor.fitView(size.value.w, size.value.h)
})
</script>
