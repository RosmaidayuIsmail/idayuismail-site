import { doc, getDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore'
import type { WeddingDoc } from './useWeddingTypes'

export function useWeddingBySlug(slug: string) {
  const { db, isConfigured } = useFirebase()

  const wedding = ref<WeddingDoc | null>(null)
  const loading = ref(true)
  const notFound = ref(false)

  let unsubscribe: Unsubscribe | null = null

  onMounted(async () => {
    if (!isConfigured || !db) {
      loading.value = false
      notFound.value = true
      return
    }

    try {
      const slugSnap = await getDoc(doc(db, 'slugs', slug))
      if (!slugSnap.exists()) {
        notFound.value = true
        loading.value = false
        return
      }

      const weddingId = (slugSnap.data() as { weddingId: string }).weddingId

      unsubscribe = onSnapshot(
        doc(db, 'weddings', weddingId),
        (snap) => {
          if (!snap.exists()) {
            notFound.value = true
          } else {
            wedding.value = { id: snap.id, ...snap.data() } as WeddingDoc
          }
          loading.value = false
        },
        () => {
          notFound.value = true
          loading.value = false
        }
      )
    } catch {
      notFound.value = true
      loading.value = false
    }
  })

  onBeforeUnmount(() => unsubscribe?.())

  return { wedding, loading, notFound }
}
