import { addDoc, collection, onSnapshot, orderBy, query, type Unsubscribe } from 'firebase/firestore'

export type BillingRequestStatus = 'pending' | 'approved' | 'declined'

export interface BillingRequest {
  id: string
  plan: 'premium'
  /** The premium theme the couple is most interested in - optional, just
   * helps whoever follows up know what they're after. Upgrading always
   * unlocks every premium theme, not just this one. */
  themeId: string
  themeName: string
  /** The theme's listed price at the time of the request - informational
   * only, since no payment has actually been taken yet. The final amount
   * is confirmed when the team follows up. */
  estimatedAmount: number
  note: string
  status: BillingRequestStatus
  createdAt: string
}

/**
 * Streams a couple's own upgrade/payment requests in real time from
 * weddings/{weddingId}/billingRequests, and lets them submit a new one.
 *
 * There's no live payment gateway wired up yet (see DashboardBillingPanel.vue) -
 * this is the "paper trail" half of billing: a couple can ask to be
 * upgraded and see the status of that ask, while the actual plan flip
 * (wedding.plan / wedding.paymentStatus) still has to be done by an admin
 * once payment is actually arranged and received.
 */
export function useBillingRequests(weddingIdSource: string | Ref<string | undefined> | (() => string | undefined)) {
  const { db, isConfigured } = useFirebase()
  const toast = useToast()

  const requests = ref<BillingRequest[]>([])
  const loading = ref(true)
  let unsubscribe: Unsubscribe | null = null

  function stop() {
    unsubscribe?.()
    unsubscribe = null
  }

  function listen(weddingId: string | undefined) {
    stop()
    if (!isConfigured || !db || !weddingId) {
      requests.value = []
      loading.value = false
      return
    }

    loading.value = true
    const requestsQuery = query(collection(db, 'weddings', weddingId, 'billingRequests'), orderBy('createdAt', 'desc'))
    unsubscribe = onSnapshot(
      requestsQuery,
      (snapshot) => {
        requests.value = snapshot.docs.map((d) => {
          const data = d.data() as Record<string, unknown>
          return {
            id: d.id,
            plan: 'premium',
            themeId: String(data.themeId ?? ''),
            themeName: String(data.themeName ?? ''),
            estimatedAmount: Number(data.estimatedAmount ?? 0),
            note: String(data.note ?? ''),
            status: (data.status === 'approved' || data.status === 'declined' ? data.status : 'pending') as BillingRequestStatus,
            createdAt: String(data.createdAt ?? '')
          }
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

  const pendingRequest = computed(() => requests.value.find((r) => r.status === 'pending') || null)

  async function submitUpgradeRequest(input: { themeId?: string; themeName?: string; estimatedAmount: number; note?: string }) {
    const weddingId = currentWeddingId.value
    if (!db || !weddingId) {
      toast.add({ title: 'Firebase is not configured', color: 'warning' })
      return
    }
    await addDoc(collection(db, 'weddings', weddingId, 'billingRequests'), {
      plan: 'premium',
      themeId: input.themeId || '',
      themeName: input.themeName || '',
      estimatedAmount: input.estimatedAmount,
      note: (input.note || '').trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    })
    toast.add({ title: 'Upgrade request sent', description: "We'll be in touch to arrange payment.", color: 'success' })
  }

  return {
    requests,
    loading,
    pendingRequest,
    submitUpgradeRequest
  }
}
