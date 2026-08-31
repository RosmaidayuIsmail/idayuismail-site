import { addDoc, collection, onSnapshot, orderBy, query, type Unsubscribe } from 'firebase/firestore'

export type PhysicalCardTier = 'flat' | 'fold' | 'lace'

export type PhysicalOrderStatus = 'pending' | 'confirmed' | 'in_production' | 'shipped' | 'delivered' | 'cancelled'

export interface PhysicalOrder {
  id: string
  tier: PhysicalCardTier
  tierLabel: string
  quantity: number
  /** The per-order total at the time it was placed - informational only,
   * like BillingRequest.estimatedAmount, since no payment is taken here. */
  totalAmount: number
  envelopeColor: string
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  shippingCity: string
  shippingPostcode: string
  shippingState: string
  notes: string
  status: PhysicalOrderStatus
  createdAt: string
}

const VALID_STATUSES: PhysicalOrderStatus[] = ['pending', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled']

/**
 * Streams a couple's own physical card orders in real time from
 * weddings/{weddingId}/physicalOrders, and lets them submit a new one.
 *
 * Mirrors useBillingRequests.ts exactly: there's no live payment gateway or
 * print-vendor integration wired up yet, so this is the "paper trail" half
 * of ordering a physical card - a couple submits what they want and sees
 * its status, while fulfillment (confirming the order, sending it to
 * production, shipping it) is handled by an admin from AdminPhysicalOrders.
 */
export function usePhysicalOrders(weddingIdSource: string | Ref<string | undefined> | (() => string | undefined)) {
  const { db, isConfigured } = useFirebase()
  const toast = useToast()

  const orders = ref<PhysicalOrder[]>([])
  const loading = ref(true)
  let unsubscribe: Unsubscribe | null = null

  function stop() {
    unsubscribe?.()
    unsubscribe = null
  }

  function listen(weddingId: string | undefined) {
    stop()
    if (!isConfigured || !db || !weddingId) {
      orders.value = []
      loading.value = false
      return
    }

    loading.value = true
    const ordersQuery = query(collection(db, 'weddings', weddingId, 'physicalOrders'), orderBy('createdAt', 'desc'))
    unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        orders.value = snapshot.docs.map((d) => {
          const data = d.data() as Record<string, unknown>
          const tier = data.tier === 'fold' || data.tier === 'lace' ? data.tier : 'flat'
          return {
            id: d.id,
            tier,
            tierLabel: String(data.tierLabel ?? ''),
            quantity: Number(data.quantity ?? 0),
            totalAmount: Number(data.totalAmount ?? 0),
            envelopeColor: String(data.envelopeColor ?? ''),
            shippingName: String(data.shippingName ?? ''),
            shippingPhone: String(data.shippingPhone ?? ''),
            shippingAddress: String(data.shippingAddress ?? ''),
            shippingCity: String(data.shippingCity ?? ''),
            shippingPostcode: String(data.shippingPostcode ?? ''),
            shippingState: String(data.shippingState ?? ''),
            notes: String(data.notes ?? ''),
            status: (VALID_STATUSES.includes(data.status as PhysicalOrderStatus) ? data.status : 'pending') as PhysicalOrderStatus,
            createdAt: String(data.createdAt ?? '')
          } satisfies PhysicalOrder
        })
        loading.value = false
      },
      () => {
        loading.value = false
      }
    )
  }

  watch(
    () => (typeof weddingIdSource === 'function' ? weddingIdSource() : unref(weddingIdSource)),
    (weddingId) => listen(weddingId),
    { immediate: true }
  )

  onBeforeUnmount(stop)

  const currentWeddingId = computed(() => (typeof weddingIdSource === 'function' ? weddingIdSource() : unref(weddingIdSource)))

  const pendingOrder = computed(() => orders.value.find((o) => o.status === 'pending') || null)

  async function submitOrder(input: {
    tier: PhysicalCardTier
    tierLabel: string
    quantity: number
    totalAmount: number
    envelopeColor?: string
    shippingName: string
    shippingPhone: string
    shippingAddress: string
    shippingCity: string
    shippingPostcode: string
    shippingState: string
    notes?: string
  }) {
    const weddingId = currentWeddingId.value
    if (!db || !weddingId) {
      toast.add({ title: 'Firebase is not configured', color: 'warning' })
      return
    }
    await addDoc(collection(db, 'weddings', weddingId, 'physicalOrders'), {
      tier: input.tier,
      tierLabel: input.tierLabel,
      quantity: input.quantity,
      totalAmount: input.totalAmount,
      envelopeColor: (input.envelopeColor || '').trim(),
      shippingName: input.shippingName.trim(),
      shippingPhone: input.shippingPhone.trim(),
      shippingAddress: input.shippingAddress.trim(),
      shippingCity: input.shippingCity.trim(),
      shippingPostcode: input.shippingPostcode.trim(),
      shippingState: input.shippingState.trim(),
      notes: (input.notes || '').trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    })
    toast.add({ title: 'Order sent', description: "We'll be in touch to confirm details and arrange payment.", color: 'success' })
  }

  return {
    orders,
    loading,
    pendingOrder,
    submitOrder
  }
}
