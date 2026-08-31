import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc, type Unsubscribe } from 'firebase/firestore'
import type { GuestDoc } from './useWeddingTypes'

export function useGuests(weddingIdSource: string | Ref<string | undefined> | (() => string | undefined)) {
  const { db, isConfigured } = useFirebase()
  const toast = useToast()

  const guests = ref<GuestDoc[]>([])
  const loading = ref(true)
  let unsubscribe: Unsubscribe | null = null

  function stop() {
    unsubscribe?.()
    unsubscribe = null
  }

  function listen(weddingId: string | undefined) {
    stop()
    if (!isConfigured || !db || !weddingId) {
      guests.value = []
      loading.value = false
      return
    }

    loading.value = true
    const guestsQuery = query(collection(db, 'weddings', weddingId, 'guests'), orderBy('submittedAt', 'desc'))
    unsubscribe = onSnapshot(
      guestsQuery,
      (snapshot) => {
        guests.value = snapshot.docs.map((d) => {
          const data = d.data() as Record<string, unknown>
          return {
            id: d.id,
            name: String(data.name ?? ''),
            tier: (data.tier === 'vip' ? 'vip' : 'general') as 'vip' | 'general',
            phone: String(data.phone ?? ''),
            attending: (data.attending as 'Yes' | 'No' | '') ?? '',
            guestCount: Number(data.guestCount ?? 0),
            specialSeating: Boolean(data.specialSeating),
            dietary: String(data.dietary ?? ''),
            doa: String(data.doa ?? ''),
            tableAssignment: String(data.tableAssignment ?? ''),
            submittedAt: String(data.submittedAt ?? '')
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

  const totalInvited = computed(() => guests.value.length)
  const totalResponded = computed(() => guests.value.filter((g) => g.attending).length)
  const totalAttending = computed(() => guests.value.filter((g) => g.attending === 'Yes').length)
  const totalNotAttending = computed(() => guests.value.filter((g) => g.attending === 'No').length)
  const totalGuestCount = computed(() =>
    guests.value.filter((g) => g.attending === 'Yes').reduce((sum, g) => sum + (g.guestCount || 0), 0)
  )

  async function addGuest(input: { name: string; phone: string; tier: 'vip' | 'general' }) {
    const weddingId = currentWeddingId.value
    if (!db || !weddingId) return
    await addDoc(collection(db, 'weddings', weddingId, 'guests'), {
      name: input.name.trim(),
      phone: input.phone.trim(),
      tier: input.tier,
      attending: '',
      guestCount: 0,
      specialSeating: false,
      dietary: '',
      doa: '',
      tableAssignment: '',
      submittedAt: new Date().toISOString(),
      invited: true
    })
    toast.add({ title: 'Guest added', color: 'success' })
  }

  // CSV import: one write batch so a large list lands quickly.
  async function addGuestsBulk(rows: { name: string; phone: string; tier: 'vip' | 'general' }[]) {
    const weddingId = currentWeddingId.value
    if (!db || !weddingId || rows.length === 0) return 0
    const { writeBatch, doc: fdoc } = await import('firebase/firestore')
    const batch = writeBatch(db)
    for (const row of rows) {
      batch.set(fdoc(collection(db, 'weddings', weddingId, 'guests')), {
        name: row.name.trim(),
        phone: row.phone.trim(),
        tier: row.tier,
        attending: '',
        guestCount: 0,
        specialSeating: false,
        dietary: '',
        doa: '',
        tableAssignment: '',
        submittedAt: new Date().toISOString(),
        invited: true
      })
    }
    await batch.commit()
    toast.add({ title: `${rows.length} guests imported`, color: 'success' })
    return rows.length
  }

  async function updateGuestTier(guestId: string, tier: 'vip' | 'general') {
    const weddingId = currentWeddingId.value
    if (!db || !weddingId) return
    await updateDoc(doc(db, 'weddings', weddingId, 'guests', guestId), { tier })
  }

  // Full edit - lets a couple correct a typo'd name/phone, or manually
  // record an RSVP that came in offline (a phone call, a message, in
  // person) instead of through the live RSVP form.
  async function updateGuest(guestId: string, partial: Partial<Omit<GuestDoc, 'id'>>) {
    const weddingId = currentWeddingId.value
    if (!db || !weddingId) return
    await updateDoc(doc(db, 'weddings', weddingId, 'guests', guestId), { ...partial })
    toast.add({ title: 'Guest updated', color: 'success' })
  }

  async function removeGuest(guestId: string) {
    const weddingId = currentWeddingId.value
    if (!db || !weddingId) return
    await deleteDoc(doc(db, 'weddings', weddingId, 'guests', guestId))
    // Best-effort: a guest and their wish share the same document id (see
    // rsvp.vue's submitForm()), so this also clears them off the public
    // Wishes Wall instead of leaving a deleted guest's wish behind forever.
    // A guest with no wish, or one submitted before this id-linking existed,
    // simply has nothing at that path - deleteDoc() on a path with no
    // document is not an error, so this is safe to always attempt.
    deleteDoc(doc(db, 'weddings', weddingId, 'wishes', guestId)).catch(() => {})
    toast.add({ title: 'Guest removed', color: 'neutral' })
  }

  function personalizedLink(guest: GuestDoc, siteUrl: string, slug: string) {
    // gid = this guest's own document id, so rsvp.vue's submitForm() can
    // update THIS guest's existing record when they submit, instead of
    // creating a brand-new guest doc alongside the one already added here
    // - previously the link only carried the guest's name, so any guest
    // who was manually added and then RSVP'd through their own shared link
    // ended up duplicated everywhere (dashboard guest list, and every
    // Drive-synced CSV/PDF/XLSX export). Links already shared before this
    // fix only carry ?to=name with no gid and will keep creating a new
    // guest on submit - only newly generated/shared links get the fix.
    return `${siteUrl}/w/${slug}?to=${encodeURIComponent(guest.name)}&gid=${encodeURIComponent(guest.id)}`
  }

  function whatsappLink(
    guest: GuestDoc,
    siteUrl: string,
    slug: string,
    content?: { shareMessage?: string; brideName?: string; groomName?: string; dateLabel?: string }
  ) {
    const inviteUrl = personalizedLink(guest, siteUrl, slug)
    const template = content?.shareMessage || "Dear {guestName}, you're invited to {brideName} & {groomName}'s wedding! {date}. RSVP here: {link}"
    const message = buildShareMessage(template, {
      guestName: guest.name,
      brideName: content?.brideName || '',
      groomName: content?.groomName || '',
      date: content?.dateLabel,
      link: inviteUrl
    })
    const phone = guest.phone.replace(/[^0-9]/g, '')
    return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : `https://wa.me/?text=${encodeURIComponent(message)}`
  }

  // Same columns as exportCSV() below, plus each guest's own personalized
  // invite link and a ready-to-tap WhatsApp send link - meant to be handed
  // straight to the couple so THEY can send invites out themselves,
  // without ever opening this dashboard (see the "Guest Links" panel in
  // DashboardGuestsPanel.vue). Kept as a separate function rather than
  // extending exportCSV() so the plain operational backup export never
  // changes shape.
  function exportGuestLinksCSV(
    siteUrl: string,
    slug: string,
    content?: { shareMessage?: string; brideName?: string; groomName?: string; dateLabel?: string },
    filename = 'guest-links.csv'
  ) {
    const header = ['Name', 'Tier', 'Phone', 'RSVP Status', 'Personalized Invite Link', 'WhatsApp Send Link']
    const rows = guests.value.map((g) => [
      g.name,
      g.tier,
      g.phone,
      g.attending || 'No response yet',
      personalizedLink(g, siteUrl, slug),
      whatsappLink(g, siteUrl, slug, content)
    ])
    const escapeCell = (cell: string) => `"${cell.replace(/"/g, '""')}"`
    const csv = [header, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  function exportCSV(filename = 'guests.csv') {
    const header = ['Name', 'Tier', 'Phone', 'Attending', 'Guests', 'Special Seating', 'Dietary Needs', 'Blessings', 'Submitted At']
    const rows = guests.value.map((g) => [
      g.name,
      g.tier,
      g.phone,
      g.attending || 'No response yet',
      String(g.guestCount),
      g.specialSeating ? 'Yes' : 'No',
      g.dietary,
      g.doa.replace(/\n/g, ' '),
      g.submittedAt
    ])
    const escapeCell = (cell: string) => `"${cell.replace(/"/g, '""')}"`
    const csv = [header, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  return {
    guests,
    loading,
    totalInvited,
    totalResponded,
    totalAttending,
    totalNotAttending,
    totalGuestCount,
    addGuest,
    addGuestsBulk,
    updateGuestTier,
    updateGuest,
    removeGuest,
    whatsappLink,
    personalizedLink,
    exportCSV,
    exportGuestLinksCSV
  }
}