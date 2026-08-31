<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="stat-card">
        <p class="stat-label">Pending</p>
        <p class="stat-number text-amber-300">{{ pendingCount }}</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">In production</p>
        <p class="stat-number text-gold-200">{{ inProductionCount }}</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">Shipped / delivered</p>
        <p class="stat-number text-emerald-300">{{ shippedCount }}</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">Total value</p>
        <p class="stat-number text-white">RM {{ totalValue }}</p>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      <UInput v-model="search" icon="i-heroicons-magnifying-glass" placeholder="Search by couple or recipient..." size="lg" class="max-w-sm" />
      <div class="flex flex-wrap bg-gray-900 border border-gray-700 rounded-full p-1 gap-0.5 w-fit">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
          :class="filter === tab.id ? 'bg-gold-500/15 text-gold-200' : 'hover:bg-gray-800 hover:text-white text-gray-400'"
          @click="filter = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center text-white/50 py-16">Loading...</div>
    <div v-else-if="filteredOrders.length === 0" class="empty-state">
      <div class="p-4 rounded-full bg-white/5 ring-1 ring-white/10">
        <UIcon name="i-heroicons-square-3-stack-3d" class="w-7 h-7" style="color: rgba(227, 176, 74, 0.5);" />
      </div>
      <p class="text-white/50 text-sm">No physical card orders match this filter.</p>
    </div>
    <div v-else class="space-y-2">
      <div v-for="order in filteredOrders" :key="order.id" class="order-row">
        <div class="min-w-0 flex-1">
          <p class="font-medium truncate flex items-center gap-2 flex-wrap">
            {{ order.coupleName }}
            <UBadge color="neutral" variant="subtle" size="sm">{{ order.tierLabel }} · {{ order.quantity }} pcs</UBadge>
          </p>
          <p class="text-xs text-white/50 truncate mt-0.5">
            Ships to {{ order.shippingName || '—' }}<span v-if="order.shippingCity"> · {{ order.shippingCity }}</span><span v-if="order.shippingPhone"> · {{ order.shippingPhone }}</span>
          </p>
          <p v-if="order.notes" class="text-xs text-white/40 italic truncate mt-0.5">"{{ order.notes }}"</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap shrink-0">
          <span class="text-sm text-gold-300 font-medium">RM {{ order.totalAmount }}</span>
          <USelect
            :model-value="order.status"
            :items="STATUS_OPTIONS"
            size="xs"
            class="w-40"
            :loading="updatingId === order.id"
            @update:model-value="(value) => setStatus(order, value as PhysicalOrderStatus)"
          />
          <UButton
            size="xs"
            variant="soft"
            color="neutral"
            icon="i-heroicons-arrow-top-right-on-square"
            :to="`/admin/wedding/${order.weddingId}/physical-cards`"
            target="_blank"
            external
          >
            Open
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { collection, collectionGroup, doc, getDocs, updateDoc } from 'firebase/firestore'
import type { WeddingDoc } from '~/composables/useWeddingTypes'
import type { PhysicalOrderStatus } from '~/composables/usePhysicalOrders'

// Physical orders live under weddings/{id}/physicalOrders (same subcollection
// shape as billingRequests), so seeing every order across every wedding at
// once needs a collectionGroup query rather than the single getDocs used
// for a flat top-level collection elsewhere (e.g. AdminWeddingsList.vue).
// Each order's owning wedding is read off its own document reference
// (doc.ref.parent.parent) rather than trusting a redundant weddingId field,
// so this can't drift out of sync with where the doc actually lives.
const { db, isConfigured } = useFirebase()
const toast = useToast()

interface OrderRow {
  id: string
  weddingId: string
  coupleName: string
  tierLabel: string
  quantity: number
  totalAmount: number
  shippingName: string
  shippingPhone: string
  shippingCity: string
  notes: string
  status: PhysicalOrderStatus
  createdAt: string
}

const STATUS_OPTIONS: { label: string; value: PhysicalOrderStatus }[] = [
  { label: 'Pending review', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'In production', value: 'in_production' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' }
]

const orders = ref<OrderRow[]>([])
const loading = ref(true)
const search = ref('')
const updatingId = ref<string | null>(null)

type FilterTab = 'pending' | 'in_production' | 'shipped' | 'all'
const filter = ref<FilterTab>('pending')
const tabs: { id: FilterTab; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'in_production', label: 'In production' },
  { id: 'shipped', label: 'Shipped/Delivered' },
  { id: 'all', label: 'All' }
]

// Bug fix: the original version of this function ran both reads through a
// single Promise.all and a single catch block, so any failure surfaced as
// the same generic "check your superadmin role" toast regardless of which
// query actually failed or why (wrong Firestore project, rules not yet
// published, a genuine role problem, network error, etc). Fetching them
// separately - and putting the real Firebase error code/message from
// whichever one throws into the toast - turns "it doesn't work" into an
// actual diagnosis without needing to open devtools.
async function loadOrders() {
  if (!isConfigured || !db) {
    loading.value = false
    return
  }
  loading.value = true

  const coupleNameById = new Map<string, string>()
  try {
    const weddingsSnap = await getDocs(collection(db, 'weddings'))
    weddingsSnap.docs.forEach((d) => {
      const w = d.data() as WeddingDoc
      coupleNameById.set(d.id, `${w.content?.brideName || 'Bride'} & ${w.content?.groomName || 'Groom'}`)
    })
  } catch (error) {
    console.error('[AdminPhysicalOrders] failed to load weddings', error)
    const detail = (error as { code?: string; message?: string })?.code || (error as Error)?.message || 'unknown error'
    toast.add({ title: 'Could not load couples list', description: `Reading weddings failed: ${detail}`, color: 'error' })
    loading.value = false
    return
  }

  try {
    const ordersSnap = await getDocs(collectionGroup(db, 'physicalOrders'))
    orders.value = ordersSnap.docs
      .map((d) => {
        const weddingId = d.ref.parent.parent?.id || ''
        const data = d.data() as Record<string, unknown>
        const status = STATUS_OPTIONS.some((s) => s.value === data.status) ? (data.status as PhysicalOrderStatus) : 'pending'
        return {
          id: d.id,
          weddingId,
          coupleName: coupleNameById.get(weddingId) || 'Unknown couple',
          tierLabel: String(data.tierLabel ?? ''),
          quantity: Number(data.quantity ?? 0),
          totalAmount: Number(data.totalAmount ?? 0),
          shippingName: String(data.shippingName ?? ''),
          shippingPhone: String(data.shippingPhone ?? ''),
          shippingCity: String(data.shippingCity ?? ''),
          notes: String(data.notes ?? ''),
          status,
          createdAt: String(data.createdAt ?? '')
        } satisfies OrderRow
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  } catch (error) {
    console.error('[AdminPhysicalOrders] failed to load physicalOrders', error)
    const detail = (error as { code?: string; message?: string })?.code || (error as Error)?.message || 'unknown error'
    toast.add({ title: 'Could not load physical card orders', description: `Firestore said: ${detail}`, color: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(loadOrders)

const pendingCount = computed(() => orders.value.filter((o) => o.status === 'pending').length)
const inProductionCount = computed(() => orders.value.filter((o) => o.status === 'confirmed' || o.status === 'in_production').length)
const shippedCount = computed(() => orders.value.filter((o) => o.status === 'shipped' || o.status === 'delivered').length)
const totalValue = computed(() => orders.value.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.totalAmount, 0))

const filteredOrders = computed(() => {
  const q = search.value.trim().toLowerCase()
  return orders.value.filter((o) => {
    if (filter.value === 'pending' && o.status !== 'pending') return false
    if (filter.value === 'in_production' && o.status !== 'confirmed' && o.status !== 'in_production') return false
    if (filter.value === 'shipped' && o.status !== 'shipped' && o.status !== 'delivered') return false
    if (!q) return true
    return [o.coupleName, o.shippingName].some((field) => field?.toLowerCase().includes(q))
  })
})

async function setStatus(order: OrderRow, status: PhysicalOrderStatus) {
  if (!db || !order.weddingId) return
  updatingId.value = order.id
  try {
    await updateDoc(doc(db, 'weddings', order.weddingId, 'physicalOrders', order.id), { status })
    const target = orders.value.find((o) => o.id === order.id)
    if (target) target.status = status
    toast.add({ title: 'Order status updated', color: 'success' })
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Could not update status', color: 'error' })
  } finally {
    updatingId.value = null
  }
}
</script>

<style scoped>
.stat-card {
  border-radius: 1rem;
  padding: 1.1rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(212, 160, 23, 0.2);
}

.stat-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.55);
}

.stat-number {
  margin-top: 0.25rem;
  font-size: 1.85rem;
  font-weight: 700;
}

.order-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1.1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  flex-wrap: wrap;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.order-row:hover {
  border-color: rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.035);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  border-radius: 1rem;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.015);
}
</style>
