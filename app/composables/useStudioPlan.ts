export interface Pt {
  x: number
  y: number
}

export interface Wall {
  id: string
  start: Pt
  end: Pt
  thickness: number
  height: number
}

export interface Opening {
  id: string
  wallId: string
  offset: number
  width: number
  type: 'door' | 'window'
}

export interface Room {
  id: string
  polygon: Pt[]
  label: string
}

export interface Furniture {
  id: string
  symbol: string
  x: number
  y: number
  rotation: number
  w: number
  h: number
}

export interface Plan {
  id: string
  name: string
  updatedAt: number
  walls: Wall[]
  openings: Opening[]
  rooms: Room[]
  furniture: Furniture[]
  thumbnail?: string
}

const STORAGE_KEY = 'idayu:studio:plans'

export function newStudioId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function emptyPlan(name = 'My Home'): Plan {
  return {
    id: newStudioId(),
    name,
    updatedAt: Date.now(),
    walls: [],
    openings: [],
    rooms: [],
    furniture: []
  }
}

export function useStudioPlan() {
  const plans = useState<Plan[]>('studio-plans', () => [])
  const loaded = useState('studio-plans-loaded', () => false)

  function load() {
    if (loaded.value || import.meta.server) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) plans.value = JSON.parse(raw) as Plan[]
    } catch {
      plans.value = []
    }
    loaded.value = true
  }

  function persist() {
    if (import.meta.server) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans.value))
    } catch {
      // localStorage full (huge thumbnails) - drop oldest thumbnails and retry once
      plans.value.slice(2).forEach((p) => { delete p.thumbnail })
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(plans.value))
      } catch { /* give up silently; plans stay in memory */ }
    }
  }

  function createPlan(name?: string): Plan {
    const plan = emptyPlan(name)
    plans.value.unshift(plan)
    persist()
    return plan
  }

  function getPlan(id: string): Plan | null {
    return plans.value.find((p) => p.id === id) ?? null
  }

  function patchPlan(id: string, patch: Partial<Plan>) {
    const plan = plans.value.find((p) => p.id === id)
    if (!plan) return
    Object.assign(plan, patch, { updatedAt: Date.now() })
    persist()
  }

  function deletePlan(id: string) {
    plans.value = plans.value.filter((p) => p.id !== id)
    persist()
  }

  function duplicatePlan(id: string): Plan | null {
    const src = getPlan(id)
    if (!src) return null
    const copy = JSON.parse(JSON.stringify(src)) as Plan
    copy.id = newStudioId()
    copy.name = `${src.name} copy`
    copy.updatedAt = Date.now()
    plans.value.unshift(copy)
    persist()
    return copy
  }

  load()

  return { plans, createPlan, getPlan, patchPlan, deletePlan, duplicatePlan, persist }
}
