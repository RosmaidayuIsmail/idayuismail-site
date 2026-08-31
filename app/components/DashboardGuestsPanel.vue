<template>
  <div class="pb-12">
    <div v-if="weddingLoading" class="min-h-[50vh] flex items-center">
      <PageSkeleton variant="page" />
    </div>

    <div v-else-if="!wedding" class="flex flex-col items-center justify-center min-h-[50vh] text-white/60 space-y-6">
      <div class="p-6 rounded-full bg-white/5 ring-1 ring-white/10 mb-2">
        <UIcon name="i-heroicons-users" class="w-12 h-12 text-gold-300/50" />
      </div>
      <p class="text-lg">You haven't created your wedding card yet.</p>
      <UButton to="/dashboard" size="lg" color="primary" class="font-semibold shadow-lg shadow-gold-500/20">Go create it</UButton>
    </div>

    <div v-else class="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div>
        <h1 class="text-3xl sm:text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-100 via-gold-300 to-gold-500 tracking-tight">
          {{ guestListSettings.pageTitle }}
        </h1>
        <p class="text-sm text-white/50 mt-2">{{ guestListSettings.pageDescription }}</p>
      </div>

      <!-- Bento Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 animate-fade-up">
        <div class="stat-card">
          <p class="stat-label flex items-center gap-1.5"><UIcon name="i-heroicons-envelope" class="w-4 h-4"/> Invited</p>
          <p class="stat-number">{{ totalInvited }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label flex items-center gap-1.5"><UIcon name="i-heroicons-chat-bubble-oval-left-ellipsis" class="w-4 h-4"/> Responded</p>
          <p class="stat-number">{{ totalResponded }}</p>
        </div>
        <div class="stat-card border-emerald-500/20 bg-emerald-500/5">
          <p class="stat-label text-emerald-400/70 flex items-center gap-1.5"><UIcon name="i-heroicons-check-circle" class="w-4 h-4"/> Attending</p>
          <p class="stat-number text-emerald-400">{{ totalAttending }}</p>
        </div>
        <div class="stat-card border-gold-400/20 bg-gold-400/5">
          <p class="stat-label text-gold-300/70 flex items-center gap-1.5"><UIcon name="i-heroicons-users" class="w-4 h-4"/> Total Guests</p>
          <p class="stat-number text-gold-300">{{ totalGuestCount }}</p>
        </div>
      </div>

      <!-- Add guest Panel -->
      <div class="form-panel animate-fade-up delay-1">
        <div class="flex items-center gap-2 mb-4 text-white/90">
          <UIcon name="i-heroicons-user-plus" class="w-5 h-5 text-gold-300" />
          <h3 class="font-semibold">Add a Guest Manually</h3>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto_auto] gap-4">
          <UInput v-model="newGuest.name" placeholder="Guest Name" size="lg">
            <template #leading>
              <UIcon name="i-heroicons-user" class="text-gray-500 dark:text-gray-400" />
            </template>
          </UInput>
          <UInput v-model="newGuest.phone" placeholder="+60 12-345 6789 (Optional)" size="lg">
            <template #leading>
              <UIcon name="i-heroicons-phone" class="text-gray-500 dark:text-gray-400" />
            </template>
          </UInput>
          <UInput v-model="newGuest.email" placeholder="Email (Optional)" size="lg" type="email">
            <template #leading>
              <UIcon name="i-heroicons-envelope" class="text-gray-500 dark:text-gray-400" />
            </template>
          </UInput>
          <USelect v-model="newGuest.tier" :items="[{ label: guestListSettings.generalLabel, value: 'general' }, { label: guestListSettings.vipLabel, value: 'vip' }]" size="lg" class="w-full sm:w-32" />
          <UButton color="primary" icon="i-heroicons-plus" size="lg" class="w-full sm:w-auto font-semibold px-6 shadow-md hover:-translate-y-0.5 transition-transform" :loading="adding" @click="handleAdd">Add</UButton>
        </div>
      </div>

      <!-- Guest List Intake Link - lets the couple add their own VIP/General
           guests (name + optional phone) themselves, through a link they
           can open with no login and no access to anything else in this
           dashboard. See app/pages/w/[slug]/guest-intake.vue and
           server/utils/guest-intake.ts. -->
      <div class="form-panel animate-fade-up delay-1">
        <div class="flex items-center gap-2 mb-2 text-white/90">
          <UIcon name="i-heroicons-link" class="w-5 h-5 text-gold-300" />
          <h3 class="font-semibold">Guest List Intake Link</h3>
        </div>
        <p class="text-xs text-white/50 mb-4">
          Send this link to the couple so they can add their own VIP/General guests (name + optional phone) - it opens a simple page with no access to anything else here.
        </p>
        <div class="flex flex-col sm:flex-row gap-2">
          <UInput :model-value="intakeLink" readonly size="lg" class="flex-1 font-mono text-xs" placeholder="Generating link..." />
          <div class="flex gap-2">
            <UButton
              size="lg"
              color="primary"
              variant="soft"
              :icon="intakeCopied ? 'i-heroicons-check' : 'i-heroicons-clipboard'"
              :disabled="!intakeLink"
              :loading="intakeLoading"
              class="rounded-full px-4"
              @click="copyIntakeLink"
            >
              Copy
            </UButton>
            <UButton
              size="lg"
              color="neutral"
              variant="ghost"
              icon="i-heroicons-arrow-path"
              :loading="intakeLoading"
              class="rounded-full px-4"
              @click="regenerateIntakeLink"
            >
              New link
            </UButton>
          </div>
        </div>
      </div>

      <!-- Google Drive backup -->
      <div class="form-panel animate-fade-up delay-1">
        <div class="flex flex-wrap items-center gap-3">
          <UIcon name="i-heroicons-cloud-arrow-up" class="w-5 h-5 text-gold-300 shrink-0" />
          <div class="min-w-[220px]">
            <h3 class="font-semibold text-white/90">Google Drive backup</h3>
            <p class="text-xs text-white/50 mt-0.5">
              <template v-if="driveConnected">
                Connected as <span class="text-white/80">{{ driveEmail }}</span> - guests.csv/.pdf/.xlsx auto-update here every time someone RSVPs, until your wedding date.
              </template>
              <template v-else>Connect your own Google Drive - guests.csv/.pdf/.xlsx will auto-update there every time someone RSVPs, until your wedding date.</template>
            </p>
          </div>
          <div class="ml-auto flex flex-wrap gap-2">
            <UButton v-if="driveFolderLink" :to="driveFolderLink" target="_blank" external size="sm" color="neutral" variant="ghost" icon="i-heroicons-arrow-top-right-on-square" class="rounded-full px-4">Open folder</UButton>
            <UButton v-if="driveConnected" size="sm" color="primary" variant="soft" icon="i-heroicons-cloud-arrow-up" class="rounded-full px-4" :loading="driveExporting" @click="exportToDrive">Sync now</UButton>
            <UButton v-if="driveConnected" size="sm" color="error" variant="ghost" class="rounded-full px-4" @click="disconnectDrive">Disconnect</UButton>
            <UButton v-else size="sm" color="neutral" variant="soft" icon="i-heroicons-link" class="rounded-full px-4" :loading="driveConnecting" @click="connectDrive">Connect Google Drive</UButton>
          </div>
        </div>
      </div>

      <!-- Filters & Actions Bar -->
      <div class="flex flex-col gap-4 animate-fade-up delay-2">
        <div class="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div class="flex flex-wrap gap-2">
            <div class="flex bg-white/5 p-1 rounded-full border border-white/10">
              <button v-for="t in tierFilters" :key="t.value" type="button" class="filter-pill" :class="{ 'filter-pill-active': tierFilter === t.value }" @click="tierFilter = t.value">
                {{ t.label }}
              </button>
            </div>
            <div class="flex bg-white/5 p-1 rounded-full border border-white/10">
              <button v-for="s in statusFilters" :key="s.value" type="button" class="filter-pill" :class="{ 'filter-pill-active': statusFilter === s.value }" @click="statusFilter = s.value">
                {{ s.label }}
              </button>
            </div>
          </div>
          <div class="flex gap-3">
            <UButton size="sm" color="neutral" variant="soft" icon="i-heroicons-arrow-up-tray" class="rounded-full px-4" @click="importOpen = true">Import CSV</UButton>
            <UButton size="sm" color="neutral" variant="soft" icon="i-heroicons-printer" class="rounded-full px-4 hover:bg-white/10 border-white/10" @click="printList">Print / PDF</UButton>
            <UButton size="sm" color="primary" variant="soft" icon="i-heroicons-arrow-down-tray" class="rounded-full px-4" @click="exportCSV()">Export CSV</UButton>
            <UButton size="sm" color="primary" variant="soft" icon="i-heroicons-table-cells" class="rounded-full px-4" :loading="exportingExcel" @click="exportExcel">Export Excel</UButton>
            <!-- Both include each guest's personalized invite link + a
                 ready-to-tap WhatsApp send link, meant to be handed to the
                 couple so THEY can send invites themselves - unlike the two
                 buttons above, which are plain guest-data backups. -->
            <UButton size="sm" color="success" variant="soft" icon="i-heroicons-link" class="rounded-full px-4" @click="exportGuestLinks">Guest Links CSV</UButton>
            <UButton size="sm" color="success" variant="soft" icon="i-heroicons-table-cells" class="rounded-full px-4" :loading="generatingSheet" @click="generateGuestLinksSheet">Guest Links Sheet</UButton>
          </div>
        </div>
        <UInput v-model="searchQuery" placeholder="Search guests by name or phone..." icon="i-heroicons-magnifying-glass" size="lg" class="w-full sm:max-w-sm" />
      </div>

      <!-- List -->
      <div v-if="loading" class="py-8">
        <PageSkeleton variant="list" />
      </div>
      <EmptyState
        v-else-if="filteredGuests.length === 0"
        icon="i-heroicons-users"
        title="No guests in this view"
        description="Add your first guest above, or adjust the filters to see more of your list."
      />

      <TransitionGroup v-else name="list" tag="div" id="guest-print-area" class="space-y-3 animate-fade-up delay-3">
        <div v-for="guest in filteredGuests" :key="guest.id" class="guest-row group">
          
          <div class="flex items-center gap-4 min-w-[200px]">
            <button
              type="button"
              class="tier-toggle"
              :class="guest.tier === 'vip' ? 'tier-toggle-vip' : 'tier-toggle-general'"
              :title="guest.tier === 'vip' ? 'Click to change to General' : 'Click to mark as VIP'"
              @click="updateGuestTier(guest.id, guest.tier === 'vip' ? 'general' : 'vip')"
            >
              {{ guest.tier === 'vip' ? guestListSettings.vipLabel : guestListSettings.generalLabel }}
            </button>
            <div>
              <p class="font-medium text-white/90 group-hover:text-gold-200 transition-colors">{{ guest.name }}</p>
              <p class="text-xs text-white/50 flex items-center gap-1 mt-0.5">
                <UIcon name="i-heroicons-phone" class="w-3 h-3" />
                {{ guest.phone || 'No phone' }}
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-4 flex-1">
             <div v-if="guestListSettings.showSpecialSeating" class="hidden md:flex flex-col gap-1 w-40 border-l border-white/10 pl-4">
                 <p class="text-[0.65rem] uppercase tracking-widest text-white/40 font-semibold">Special Seating</p>
                 <p class="text-sm font-medium" :class="guest.specialSeating ? 'text-amber-400' : 'text-white/30'">{{ guest.specialSeating ? 'Required' : 'No' }}</p>
             </div>
             <div v-if="guestListSettings.showDietary" class="hidden lg:flex flex-col gap-1 flex-1 border-l border-white/10 pl-4">
                 <p class="text-[0.65rem] uppercase tracking-widest text-white/40 font-semibold">Dietary Needs</p>
                 <p class="text-sm text-white/70 truncate max-w-[200px]">{{ guest.dietary || '—' }}</p>
             </div>
          </div>

          <div class="flex items-center gap-3">
            <UBadge
              :color="guest.attending === 'Yes' ? 'success' : guest.attending === 'No' ? 'error' : 'neutral'"
              variant="subtle"
              class="px-3 py-1"
            >
              {{ guest.attending === 'Yes' ? `Attending (${guest.guestCount})` : guest.attending === 'No' ? 'Declined' : 'No Response' }}
            </UBadge>
            <UBadge v-if="guest.tableAssignment" color="info" variant="subtle" class="px-2 py-1" :title="'Table ' + guest.tableAssignment">
              {{ guest.tableAssignment }}
            </UBadge>
            
            <div class="flex items-center border-l border-white/10 pl-3 ml-1 gap-2 print:hidden">
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-heroicons-pencil-square"
                title="Edit guest / record RSVP manually"
                class="hover:bg-white/10"
                @click="openEditModal(guest)"
              />
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                :icon="copiedId === guest.id ? 'i-heroicons-check' : 'i-heroicons-link'"
                title="Copy personalized RSVP link"
                class="hover:bg-white/10"
                @click="copyGuestLink(guest)"
              />
              <UButton
                v-if="guest.phone"
                size="xs"
                color="success"
                variant="ghost"
                icon="i-heroicons-chat-bubble-left-right"
                :to="whatsappLink(guest, siteUrl, wedding.slug, wedding.content)"
                target="_blank"
                external
                title="Send WhatsApp Invite"
                class="hover:bg-emerald-500/20"
              />
              <UButton 
                size="xs" 
                color="neutral" 
                variant="ghost" 
                icon="i-heroicons-trash" 
                title="Remove Guest"
                class="hover:bg-red-500/20 hover:text-red-400 transition-colors" 
                @click="removeGuest(guest.id)" 
              />
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Edit guest / record RSVP manually -->
    <UModal v-model:open="editModalOpen" title="Edit guest">
      <template #body>
        <div v-if="editForm" class="space-y-4">
          <div class="grid sm:grid-cols-2 gap-4">
            <UFormField label="Name">
              <UInput v-model="editForm.name" size="lg" class="w-full" />
            </UFormField>
            <UFormField label="Phone">
              <UInput v-model="editForm.phone" size="lg" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Email (optional)">
            <UInput v-model="editForm.email" type="email" size="lg" class="w-full" />
          </UFormField>
          <UFormField label="Tier">
            <USelect v-model="editForm.tier" :items="[{ label: guestListSettings.generalLabel, value: 'general' }, { label: guestListSettings.vipLabel, value: 'vip' }]" class="w-full" />
          </UFormField>
          <div class="h-px bg-white/10"></div>
          <p class="text-xs text-white/40">Use this to record an RSVP that came in offline - a call, a text, in person - instead of through the live RSVP form.</p>
          <UFormField label="RSVP Status">
            <USelect v-model="editForm.attending" :items="[{ label: 'No response yet', value: '' }, { label: 'Attending', value: 'Yes' }, { label: 'Not attending', value: 'No' }]" class="w-full" />
          </UFormField>
          <div v-if="editForm.attending === 'Yes'" class="grid sm:grid-cols-2 gap-4">
            <UFormField label="Guest count">
              <UInputNumber v-model="editForm.guestCount" :min="1" :max="10" class="w-full" />
            </UFormField>
            <UFormField label="Special seating">
              <USelect v-model="editForm.specialSeating" :items="[{ label: 'No', value: false }, { label: 'Yes', value: true }]" class="w-full" />
            </UFormField>
          </div>
          <UFormField v-if="editForm.attending === 'Yes'" label="Dietary needs">
            <UInput v-model="editForm.dietary" class="w-full" />
          </UFormField>
          <UFormField label="Table (optional)">
            <UInput v-model="editForm.tableAssignment" placeholder="e.g. T1" class="w-full" />
          </UFormField>
          <UFormField label="Wishes / blessings">
            <UTextarea v-model="editForm.doa" :rows="2" class="w-full" />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton variant="ghost" color="neutral" @click="editModalOpen = false">Cancel</UButton>
          <UButton color="primary" :loading="savingEdit" @click="saveEdit">Save changes</UButton>
        </div>
      </template>
    </UModal>

    <!-- Bulk CSV import -->
    <UModal v-model:open="importOpen" title="Import guests from CSV">
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-white/60">Paste one guest per line as <code class="text-gold-300 bg-white/5 px-1 rounded">Name, Phone, tier, Email</code>. Phone, tier and email are all optional (tier defaults to General; use <code class="text-gold-300 bg-white/5 px-1 rounded">vip</code> for VIP).</p>
          <UTextarea v-model="importText" :rows="8" class="w-full font-mono text-sm" placeholder="Aisyah binti Ali, 0123456789, vip, aisyah@email.com&#10;Mut bin Abu, 0198765432" />
          <p class="text-xs text-white/40">{{ parsedImportRows.length }} guest(s) detected.</p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton variant="ghost" color="neutral" @click="importOpen = false">Cancel</UButton>
          <UButton color="primary" :loading="importing" :disabled="parsedImportRows.length === 0" @click="doImport">Import {{ parsedImportRows.length }}</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { GuestDoc } from '~/composables/useWeddingTypes'

// This is the real Guest List editor, shared by /dashboard/guests and the
// /admin/wedding/[id]/guests admin page. overrideWeddingId is only ever
// set by the admin page; couples hitting their own dashboard never pass
// it, so useMyWedding() falls back to its normal own-wedding lookup.
const props = defineProps<{ overrideWeddingId?: string | null }>()
const { wedding, loading: weddingLoading } = useMyWedding(toRef(props, 'overrideWeddingId'))
const {
  guests,
  loading,
  totalInvited,
  totalResponded,
  totalAttending,
  totalGuestCount,
  addGuest,
  addGuestsBulk,
  removeGuest,
  updateGuestTier,
  updateGuest,
  whatsappLink,
  personalizedLink,
  exportCSV,
  exportGuestLinksCSV
} = useGuests(() => wedding.value?.id)

const { guestListSettings } = useThemes()
const toast = useToast()
const { serverFetch } = useServerFetch()
const config = useRuntimeConfig()
const siteUrl = computed(() => config.public.siteUrl || (import.meta.client ? window.location.origin : ''))

const copiedId = ref<string | null>(null)

async function copyGuestLink(guest: GuestDoc) {
  if (!wedding.value) return
  const link = personalizedLink(guest, siteUrl.value, wedding.value.slug)
  try {
    await navigator.clipboard.writeText(link)
    copiedId.value = guest.id
    toast.add({ title: 'Link copied', description: `Personalized for ${guest.name} \u2014 share it anywhere.`, color: 'success' })
    setTimeout(() => {
      if (copiedId.value === guest.id) copiedId.value = null
    }, 2000)
  } catch {
    toast.add({ title: 'Could not copy link', color: 'error' })
  }
}

const newGuest = reactive({ name: '', phone: '', email: '', tier: 'general' as 'vip' | 'general' })
const adding = ref(false)

async function handleAdd() {
  if (!newGuest.name.trim()) return
  adding.value = true
  try {
    await addGuest({ ...newGuest })
    newGuest.name = ''
    newGuest.phone = ''
    newGuest.email = ''
    newGuest.tier = 'general'
  } finally {
    adding.value = false
  }
}

// --- Guest List Intake Link (server/utils/guest-intake.ts, the public
// app/pages/w/[slug]/guest-intake.vue page) ---
const intakeLink = ref('')
const intakeLoading = ref(false)
const intakeCopied = ref(false)

function buildIntakeLink(token: string) {
  if (!wedding.value) return ''
  return `${siteUrl.value}/w/${wedding.value.slug}/guest-intake?key=${token}`
}

async function loadIntakeLink() {
  if (!wedding.value) return
  intakeLoading.value = true
  try {
    const { token } = await serverFetch<{ token: string }>(`/api/admin/guest-intake/${wedding.value.id}`)
    intakeLink.value = buildIntakeLink(token)
  } catch (error) {
    console.error(error)
  } finally {
    intakeLoading.value = false
  }
}

async function regenerateIntakeLink() {
  if (!wedding.value) return
  if (!confirm('This breaks the old guest-intake link if it was already shared - anyone still using it won’t be able to add guests anymore. Generate a new one?')) return
  intakeLoading.value = true
  try {
    const { token } = await serverFetch<{ token: string }>(`/api/admin/guest-intake/${wedding.value.id}`, { method: 'POST' })
    intakeLink.value = buildIntakeLink(token)
    toast.add({ title: 'New guest-intake link generated', color: 'success' })
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Could not generate a new link', color: 'error' })
  } finally {
    intakeLoading.value = false
  }
}

async function copyIntakeLink() {
  if (!intakeLink.value) return
  try {
    await navigator.clipboard.writeText(intakeLink.value)
    intakeCopied.value = true
    toast.add({ title: 'Link copied', description: 'Share it with the couple - they can add guests with no login.', color: 'success' })
    setTimeout(() => { intakeCopied.value = false }, 2000)
  } catch {
    toast.add({ title: 'Could not copy link', color: 'error' })
  }
}

watch(() => wedding.value?.id, (id) => { if (id) loadIntakeLink() }, { immediate: true })

// --- Guest Links CSV (client-side, adds personalized/WhatsApp link columns
// to the plain exportCSV() above - see useGuests.ts) ---
function exportGuestLinks() {
  if (!wedding.value) return
  exportGuestLinksCSV(siteUrl.value, wedding.value.slug, wedding.value.content)
}

// --- Guest Links Google Sheet (server/api/admin/guest-links-sheet.post.ts)
// - same data as exportGuestLinks() above, but landed as a live Google
// Sheet in the admin's own connected Drive so the resulting link can be
// handed straight to the couple instead of a file. ---
const generatingSheet = ref(false)
async function generateGuestLinksSheet() {
  if (!wedding.value) return
  generatingSheet.value = true
  try {
    const { sheetLink } = await serverFetch<{ sheetLink: string }>('/api/admin/guest-links-sheet', {
      method: 'POST',
      body: { weddingId: wedding.value.id }
    })
    await navigator.clipboard.writeText(sheetLink).catch(() => {})
    toast.add({ title: 'Guest Links Sheet ready', description: 'Link copied to your clipboard - paste it wherever you send it to the couple.', color: 'success' })
    window.open(sheetLink, '_blank')
  } catch (error) {
    console.error(error)
    const statusMessage = (error as { data?: { statusMessage?: string } })?.data?.statusMessage
    toast.add({ title: 'Could not generate the Sheet', description: statusMessage, color: 'error' })
  } finally {
    generatingSheet.value = false
  }
}

// --- Export Excel (server/api/guests/export-excel.post.ts) ---
const exportingExcel = ref(false)
async function exportExcel() {
  if (!wedding.value) return
  exportingExcel.value = true
  try {
    const blob = await serverFetch<Blob>('/api/guests/export-excel', {
      method: 'POST',
      body: { weddingId: wedding.value.id },
      responseType: 'blob'
    })
    const url = URL.createObjectURL(blob as Blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'guests.xlsx'
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Could not export the Excel file', color: 'error' })
  } finally {
    exportingExcel.value = false
  }
}

// --- Google Drive backup (see useGoogleDrive.ts) ---
const {
  connected: driveConnected,
  driveEmail,
  folderLink: driveFolderLink,
  connecting: driveConnecting,
  exporting: driveExporting,
  refreshStatus: refreshDriveStatus,
  connect: connectDrive,
  disconnect: disconnectDrive,
  exportToDrive
} = useGoogleDrive(() => wedding.value?.id)

watch(() => wedding.value?.id, (id) => { if (id) refreshDriveStatus() }, { immediate: true })

// After Google redirects back from the OAuth consent screen (see
// server/api/drive/callback.get.ts), show what happened and clean the
// ?drive= query param off the URL so a page refresh doesn't re-show it.
onMounted(() => {
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
  refreshDriveStatus()
  const router = useRouter()
  router.replace({ query: { ...route.query, drive: undefined } })
})

const tierFilters = computed(() => [
  { label: 'All Guests', value: 'all' as const },
  { label: `${guestListSettings.value.vipLabel}s Only`, value: 'vip' as const },
  { label: guestListSettings.value.generalLabel, value: 'general' as const }
])
const tierFilter = ref<'all' | 'vip' | 'general'>('all')

const statusFilters = [
  { label: 'All', value: 'all' as const },
  { label: 'Attending', value: 'yes' as const },
  { label: 'Declined', value: 'no' as const },
  { label: 'No Response', value: 'pending' as const }
]
const statusFilter = ref<'all' | 'yes' | 'no' | 'pending'>('all')

const searchQuery = ref('')

const filteredGuests = computed(() => {
  let list = guests.value
  if (tierFilter.value !== 'all') {
    list = list.filter((g) => g.tier === tierFilter.value)
  }
  if (statusFilter.value === 'yes') {
    list = list.filter((g) => g.attending === 'Yes')
  } else if (statusFilter.value === 'no') {
    list = list.filter((g) => g.attending === 'No')
  } else if (statusFilter.value === 'pending') {
    list = list.filter((g) => !g.attending)
  }
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter((g) => g.name.toLowerCase().includes(q) || g.phone.toLowerCase().includes(q))
  }
  return list
})

function printList() {
  if (import.meta.client) window.print()
}

// Edit guest / record RSVP manually - lets the couple fix a typo'd name or
// phone, or log an RSVP that came in offline (a call, a text, in person)
// instead of through the live RSVP form.
const editModalOpen = ref(false)
const editForm = ref<GuestDoc | null>(null)
const savingEdit = ref(false)

function openEditModal(guest: GuestDoc) {
  editForm.value = { ...guest }
  editModalOpen.value = true
}

async function saveEdit() {
  if (!editForm.value) return
  savingEdit.value = true
  try {
    const { id, ...partial } = editForm.value
    await updateGuest(id, partial)
    editModalOpen.value = false
  } finally {
    savingEdit.value = false
  }
}

// --- Bulk CSV import ---
const importOpen = ref(false)
const importText = ref('')
const importing = ref(false)
const parsedImportRows = computed(() => {
  return importText.value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = '', phone = '', tier = '', email = ''] = line.split(',').map((s) => s.trim())
      return { name, phone, email, tier: tier.toLowerCase() === 'vip' ? ('vip' as const) : ('general' as const) }
    })
    .filter((r) => r.name)
})
async function doImport() {
  importing.value = true
  try {
    await addGuestsBulk(parsedImportRows.value)
    importOpen.value = false
    importText.value = ''
  } finally {
    importing.value = false
  }
}

useSeoMeta({ title: 'Guest List — WeddingCard' })
</script>

<style scoped>
/* Stat Cards matching Dashboard overview */
.stat-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 1.25rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.15);
}

.stat-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 0.5rem;
}

.stat-number {
  font-size: 2.25rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

/* Glass Panels */
.form-panel {
  border-radius: 1.25rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.2);
}

/* Tab Pills */
.filter-pill {
  padding: 0.4rem 1.25rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-pill:hover {
  color: white;
}

.filter-pill-active {
  background: rgba(212, 160, 23, 0.15);
  color: #f3ddaa;
  box-shadow: 0 4px 12px -2px rgba(212, 160, 23, 0.2);
}

/* Rows */
.tier-toggle {
  min-width: 3.5rem;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
  white-space: nowrap;
}

.tier-toggle-general {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.6);
}

.tier-toggle-general:hover {
  background: rgba(255, 255, 255, 0.12);
  color: white;
}

.tier-toggle-vip {
  background: rgba(212, 160, 23, 0.18);
  color: #f3ddaa;
  border-color: rgba(212, 160, 23, 0.3);
}

.tier-toggle-vip:hover {
  background: rgba(212, 160, 23, 0.28);
}

.guest-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  flex-wrap: wrap;
  transition: all 0.3s ease;
}

.guest-row:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateX(4px);
}

@media print {
  .stat-card, .form-panel, .filter-pill, .flex.gap-3 {
    display: none !important;
  }
  
  .guest-row {
    background: transparent;
    border: none;
    border-bottom: 1px solid #ccc;
    border-radius: 0;
    color: black;
    transform: none !important;
    padding: 0.5rem 0;
  }
  
  .text-white\/90, .text-white\/50, .text-white\/70, .text-white\/40, .text-white {
    color: black !important;
  }
}
</style>