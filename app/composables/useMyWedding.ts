import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe
} from 'firebase/firestore'
import { createDefaultContent, type FlowItem, type MenuItem, type VipScene, type WeddingContent, type WeddingDoc } from './useWeddingTypes'

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function useMyWedding(overrideId?: Ref<string | null | undefined>) {
  const { db, isConfigured } = useFirebase()
  const { currentUser } = useAuth()
  const toast = useToast()

  const wedding = ref<WeddingDoc | null>(null)
  const loading = ref(true)
  const saving = ref(false)

  let unsubscribe: Unsubscribe | null = null

  function stop() {
    unsubscribe?.()
    unsubscribe = null
  }

  function listen() {
    stop()
    if (!isConfigured || !db) {
      loading.value = false
      return
    }

    // Admin path: a specific wedding ID was supplied (e.g. from the
    // /admin/wedding/[id] route), so load exactly that document instead of
    // "whichever wedding the signed-in user owns". Firestore rules already
    // grant superadmins read/write on any wedding doc - see firestore.rules.
    if (overrideId?.value) {
      loading.value = true
      unsubscribe = onSnapshot(
        doc(db, 'weddings', overrideId.value),
        (snap) => {
          wedding.value = snap.exists() ? ({ id: snap.id, ...snap.data() } as WeddingDoc) : null
          loading.value = false
        },
        () => {
          loading.value = false
        }
      )
      return
    }

    if (!currentUser.value) {
      loading.value = false
      return
    }

    loading.value = true
    const weddingsQuery = query(collection(db, 'weddings'), where('ownerUid', '==', currentUser.value.uid))

    unsubscribe = onSnapshot(
      weddingsQuery,
      (snapshot) => {
        const first = snapshot.docs[0]
        wedding.value = first ? ({ id: first.id, ...first.data() } as WeddingDoc) : null
        loading.value = false
      },
      () => {
        loading.value = false
      }
    )
  }

  watch([currentUser, () => overrideId?.value], () => listen(), { immediate: true })
  onBeforeUnmount(stop)

  async function isSlugAvailable(slug: string) {
    if (!db) return false
    const slugDoc = await getDoc(doc(db, 'slugs', slug))
    return !slugDoc.exists()
  }

  async function createWedding(slug: string, brideName: string, groomName: string) {
    if (!db || !currentUser.value) throw new Error('You need to be signed in first')
    const cleanSlug = slugify(slug)
    if (!cleanSlug) throw new Error('Please choose a valid link name')

    // Pull in whatever "shared template" admin has configured (Platform
    // Admin > Starter Defaults) - falls back to the plain hardcoded
    // defaults if the catalog hasn't loaded yet or nothing's been set.
    const { ensureCatalogLoaded, starterDefaults } = useThemes()
    await ensureCatalogLoaded()
    const defaults = starterDefaults.value

    const weddingRef = doc(collection(db, 'weddings'))
    const slugRef = doc(db, 'slugs', cleanSlug)

    await runTransaction(db, async (transaction) => {
      const existingSlug = await transaction.get(slugRef)
      if (existingSlug.exists()) {
        throw new Error('That link name is already taken \u2014 try another one')
      }

      transaction.set(slugRef, { weddingId: weddingRef.id })
      transaction.set(weddingRef, {
        ownerUid: currentUser.value!.uid,
        slug: cleanSlug,
        themeId: 'timeless-gold',
        plan: 'free',
        paymentStatus: 'unpaid',
        status: 'draft',
        content: {
          ...createDefaultContent(brideName, groomName),
          story: defaults.story,
          enablePetals: defaults.enablePetals,
          petalStyle: defaults.petalStyle,
          ornamentStyle: defaults.ornamentStyle,
          textWeight: defaults.textWeight,
          btnDetails: defaults.btnDetails,
          btnRsvp: defaults.btnRsvp
        },
        flow: defaults.flow.map((item, index) => ({ id: `starter-${index}`, ...item })),
        vipEnabled: false,
        vipScenes: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    })

    return weddingRef.id
  }

  async function updateContent(partial: Partial<WeddingContent>) {
    if (!db || !wedding.value) return
    saving.value = true
    try {
      await updateDoc(doc(db, 'weddings', wedding.value.id), {
        content: { ...wedding.value.content, ...partial },
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not save changes', color: 'error' })
      throw error
    } finally {
      saving.value = false
    }
  }

  async function updateSlug(newSlug: string) {
    if (!db || !wedding.value || !currentUser.value) throw new Error('You need to be signed in first')
    const cleanSlug = slugify(newSlug)
    if (!cleanSlug) throw new Error('Please choose a valid link name')
    if (cleanSlug === wedding.value.slug) return

    const weddingId = wedding.value.id
    const slugRef = doc(db, 'slugs', cleanSlug)
    const weddingRef = doc(db, 'weddings', weddingId)

    saving.value = true
    try {
      await runTransaction(db, async (transaction) => {
        const existingSlug = await transaction.get(slugRef)
        if (existingSlug.exists()) {
          throw new Error('That link name is already taken \u2014 try another one')
        }
        // Firestore rules don't allow deleting the old slugs/{slug} doc, so it's
        // left in place rather than removed - it'll keep quietly pointing to
        // this same wedding, which means any link already shared with the old
        // name keeps working instead of breaking.
        transaction.set(slugRef, { weddingId })
        transaction.update(weddingRef, { slug: cleanSlug, updatedAt: serverTimestamp() })
      })
    } finally {
      saving.value = false
    }
  }

  async function updateTheme(themeId: string) {
    if (!db || !wedding.value) return
    saving.value = true
    try {
      await updateDoc(doc(db, 'weddings', wedding.value.id), { themeId, updatedAt: serverTimestamp() })
    } finally {
      saving.value = false
    }
  }

  async function updateFlow(flow: FlowItem[]) {
    if (!db || !wedding.value) return
    saving.value = true
    try {
      await updateDoc(doc(db, 'weddings', wedding.value.id), { flow, updatedAt: serverTimestamp() })
    } finally {
      saving.value = false
    }
  }

  // Mirrors updateFlow() exactly - the Wedding Menu items live in their own
  // top-level array (like `flow`) rather than inside `content`, so they can
  // be saved independently from the rest of the Design Studio form.
  async function updateMenu(menu: MenuItem[]) {
    if (!db || !wedding.value) return
    saving.value = true
    try {
      await updateDoc(doc(db, 'weddings', wedding.value.id), { menu, updatedAt: serverTimestamp() })
    } finally {
      saving.value = false
    }
  }

  async function updateVip(enabled: boolean, scenes: VipScene[]) {
    if (!db || !wedding.value) return
    saving.value = true
    try {
      await updateDoc(doc(db, 'weddings', wedding.value.id), {
        vipEnabled: enabled,
        vipScenes: scenes,
        updatedAt: serverTimestamp()
      })
    } finally {
      saving.value = false
    }
  }

  async function setPublished(published: boolean) {
    if (!db || !wedding.value) return
    await updateDoc(doc(db, 'weddings', wedding.value.id), {
      status: published ? 'published' : 'draft',
      updatedAt: serverTimestamp()
    })
  }

  // A photo of the wedding's own venue, used as a fixed backdrop behind the
  // whole VIP Cinematic fly-through - see vipBackgroundImageUrl on
  // WeddingDoc and VipCinematicInvite.vue. Separate from updateVip() so the
  // Wedding Details page can save it without needing the couple's scenes.
  async function updateVipBackground(url: string) {
    if (!db || !wedding.value) return
    saving.value = true
    try {
      await updateDoc(doc(db, 'weddings', wedding.value.id), {
        vipBackgroundImageUrl: url,
        updatedAt: serverTimestamp()
      })
    } finally {
      saving.value = false
    }
  }

  return {
    wedding,
    loading,
    saving,
    isConfigured,
    isSlugAvailable,
    createWedding,
    updateContent,
    updateSlug,
    updateTheme,
    updateFlow,
    updateMenu,
    updateVip,
    updateVipBackground,
    setPublished
  }
}