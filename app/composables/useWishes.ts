import { collection, limit, onSnapshot, orderBy, query, type Unsubscribe } from 'firebase/firestore'

export interface Wish {
  id: string
  name: string
  doa: string
  submittedAt: string
}

/**
 * Streams the most recent public well-wishes for a given wedding in real
 * time. Wishes live in weddings/{weddingId}/wishes \u2014 a public-readable
 * subset written alongside the private weddings/{weddingId}/guests entry so
 * the full guest list (dietary needs, phone numbers, guest counts) never has
 * to be publicly readable.
 */
export function useWishes(weddingId: string, maxCount = 9) {
  const { db, isConfigured } = useFirebase()
  const wishes = ref<Wish[]>([])
  const loading = ref(isConfigured)
  let unsubscribe: Unsubscribe | null = null

  onMounted(() => {
    if (!isConfigured || !db || !weddingId) {
      loading.value = false
      return
    }

    const wishesQuery = query(
      collection(db, 'weddings', weddingId, 'wishes'),
      orderBy('submittedAt', 'desc'),
      limit(maxCount)
    )

    unsubscribe = onSnapshot(
      wishesQuery,
      (snapshot) => {
        wishes.value = snapshot.docs.map((doc) => {
          const data = doc.data() as Record<string, unknown>
          return {
            id: doc.id,
            name: typeof data.name === 'string' ? data.name : 'Anonymous',
            doa: typeof data.doa === 'string' ? data.doa : '',
            submittedAt: typeof data.submittedAt === 'string' ? data.submittedAt : ''
          }
        })
        loading.value = false
      },
      () => {
        loading.value = false
      }
    )
  })

  onBeforeUnmount(() => {
    unsubscribe?.()
  })

  return { wishes, loading, isConfigured }
}
