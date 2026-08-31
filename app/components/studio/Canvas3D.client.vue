<template>
  <div ref="hostEl" class="w-full h-full" />
</template>

<script setup lang="ts">
import type { Plan, Wall, Opening } from '~/composables/useStudioPlan'

const props = defineProps<{ plan: Plan }>()
const { isDark } = useThemeToggle()

const hostEl = ref<HTMLElement | null>(null)

let dispose: (() => void) | null = null

async function buildScene() {
  if (!hostEl.value) return
  dispose?.()

  const THREE = await import('three')
  const { OrbitControls } = await import('three/addons/controls/OrbitControls.js')

  const host = hostEl.value
  const width = host.clientWidth || 800
  const height = host.clientHeight || 600

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(isDark.value ? 0x081527 : 0xfbf9f5)

  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 500)
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true })
  } catch (err) {
    console.error('3D unavailable:', err)
    host.innerHTML = '<div style="display:flex;height:100%;align-items:center;justify-content:center;font-size:0.875rem;opacity:0.6">3D preview needs WebGL, which this browser doesn\'t have.</div>'
    return
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height)
  host.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.maxPolarAngle = Math.PI / 2 - 0.05
  controls.minDistance = 2
  controls.maxDistance = 60

  scene.add(new THREE.AmbientLight(0xffffff, 0.9))
  const sun = new THREE.DirectionalLight(0xfff2d0, 1.6)
  sun.position.set(8, 14, 6)
  scene.add(sun)

  const world = new THREE.Group()
  scene.add(world)

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xe9dfc8, roughness: 0.9 })
  const floorMat = new THREE.MeshStandardMaterial({ color: isDark.value ? 0x27415f : 0xe8d9b0, roughness: 1 })
  const groundMat = new THREE.MeshStandardMaterial({ color: isDark.value ? 0x0d1e33 : 0xefe9dd, roughness: 1 })

  const FURN_COLORS: Record<string, number> = {
    'bed-double': 0x7c9cc4, 'bed-single': 0x8fb0d4, sofa: 0xb0836d, table: 0xa3805c,
    chair: 0x8a6f52, toilet: 0xd8dde2, sink: 0xcfd8de, bathtub: 0xdde5ea,
    stove: 0x6b7280, fridge: 0x9aa5b1, wardrobe: 0x96755a, plant: 0x6da06f
  }
  const FURN_HEIGHT: Record<string, number> = {
    'bed-double': 0.5, 'bed-single': 0.5, sofa: 0.75, table: 0.75, chair: 0.9,
    toilet: 0.75, sink: 0.85, bathtub: 0.55, stove: 0.9, fridge: 1.8, wardrobe: 2.0, plant: 1.2
  }

  const DOOR_HEAD = 2.1
  const SILL = 0.9

  function wallAngle(w: Wall) {
    return Math.atan2(w.end.y - w.start.y, w.end.x - w.start.x)
  }

  function addBox(len: number, h: number, thick: number, x: number, y: number, z: number, angle: number, mat: THREE.Material) {
    if (len <= 0.01 || h <= 0.01) return
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(len, h, thick), mat)
    mesh.position.set(x, y, z)
    mesh.rotation.y = -angle
    world.add(mesh)
  }

  function buildWall(w: Wall) {
    const len = Math.hypot(w.end.x - w.start.x, w.end.y - w.start.y)
    if (len === 0) return
    const angle = wallAngle(w)
    const ux = Math.cos(angle)
    const uy = Math.sin(angle)
    const ops = props.plan.openings.filter((o: Opening) => o.wallId === w.id).sort((a: Opening, b: Opening) => a.offset - b.offset)

    let cursor = 0
    const place = (t0: number, t1: number, y0: number, y1: number) => {
      const mid = (t0 + t1) / 2
      addBox(t1 - t0, y1 - y0, w.thickness, w.start.x + ux * mid, (y0 + y1) / 2, w.start.y + uy * mid, angle, wallMat)
    }

    for (const op of ops) {
      const o0 = Math.max(cursor, Math.min(len, op.offset))
      const o1 = Math.max(o0, Math.min(len, op.offset + op.width))
      place(cursor, o0, 0, w.height)
      if (op.type === 'door') {
        place(o0, o1, DOOR_HEAD, w.height)
      } else {
        place(o0, o1, 0, SILL)
        place(o0, o1, DOOR_HEAD, w.height)
      }
      cursor = o1
    }
    place(cursor, len, 0, w.height)
  }

  // ground slab under everything
  const allPts: { x: number; y: number }[] = []
  props.plan.walls.forEach((w) => allPts.push(w.start, w.end))
  props.plan.rooms.forEach((r) => allPts.push(...r.polygon))
  if (allPts.length > 0) {
    const minX = Math.min(...allPts.map((p) => p.x)) - 1.5
    const maxX = Math.max(...allPts.map((p) => p.x)) + 1.5
    const minY = Math.min(...allPts.map((p) => p.y)) - 1.5
    const maxY = Math.max(...allPts.map((p) => p.y)) + 1.5
    const ground = new THREE.Mesh(new THREE.BoxGeometry(maxX - minX, 0.1, maxY - minY), groundMat)
    ground.position.set((minX + maxX) / 2, -0.06, (minY + maxY) / 2)
    world.add(ground)

    const grid = new THREE.GridHelper(Math.max(maxX - minX, maxY - minY), Math.round(Math.max(maxX - minX, maxY - minY)), 0x8899aa, 0x445566)
    ;(grid.material as THREE.Material).transparent = true
    ;(grid.material as THREE.Material).opacity = 0.25
    grid.position.set((minX + maxX) / 2, -0.005, (minY + maxY) / 2)
    world.add(grid)
  }

  props.plan.rooms.forEach((room) => {
    if (room.polygon.length < 3) return
    const shape = new THREE.Shape(room.polygon.map((p) => new THREE.Vector2(p.x, -p.y)))
    const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), floorMat)
    mesh.rotation.x = Math.PI / 2
    mesh.position.y = 0.02
    world.add(mesh)
  })

  props.plan.walls.forEach(buildWall)

  props.plan.furniture.forEach((f) => {
    const h = FURN_HEIGHT[f.symbol] ?? 0.7
    const color = FURN_COLORS[f.symbol] ?? 0x999999
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(f.w, h, f.h), mat)
    mesh.position.set(f.x, h / 2, f.y)
    mesh.rotation.y = -(f.rotation * Math.PI) / 180
    world.add(mesh)
  })

  // camera framing
  if (allPts.length > 0) {
    const cx = allPts.reduce((s, p) => s + p.x, 0) / allPts.length
    const cy = allPts.reduce((s, p) => s + p.y, 0) / allPts.length
    const spread = Math.max(6, ...allPts.map((p) => Math.hypot(p.x - cx, p.y - cy) * 2.2))
    controls.target.set(cx, 1, cy)
    camera.position.set(cx + spread * 0.7, spread * 0.6, cy + spread * 0.7)
  } else {
    controls.target.set(0, 0, 0)
    camera.position.set(6, 5, 6)
  }
  controls.update()

  let raf = 0
  const loop = () => {
    raf = requestAnimationFrame(loop)
    controls.update()
    renderer.render(scene, camera)
  }
  loop()

  const ro = new ResizeObserver(() => {
    const w = host.clientWidth
    const h = host.clientHeight
    if (w === 0 || h === 0) return
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  })
  ro.observe(host)

  dispose = () => {
    cancelAnimationFrame(raf)
    ro.disconnect()
    controls.dispose()
    renderer.dispose()
    host.removeChild(renderer.domElement)
  }
}

let rebuildTimer: ReturnType<typeof setTimeout> | undefined
watch(
  () => props.plan,
  () => {
    clearTimeout(rebuildTimer)
    rebuildTimer = setTimeout(() => buildScene(), 300)
  },
  { deep: true }
)
watch(isDark, () => buildScene())

onMounted(() => buildScene().catch((err) => console.error('3D build failed:', err)))
onBeforeUnmount(() => dispose?.())
</script>
