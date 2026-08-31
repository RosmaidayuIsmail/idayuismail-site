import type { Plan, Pt, Opening } from './useStudioPlan'

export type Tool = 'select' | 'wall' | 'room' | 'door' | 'window' | 'furniture'
export type Selection = { kind: 'wall' | 'opening' | 'room' | 'furniture'; id: string } | null

export const SNAP = 0.1

export function snap(v: number): number {
  return Math.round(v / SNAP) * SNAP
}

export function dist(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function distToSegment(p: Pt, a: Pt, b: Pt): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return dist(p, a)
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))
}

export function pointInPolygon(p: Pt, poly: Pt[]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y
    const xj = poly[j].x, yj = poly[j].y
    if (yi > p.y !== yj > p.y && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

export function polygonArea(poly: Pt[]): number {
  let s = 0
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    s += (poly[j].x + poly[i].x) * (poly[j].y - poly[i].y)
  }
  return Math.abs(s / 2)
}

type DragMode = 'none' | 'drag-item' | 'pan' | 'room-drag'

export function useStudioEditor(plan: Ref<Plan>) {
  const tool = ref<Tool>('select')
  const selection = ref<Selection>(null)
  const furnitureSymbol = ref('sofa')
  const wallDraft = ref<{ start: Pt } | null>(null)
  const roomDraft = ref<{ a: Pt; b: Pt } | null>(null)
  const ghost = ref<Pt | null>(null)
  const view = reactive({ scale: 40, x: 0, y: 0 })

  const undoStack: string[] = []
  const undoDepth = ref(0)
  const canUndo = computed(() => undoDepth.value > 0)

  let mode: DragMode = 'none'
  let dragStart: Pt = { x: 0, y: 0 }
  let dragOriginal: string = ''

  function snapshot() {
    const p = plan.value
    undoStack.push(JSON.stringify([p.walls, p.openings, p.rooms, p.furniture]))
    if (undoStack.length > 50) undoStack.shift()
    undoDepth.value = undoStack.length
  }

  function undo() {
    const s = undoStack.pop()
    undoDepth.value = undoStack.length
    if (!s) return
    const [walls, openings, rooms, furniture] = JSON.parse(s)
    plan.value.walls = walls
    plan.value.openings = openings
    plan.value.rooms = rooms
    plan.value.furniture = furniture
    selection.value = null
  }

  function setTool(t: Tool) {
    tool.value = t
    wallDraft.value = null
    roomDraft.value = null
    if (t !== 'select') selection.value = null
  }

  function screenToWorld(pt: Pt): Pt {
    return { x: (pt.x - view.x) / view.scale, y: (pt.y - view.y) / view.scale }
  }

  function zoomAt(screenPt: Pt, factor: number) {
    const w = screenToWorld(screenPt)
    const next = Math.min(200, Math.max(8, view.scale * factor))
    view.x = screenPt.x - w.x * next
    view.y = screenPt.y - w.y * next
    view.scale = next
  }

  function panBy(dx: number, dy: number) {
    view.x += dx
    view.y += dy
  }

  function planBounds() {
    const pts: Pt[] = []
    plan.value.walls.forEach((w) => pts.push(w.start, w.end))
    plan.value.rooms.forEach((r) => pts.push(...r.polygon))
    plan.value.furniture.forEach((f) => pts.push({ x: f.x, y: f.y }))
    if (pts.length === 0) return { minX: -5, minY: -4, maxX: 5, maxY: 4 }
    return {
      minX: Math.min(...pts.map((p) => p.x)) - 1,
      minY: Math.min(...pts.map((p) => p.y)) - 1,
      maxX: Math.max(...pts.map((p) => p.x)) + 1,
      maxY: Math.max(...pts.map((p) => p.y)) + 1
    }
  }

  function fitView(screenW: number, screenH: number) {
    const b = planBounds()
    const bw = Math.max(2, b.maxX - b.minX)
    const bh = Math.max(2, b.maxY - b.minY)
    view.scale = Math.min(120, Math.max(12, Math.min(screenW / bw, screenH / bh)))
    view.x = screenW / 2 - ((b.minX + b.maxX) / 2) * view.scale
    view.y = screenH / 2 - ((b.minY + b.maxY) / 2) * view.scale
  }

  // Snaps to the 0.1m grid, and to perfect horizontal/vertical from an anchor.
  function smartSnap(p: Pt, anchor?: Pt): Pt {
    let x = snap(p.x)
    let y = snap(p.y)
    if (anchor) {
      if (Math.abs(x - anchor.x) < 0.2) x = anchor.x
      if (Math.abs(y - anchor.y) < 0.2) y = anchor.y
    }
    return { x, y }
  }

  function nearestWall(p: Pt, maxDist: number) {
    let best: { wall: Plan['walls'][number]; d: number } | null = null
    for (const w of plan.value.walls) {
      const d = distToSegment(p, w.start, w.end)
      if (d < maxDist && (!best || d < best.d)) best = { wall: w, d }
    }
    return best
  }

  function hitTest(p: Pt): Selection {
    for (let i = plan.value.furniture.length - 1; i >= 0; i--) {
      const f = plan.value.furniture[i]
      const rad = (-f.rotation * Math.PI) / 180
      const dx = p.x - f.x
      const dy = p.y - f.y
      const lx = dx * Math.cos(rad) - dy * Math.sin(rad)
      const ly = dx * Math.sin(rad) + dy * Math.cos(rad)
      if (Math.abs(lx) <= f.w / 2 + 0.05 && Math.abs(ly) <= f.h / 2 + 0.05) {
        return { kind: 'furniture', id: f.id }
      }
    }
    for (const o of plan.value.openings) {
      const wall = plan.value.walls.find((w) => w.id === o.wallId)
      if (!wall) continue
      const len = dist(wall.start, wall.end)
      if (len === 0) continue
      const t = ((p.x - wall.start.x) * (wall.end.x - wall.start.x) + (p.y - wall.start.y) * (wall.end.y - wall.start.y)) / (len * len)
      const along = t * len
      if (along >= o.offset - 0.15 && along <= o.offset + o.width + 0.15 && distToSegment(p, wall.start, wall.end) < 0.3) {
        return { kind: 'opening', id: o.id }
      }
    }
    const wallHit = nearestWall(p, 0.25)
    if (wallHit) return { kind: 'wall', id: wallHit.wall.id }
    for (let i = plan.value.rooms.length - 1; i >= 0; i--) {
      if (pointInPolygon(p, plan.value.rooms[i].polygon)) return { kind: 'room', id: plan.value.rooms[i].id }
    }
    return null
  }

  function beginPointer(worldPt: Pt, button: number) {
    if (button === 1) {
      mode = 'pan'
      dragStart = worldPt
      return
    }
    const p = worldPt
    if (tool.value === 'wall') {
      if (!wallDraft.value) {
        wallDraft.value = { start: smartSnap(p) }
      } else {
        const end = smartSnap(p, wallDraft.value.start)
        if (dist(wallDraft.value.start, end) > 0.05) {
          snapshot()
          plan.value.walls.push({
            id: newStudioId(),
            start: { ...wallDraft.value.start },
            end,
            thickness: 0.15,
            height: 2.8
          })
          wallDraft.value = { start: end }
        }
      }
      return
    }
    if (tool.value === 'room') {
      const s = smartSnap(p)
      roomDraft.value = { a: s, b: s }
      mode = 'room-drag'
      return
    }
    if (tool.value === 'door' || tool.value === 'window') {
      const hit = nearestWall(p, 0.6)
      if (!hit) return
      const wall = hit.wall
      const len = dist(wall.start, wall.end)
      if (len < 0.4) return
      const width = tool.value === 'door' ? 0.9 : 1.2
      const t = ((p.x - wall.start.x) * (wall.end.x - wall.start.x) + (p.y - wall.start.y) * (wall.end.y - wall.start.y)) / (len * len)
      let offset = snap(t * len - width / 2)
      offset = Math.max(0.1, Math.min(len - width - 0.1, offset))
      snapshot()
      const opening: Opening = { id: newStudioId(), wallId: wall.id, offset, width, type: tool.value }
      plan.value.openings.push(opening)
      selection.value = { kind: 'opening', id: opening.id }
      return
    }
    if (tool.value === 'furniture') {
      const def = getFurnitureSymbol(furnitureSymbol.value)
      snapshot()
      const item = { id: newStudioId(), symbol: def.id, x: snap(p.x), y: snap(p.y), rotation: 0, w: def.w, h: def.h }
      plan.value.furniture.push(item)
      selection.value = { kind: 'furniture', id: item.id }
      return
    }
    // select tool
    const hit = hitTest(p)
    selection.value = hit
    if (hit) {
      snapshot()
      mode = 'drag-item'
      dragStart = p
      dragOriginal = JSON.stringify([plan.value.walls, plan.value.openings, plan.value.rooms, plan.value.furniture])
    } else {
      mode = 'pan'
      dragStart = p
    }
  }

  function movePointer(worldPt: Pt) {
    ghost.value = worldPt
    if (mode === 'pan') {
      // pan uses screen deltas; Canvas2D handles it via panBy - nothing here
      return
    }
    if (mode === 'room-drag' && roomDraft.value) {
      roomDraft.value.b = smartSnap(worldPt, roomDraft.value.a)
      return
    }
    if (mode === 'drag-item' && selection.value) {
      const dx = snap(worldPt.x - dragStart.x)
      const dy = snap(worldPt.y - dragStart.y)
      const [walls, openings, rooms, furniture] = JSON.parse(dragOriginal)
      const sel = selection.value
      if (sel.kind === 'furniture') {
        const orig = furniture.find((f: Plan['furniture'][number]) => f.id === sel.id)
        const cur = plan.value.furniture.find((f) => f.id === sel.id)
        if (orig && cur) {
          cur.x = snap(orig.x + dx)
          cur.y = snap(orig.y + dy)
        }
      } else if (sel.kind === 'wall') {
        const orig = walls.find((w: Plan['walls'][number]) => w.id === sel.id)
        const cur = plan.value.walls.find((w) => w.id === sel.id)
        if (orig && cur) {
          cur.start = { x: snap(orig.start.x + dx), y: snap(orig.start.y + dy) }
          cur.end = { x: snap(orig.end.x + dx), y: snap(orig.end.y + dy) }
        }
      } else if (sel.kind === 'room') {
        const orig = rooms.find((r: Plan['rooms'][number]) => r.id === sel.id)
        const cur = plan.value.rooms.find((r) => r.id === sel.id)
        if (orig && cur) {
          cur.polygon = orig.polygon.map((pt: Pt) => ({ x: snap(pt.x + dx), y: snap(pt.y + dy) }))
        }
      } else if (sel.kind === 'opening') {
        const orig = openings.find((o: Plan['openings'][number]) => o.id === sel.id)
        const cur = plan.value.openings.find((o) => o.id === sel.id)
        const wall = plan.value.walls.find((w) => w.id === cur?.wallId)
        if (orig && cur && wall) {
          const len = dist(wall.start, wall.end)
          const ux = (wall.end.x - wall.start.x) / len
          const uy = (wall.end.y - wall.start.y) / len
          const proj = dx * ux + dy * uy
          cur.offset = Math.max(0.1, Math.min(len - cur.width - 0.1, snap(orig.offset + proj)))
        }
      }
      return
    }
    // idle hover: keep a snapped ghost for wall/room tools
    if (tool.value === 'wall' && wallDraft.value) {
      ghost.value = smartSnap(worldPt, wallDraft.value.start)
    } else if (tool.value !== 'select') {
      ghost.value = smartSnap(worldPt)
    }
  }

  function endPointer() {
    if (mode === 'room-drag' && roomDraft.value) {
      const { a, b } = roomDraft.value
      const w = Math.abs(b.x - a.x)
      const h = Math.abs(b.y - a.y)
      if (w >= 0.3 && h >= 0.3) {
        snapshot()
        plan.value.rooms.push({
          id: newStudioId(),
          polygon: [
            { x: a.x, y: a.y },
            { x: b.x, y: a.y },
            { x: b.x, y: b.y },
            { x: a.x, y: b.y }
          ],
          label: `Room ${plan.value.rooms.length + 1}`
        })
      }
      roomDraft.value = null
    }
    mode = 'none'
  }

  function endWallChain() {
    wallDraft.value = null
  }

  function deleteSelection() {
    if (!selection.value) return
    snapshot()
    const sel = selection.value
    if (sel.kind === 'wall') {
      plan.value.walls = plan.value.walls.filter((w) => w.id !== sel.id)
      plan.value.openings = plan.value.openings.filter((o) => o.wallId !== sel.id)
    } else if (sel.kind === 'opening') {
      plan.value.openings = plan.value.openings.filter((o) => o.id !== sel.id)
    } else if (sel.kind === 'room') {
      plan.value.rooms = plan.value.rooms.filter((r) => r.id !== sel.id)
    } else {
      plan.value.furniture = plan.value.furniture.filter((f) => f.id !== sel.id)
    }
    selection.value = null
  }

  function rotateSelection() {
    if (selection.value?.kind !== 'furniture') return
    snapshot()
    const f = plan.value.furniture.find((x) => x.id === selection.value!.id)
    if (f) f.rotation = (f.rotation + 90) % 360
  }

  function clearAll() {
    wallDraft.value = null
    roomDraft.value = null
    selection.value = null
    mode = 'none'
  }

  return {
    tool, selection, furnitureSymbol, wallDraft, roomDraft, ghost, view,
    canUndo,
    setTool, undo, snapshot,
    screenToWorld, zoomAt, panBy, fitView, planBounds,
    beginPointer, movePointer, endPointer,
    endWallChain, deleteSelection, rotateSelection, clearAll,
    isPanning: () => mode === 'pan'
  }
}

export type StudioEditor = ReturnType<typeof useStudioEditor>
