import { collection, onSnapshot, orderBy, query, type Unsubscribe } from 'firebase/firestore'

export interface PaymentRecord {
  id: string
  themeName: string
  amountCents: number
  status: 'created' | 'paid' | 'failed'
  paidAt: string | null
  createdAt: string
}

/**
 * Streams a couple's own ToyyibPay payment records in real time from
 * weddings/{weddingId}/payments (owner read is allowed by firestore.rules;
 * writes are server-only). Mirrors useBillingRequests' listen/stop shape.
 */
export function usePayments(weddingIdSource: string | Ref<string | undefined> | (() => string | undefined)) {
  const { db, isConfigured } = useFirebase()

  const payments = ref<PaymentRecord[]>([])
  const loading = ref(true)
  let unsubscribe: Unsubscribe | null = null

  function stop() {
    unsubscribe?.()
    unsubscribe = null
  }

  function listen(weddingId: string | undefined) {
    stop()
    if (!isConfigured || !db || !weddingId) {
      payments.value = []
      loading.value = false
      return
    }

    loading.value = true
    const paymentsQuery = query(collection(db, 'weddings', weddingId, 'payments'), orderBy('createdAt', 'desc'))
    unsubscribe = onSnapshot(
      paymentsQuery,
      (snapshot) => {
        payments.value = snapshot.docs.map((d) => {
          const data = d.data() as Record<string, unknown>
          const rawStatus = data.status
          return {
            id: d.id,
            themeName: String(data.themeName ?? ''),
            amountCents: Number(data.amountCents ?? 0),
            status: (rawStatus === 'paid' || rawStatus === 'failed' ? rawStatus : 'created') as PaymentRecord['status'],
            paidAt: typeof data.paidAt === 'string' ? data.paidAt : null,
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

  return { payments, loading }
}
