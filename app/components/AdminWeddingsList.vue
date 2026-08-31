<template>
    <div class="space-y-6">
      <!-- Admin's own, single, wide Google Drive connection - separate from
           any couple's own per-wedding connection. Every wedding's guest
           list (legacy self-serve accounts and ones created here in Admin
           alike) auto-syncs into a "RSVP Lists" folder in THIS Drive, one
           subfolder per wedding, any time a guest RSVPs. See
           useAdminGoogleDrive.ts and server/utils/guest-sync.ts. -->
      <div class="form-card space-y-3">
        <div class="flex flex-wrap items-center gap-3">
          <UIcon name="i-heroicons-cloud-arrow-up" class="w-5 h-5 text-gold-300 shrink-0" />
          <div class="min-w-[220px]">
            <h2 class="font-display text-lg">RSVP Lists (your Google Drive)</h2>
            <p class="text-xs text-white/50 mt-0.5">
              <template v-if="adminDriveConnected">
                Connected as <span class="text-white/80">{{ adminDriveEmail }}</span> - every wedding's guest list auto-syncs into your "RSVP Lists" folder whenever a guest RSVPs.
              </template>
              <template v-else>Connect your own Google Drive to automatically collect every wedding's guest list - new and existing - into one "RSVP Lists" folder here, updated whenever a guest RSVPs.</template>
            </p>
          </div>
          <div class="ml-auto flex flex-wrap gap-2">
            <UButton v-if="adminDriveFolderLink" :to="adminDriveFolderLink" target="_blank" external size="sm" color="neutral" variant="ghost" icon="i-heroicons-arrow-top-right-on-square" class="rounded-full px-4">Open folder</UButton>
            <UButton v-if="adminDriveConnected" size="sm" color="error" variant="ghost" class="rounded-full px-4" @click="disconnectAdminDrive">Disconnect</UButton>
            <UButton v-else size="sm" color="neutral" variant="soft" icon="i-heroicons-link" class="rounded-full px-4" :loading="adminDriveConnecting" @click="connectAdminDrive">Connect Google Drive</UButton>
          </div>
        </div>
      </div>

      <div class="form-card space-y-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-arrow-path-rounded-square" class="w-5 h-5 text-gold-300" />
          <h2 class="font-display text-lg">Apply platform template to existing weddings</h2>
        </div>
        <div class="text-sm text-white/50 space-y-3">
          <p>
            In plain terms: this is a one-time "catch-up" tool, not an ongoing sync. Most admin changes (themes, fonts, RSVP/Day Flow language presets, Guest List labels, Custom Code) already reach every wedding live, automatically, the instant you save them - this tool has nothing to do with those and you never need it for them.
          </p>
          <p>
            This tool exists only for the handful of settings that get copied onto a wedding once, the moment it's created (from Starter Defaults - story text, buttons, petals, ornament, starter flow). If the app gains a brand-new field like that after a wedding already exists, that older wedding's document simply won't have it at all - not set to a default, just genuinely absent. That's the only situation this fixes.
          </p>
          <p>
            <strong class="text-white/70">Example:</strong> say next month you add a new "hashtag banner" toggle to Starter Defaults. Every wedding created after that automatically gets it. But a wedding created last year has no idea that field exists - it's simply missing from that document. Clicking "Check for missing fields" finds documents like that; "Apply to existing weddings" fills in ONLY the missing field, using today's Starter Defaults as the fallback value.
          </p>
          <p>
            <strong class="text-white/70">What it will never do:</strong> touch a field a couple already has - even if their value happens to match an old default. Their own design, wording, and choices are never overwritten, only genuinely blank slots get filled in.
          </p>
        </div>

        <div v-if="migrationResult" class="result-box">
          Scanned {{ migrationResult.weddingsScanned }} weddings &middot; updated {{ migrationResult.weddingsUpdated }} &middot; backfilled {{ migrationResult.fieldsBackfilled }} field(s).
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <UButton variant="soft" color="neutral" icon="i-heroicons-magnifying-glass" :loading="checking" @click="checkMissing">Check for missing fields</UButton>
          <template v-if="missingCount !== null">
            <span v-if="missingCount === 0" class="text-sm text-emerald-400">Nothing missing - every wedding already has every field.</span>
            <template v-else>
              <span class="text-sm text-gold-200">{{ missingCount }} field(s) missing across all weddings.</span>
              <UButton color="primary" icon="i-heroicons-check" :loading="applying" @click="applyDefaults">Apply to existing weddings</UButton>
            </template>
          </template>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="stat-card">
          <p class="stat-label">Total Weddings</p>
          <p class="stat-number">{{ weddings.length }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Published</p>
          <p class="stat-number text-emerald-300">{{ publishedCount }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Premium Plan</p>
          <p class="stat-number text-gold-200">{{ premiumCount }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Drafts</p>
          <p class="stat-number text-white/60">{{ weddings.length - publishedCount }}</p>
        </div>
      </div>
  
      <div class="flex flex-wrap items-center justify-between gap-3">
        <UInput v-model="search" icon="i-heroicons-magnifying-glass" placeholder="Search by names or link name..." size="lg" class="max-w-sm" />
        <UButton color="primary" icon="i-heroicons-plus" @click="openNewWeddingModal">New Wedding</UButton>
      </div>
  
      <div v-if="loading" class="text-center text-white/50 py-16">Loading...</div>
      <div v-else-if="filteredWeddings.length === 0" class="empty-state">
        <div class="p-4 rounded-full bg-white/5 ring-1 ring-white/10">
          <UIcon name="i-heroicons-magnifying-glass" class="w-7 h-7" style="color: rgba(227, 176, 74, 0.5);" />
        </div>
        <p class="text-white/50 text-sm">No weddings found.</p>
      </div>
      <div v-else class="space-y-2">
        <div v-for="w in filteredWeddings" :key="w.id" class="wedding-row">
          <div>
            <p class="font-medium">{{ w.content.brideName || '\u2014' }} &amp; {{ w.content.groomName || '\u2014' }}</p>
            <p class="text-xs text-white/50">/w/{{ w.slug }}</p>
          </div>
          <div class="flex items-center gap-2">
            <UBadge v-if="w.ownerUid === currentUser?.uid" color="warning" variant="subtle">Yours</UBadge>
            <UBadge :color="w.status === 'published' ? 'success' : 'neutral'" variant="subtle">{{ w.status }}</UBadge>
            <UBadge :color="w.plan === 'premium' ? 'primary' : 'neutral'" variant="subtle">{{ w.plan }}</UBadge>
            <UButton size="xs" variant="soft" color="primary" icon="i-heroicons-pencil-square" :to="`/admin/wedding/${w.id}`">
              Manage
            </UButton>
            <UButton size="xs" variant="soft" color="neutral" icon="i-heroicons-arrow-top-right-on-square" :to="`/w/${w.slug}`" target="_blank" external>
              View
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Sign-up is closed platform-wide now (see firestore.rules:
         weddings/create requires isSuperAdmin()) - this is the only way a
         new wedding gets created. The customer never signs up or logs in;
         everything is built and managed for them here. -->
    <UModal v-model:open="newWeddingModalOpen" title="Create a new wedding">
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-white/60">
            Creates a fresh wedding, ready to open straight in the editor. The customer never needs an account - you set everything up for them here.
          </p>
          <UFormField label="Bride's name">
            <UInput v-model="newWeddingForm.brideName" placeholder="e.g. Aisyah" size="lg" class="w-full" />
          </UFormField>
          <UFormField label="Groom's name">
            <UInput v-model="newWeddingForm.groomName" placeholder="e.g. Danial" size="lg" class="w-full" />
          </UFormField>
          <UFormField label="Link name (their invitation URL - /w/...)">
            <UInput v-model="newWeddingForm.slug" placeholder="e.g. aisyah-danial" size="lg" class="w-full" />
          </UFormField>
          <p v-if="newWeddingError" class="text-sm text-red-400">{{ newWeddingError }}</p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton variant="ghost" color="neutral" @click="newWeddingModalOpen = false">Cancel</UButton>
          <UButton color="primary" :loading="creatingWedding" @click="submitNewWedding">Create wedding</UButton>
        </div>
      </template>
    </UModal>
  </template>
  
  <script setup lang="ts">
  import { collection, getDocs } from 'firebase/firestore'
  import type { WeddingDoc } from '~/composables/useWeddingTypes'
  
  const { db, isConfigured } = useFirebase()
  const toast = useToast()
  const { previewMissingCount, applyPlatformDefaultsToExistingWeddings } = useAdminMigrations()
  const { currentUser } = useAuthState()
  const { createWedding } = useMyWedding()
  const router = useRouter()

  // --- Admin's own Google Drive connection (see useAdminGoogleDrive.ts) ---
  const {
    connected: adminDriveConnected,
    driveEmail: adminDriveEmail,
    folderLink: adminDriveFolderLink,
    connecting: adminDriveConnecting,
    refreshStatus: refreshAdminDriveStatus,
    connect: connectAdminDrive,
    disconnect: disconnectAdminDrive
  } = useAdminGoogleDrive()

  onMounted(() => {
    refreshAdminDriveStatus()

    // After Google redirects back from the OAuth consent screen (see
    // server/api/drive/callback.get.ts), show what happened and clean the
    // ?drive= query param off the URL so a page refresh doesn't re-show it.
    const route = useRoute()
    const status = route.query.drive as string | undefined
    if (!status) return
    const messages: Record<string, { title: string; color: 'success' | 'error' | 'neutral' }> = {
      connected: { title: 'Google Drive connected', color: 'success' },
      error: { title: 'Could not connect Google Drive', color: 'error' },
      cancelled: { title: 'Google Drive connection cancelled', color: 'neutral' },
      expired: { title: 'That connection attempt expired - please try again', color: 'error' }
    }
    const info = messages[status]
    if (info) toast.add({ title: info.title, color: info.color })
    refreshAdminDriveStatus()
    router.replace({ query: { ...route.query, drive: undefined } })
  })

  const weddings = ref<WeddingDoc[]>([])
  const loading = ref(true)
  const search = ref('')

  const checking = ref(false)
  const applying = ref(false)
  const missingCount = ref<number | null>(null)
  const migrationResult = ref<{ weddingsScanned: number; weddingsUpdated: number; fieldsBackfilled: number } | null>(null)

  async function checkMissing() {
    checking.value = true
    try {
      missingCount.value = await previewMissingCount()
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not check for missing fields', color: 'error' })
    } finally {
      checking.value = false
    }
  }

  async function applyDefaults() {
    if (missingCount.value === null || missingCount.value === 0) return
    const ok = confirm(`This will backfill ${missingCount.value} missing field(s) across your weddings, using current Starter Defaults for anything genuinely missing. It will NOT change any field a couple already has. Continue?`)
    if (!ok) return
    applying.value = true
    try {
      migrationResult.value = await applyPlatformDefaultsToExistingWeddings()
      missingCount.value = 0
      toast.add({ title: 'Platform template applied', description: `${migrationResult.value.weddingsUpdated} wedding(s) updated.`, color: 'success' })
      await loadWeddings()
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not apply platform template', color: 'error' })
    } finally {
      applying.value = false
    }
  }
  
  const newWeddingModalOpen = ref(false)
  const newWeddingForm = reactive({ brideName: '', groomName: '', slug: '' })
  const newWeddingError = ref('')
  const creatingWedding = ref(false)

  function openNewWeddingModal() {
    newWeddingForm.brideName = ''
    newWeddingForm.groomName = ''
    newWeddingForm.slug = ''
    newWeddingError.value = ''
    newWeddingModalOpen.value = true
  }

  async function submitNewWedding() {
    newWeddingError.value = ''
    if (!newWeddingForm.brideName.trim() || !newWeddingForm.groomName.trim() || !newWeddingForm.slug.trim()) {
      newWeddingError.value = 'Please fill in both names and a link name.'
      return
    }
    creatingWedding.value = true
    try {
      const id = await createWedding(newWeddingForm.slug, newWeddingForm.brideName.trim(), newWeddingForm.groomName.trim())
      newWeddingModalOpen.value = false
      toast.add({ title: 'Wedding created', description: `${newWeddingForm.brideName} & ${newWeddingForm.groomName} is ready to edit.`, color: 'success' })
      await router.push(`/admin/wedding/${id}`)
    } catch (error: unknown) {
      newWeddingError.value = error instanceof Error ? error.message : 'Could not create the wedding.'
    } finally {
      creatingWedding.value = false
    }
  }

  async function loadWeddings() {
    if (!isConfigured || !db) {
      loading.value = false
      return
    }
    loading.value = true
    try {
      const snapshot = await getDocs(collection(db, 'weddings'))
      weddings.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as WeddingDoc)
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not load weddings', description: 'Check that your account has the superadmin role in Firestore.', color: 'error' })
    } finally {
      loading.value = false
    }
  }
  
  onMounted(loadWeddings)
  
  const publishedCount = computed(() => weddings.value.filter((w) => w.status === 'published').length)
  const premiumCount = computed(() => weddings.value.filter((w) => w.plan === 'premium').length)
  
  const filteredWeddings = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return weddings.value
    return weddings.value.filter((w) =>
      [w.content.brideName, w.content.groomName, w.slug].some((field) => field?.toLowerCase().includes(q))
    )
  })
  </script>
  
  <style scoped>
  .form-card {
    border-radius: 1.25rem;
    padding: 1.5rem;
    background: linear-gradient(160deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.015));
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .result-box {
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    background: rgba(16, 185, 129, 0.08);
    border: 1px solid rgba(16, 185, 129, 0.25);
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.8);
  }

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
  
  .wedding-row {
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
  
  .wedding-row:hover {
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
