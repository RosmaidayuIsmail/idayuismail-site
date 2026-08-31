<template>
  <div class="pb-12">
    <div v-if="loading" class="min-h-[50vh] flex items-center">
      <PageSkeleton variant="page" />
    </div>

    <div v-else-if="!wedding" class="max-w-md mx-auto mt-12 animate-fade-up">
      <!-- Unchanged setup form omitted for brevity, keeping it identical to prior -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-400/10 border border-gold-400/20 mb-4">
          <UIcon name="i-heroicons-sparkles" class="w-8 h-8 text-gold-300" />
        </div>
        <h1 class="text-3xl font-display font-bold text-white mb-2">{{ dashboardSettings.createCardTitle }}</h1>
        <p class="text-white/60 text-sm">{{ dashboardSettings.createCardDescription }}</p>
      </div>

      <div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl space-y-5">
        <UFormField label="Bride's Name">
          <UInput v-model="brideName" placeholder="Aisyah" size="lg" class="w-full" />
        </UFormField>
        <UFormField label="Groom's Name">
          <UInput v-model="groomName" placeholder="Danial" size="lg" class="w-full" />
        </UFormField>
        <UFormField label="Your Custom Link Name" :error="slugError">
          <UInput v-model="slugInput" placeholder="aisyah-danial" size="lg" class="w-full" @input="onSlugInput" icon="i-heroicons-link" />
          <template #help>
            <span class="text-xs text-gold-300/70">yoursite.com/w/{{ slugPreview || 'your-link' }}</span>
          </template>
        </UFormField>

        <UButton block size="xl" color="primary" class="font-semibold shadow-lg shadow-gold-500/20 mt-4 rounded-full" :loading="creating" @click="handleCreate">
          Generate Wedding Card
        </UButton>
      </div>
    </div>

    <!-- Overview Dashboard -->
    <div v-else class="animate-fade-up space-y-8 max-w-6xl mx-auto">
      
      <!-- Top Section -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-md">
        <div>
          <p class="text-gold-300 text-sm font-semibold tracking-widest uppercase mb-2 flex items-center gap-2">
            <UIcon name="i-heroicons-star" class="w-4 h-4" /> {{ dashboardSettings.overviewEyebrow }}
          </p>
          <h1 v-if="!editingNames" class="text-3xl sm:text-4xl font-display font-bold text-white group cursor-pointer inline-flex items-center gap-2" @click="startEditingNames">
            {{ wedding.content.brideName || 'Your' }} &amp; {{ wedding.content.groomName || 'Wedding' }}
            <UIcon name="i-heroicons-pencil-square" class="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
          </h1>
          <div v-else class="flex flex-wrap items-center gap-2">
            <UInput v-model="editBrideName" size="lg" placeholder="Bride's name" class="w-36" />
            <span class="text-white/50 font-display text-xl">&amp;</span>
            <UInput v-model="editGroomName" size="lg" placeholder="Groom's name" class="w-36" />
            <UButton size="sm" color="primary" icon="i-heroicons-check" :loading="savingNames" @click="saveNames">Save</UButton>
            <UButton size="sm" variant="ghost" color="neutral" icon="i-heroicons-x-mark" @click="editingNames = false" />
          </div>
          <div class="flex items-center gap-3 mt-4">
            <UBadge :color="wedding.status === 'published' ? 'success' : 'neutral'" variant="subtle" size="md" class="px-3">
              {{ wedding.status === 'published' ? '🟢 Published Live' : '⚪ Draft Mode' }}
            </UBadge>
            <span class="text-sm font-medium px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
              {{ wedding.plan === 'premium' ? '✨ Premium Plan' : 'Free Plan' }}
            </span>
          </div>
        </div>
        
        <UButton 
          :color="wedding.status === 'published' ? 'neutral' : 'primary'" 
          :variant="wedding.status === 'published' ? 'soft' : 'solid'" 
          size="lg"
          class="rounded-full px-6 font-semibold shadow-md"
          @click="togglePublish"
        >
          {{ wedding.status === 'published' ? 'Unpublish Card' : 'Publish Card Live' }}
        </UButton>
      </div>

      <!-- Share Link Banner -->
      <div class="rounded-2xl border border-gold-400/20 bg-gradient-to-r from-gold-500/10 to-transparent p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between relative overflow-hidden">
        <div class="absolute left-0 top-0 w-1 h-full bg-gold-400"></div>
        <div class="flex-1 overflow-hidden">
          <div class="flex items-center gap-2 mb-1">
            <p class="text-xs text-white/50 uppercase tracking-widest font-semibold">Your Shareable Link</p>
            <button v-if="!editingSlug" type="button" class="text-white/40 hover:text-gold-300 transition-colors" @click="startEditingSlug">
              <UIcon name="i-heroicons-pencil-square" class="w-3.5 h-3.5" />
            </button>
          </div>

          <div v-if="!editingSlug">
            <!-- Clickable Link fix here -->
            <a :href="publicUrl" target="_blank" class="text-gold-200 font-medium text-lg tracking-wide hover:underline hover:text-gold-100 transition-colors block truncate">
              {{ publicUrl }}
            </a>
          </div>
          <div v-else class="flex flex-wrap items-center gap-2">
            <span class="text-white/40 text-sm shrink-0">{{ siteUrlPrefix }}/w/</span>
            <UInput v-model="editSlugValue" size="md" class="flex-1 min-w-[140px]" />
            <UButton size="xs" color="primary" icon="i-heroicons-check" :loading="savingSlug" @click="saveSlug">Save</UButton>
            <UButton size="xs" variant="ghost" color="neutral" icon="i-heroicons-x-mark" @click="editingSlug = false" />
          </div>
          <p v-if="editingSlug" class="text-xs text-white/40 mt-1.5">Links already shared with your current name keep working - this just sets the name used for new links.</p>
        </div>
        <div v-if="!editingSlug" class="flex gap-3 shrink-0">
          <UButton size="md" variant="soft" color="neutral" icon="i-heroicons-clipboard-document" class="bg-black/20 hover:bg-black/40 border border-white/10 rounded-full" @click="copyLink">
            {{ copied ? 'Copied!' : 'Copy Link' }}
          </UButton>
          <UButton size="md" variant="solid" color="primary" icon="i-heroicons-arrow-top-right-on-square" :to="publicUrl" target="_blank" external class="rounded-full shadow-md">
            View Live
          </UButton>
        </div>
      </div>

      <!-- Countdown -->
      <div v-if="wedding.content.dateISO" class="rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-8 text-center backdrop-blur-md">
        <p class="text-xs text-white/50 uppercase tracking-widest font-semibold mb-4">Counting down to the big day</p>
        <CountdownTimer :target="wedding.content.dateISO" />
      </div>

      <!-- Setup Checklist -->
      <div v-if="checklistPercent < 100" class="rounded-2xl border border-gold-400/15 bg-gold-400/[0.04] p-6 sm:p-8">
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm font-semibold text-white flex items-center gap-2">
            <UIcon name="i-heroicons-check-badge" class="w-5 h-5 text-gold-300" /> Finish setting up your card
          </p>
          <span class="text-xs text-white/50">{{ checklistDoneCount }}/{{ checklistItems.length }} done</span>
        </div>
        <div class="h-1.5 rounded-full bg-white/5 overflow-hidden mb-5">
          <div class="h-full bg-gradient-to-r from-gold-500 to-gold-300 rounded-full transition-all duration-500" :style="{ width: `${checklistPercent}%` }" />
        </div>
        <div class="grid sm:grid-cols-2 gap-2.5">
          <NuxtLink
            v-for="item in checklistItems"
            :key="item.key"
            :to="item.to || '/dashboard'"
            class="checklist-item"
            :class="{ 'checklist-item-done': item.done }"
            @click="item.action ? onChecklistClick($event, item.action) : undefined"
          >
            <UIcon :name="item.done ? 'i-heroicons-check-circle-solid' : 'i-heroicons-arrow-right-circle'" class="w-5 h-5 shrink-0" :class="item.done ? 'text-emerald-400' : 'text-white/30'" />
            <span class="text-sm" :class="item.done ? 'text-white/50 line-through' : 'text-white/80'">{{ item.label }}</span>
          </NuxtLink>
        </div>
      </div>
      <div v-else class="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5 flex items-center gap-3">
        <UIcon name="i-heroicons-sparkles" class="w-6 h-6 text-emerald-400 shrink-0" />
        <p class="text-sm text-white/80">Your card is fully set up. Keep an eye on Guest List for new responses!</p>
      </div>

      <!-- Bento Grid: Stats & Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

        <!-- Stats Box -->
        <div class="md:col-span-2 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="stat-card">
              <div class="p-2 rounded-lg bg-white/5 self-start mb-2"><UIcon name="i-heroicons-envelope" class="w-5 h-5 text-white/60" /></div>
              <div>
                <p class="stat-label">Total Invited</p>
                <p class="stat-number">{{ totalInvited }}</p>
              </div>
            </div>
            <div class="stat-card border-emerald-500/20 bg-emerald-500/5">
              <div class="p-2 rounded-lg bg-emerald-500/10 self-start mb-2"><UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-emerald-400" /></div>
              <div>
                <p class="stat-label text-emerald-400/70">Attending</p>
                <p class="stat-number text-emerald-400">{{ totalAttending }}</p>
              </div>
            </div>
            <div class="stat-card border-red-500/20 bg-red-500/5">
              <div class="p-2 rounded-lg bg-red-500/10 self-start mb-2"><UIcon name="i-heroicons-x-circle" class="w-5 h-5 text-red-400" /></div>
              <div>
                <p class="stat-label text-red-400/70">Not Attending</p>
                <p class="stat-number text-red-400">{{ totalNotAttending }}</p>
              </div>
            </div>
            <div class="stat-card border-gold-400/20 bg-gold-400/5">
              <div class="p-2 rounded-lg bg-gold-400/10 self-start mb-2"><UIcon name="i-heroicons-users" class="w-5 h-5 text-gold-300" /></div>
              <div>
                <p class="stat-label text-gold-300/70">Total Headcount</p>
                <p class="stat-number text-gold-300">{{ totalGuestCount }}</p>
              </div>
            </div>
          </div>

          <!-- Response rate bar -->
          <div class="stat-card !flex-row items-center justify-between gap-4">
            <div>
              <p class="stat-label">Response Rate</p>
              <p class="text-sm text-white/50 mt-1">{{ totalResponded }} of {{ totalInvited }} guests have responded</p>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <div class="w-28 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div class="h-full bg-gradient-to-r from-indigo-400 to-emerald-400 rounded-full transition-all duration-500" :style="{ width: `${responseRatePercent}%` }" />
              </div>
              <span class="text-lg font-bold text-white tabular-nums">{{ responseRatePercent }}%</span>
            </div>
          </div>

          <!-- Recent Responses -->
          <div v-if="recentGuests.length" class="stat-card !block">
            <p class="stat-label mb-3">Latest Responses</p>
            <div class="space-y-2">
              <div v-for="g in recentGuests" :key="g.id" class="flex items-center justify-between gap-3 text-sm">
                <span class="text-white/80 truncate">{{ g.name }}</span>
                <UBadge :color="g.attending === 'Yes' ? 'success' : 'error'" variant="subtle" size="sm">
                  {{ g.attending === 'Yes' ? 'Attending' : 'Not attending' }}
                </UBadge>
              </div>
            </div>
            <NuxtLink to="/dashboard/guests" class="text-xs text-gold-300/80 hover:text-gold-200 mt-3 inline-flex items-center gap-1">
              View all guests <UIcon name="i-heroicons-arrow-right" class="w-3 h-3" />
            </NuxtLink>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-2 md:grid-cols-1 gap-3">
          <NuxtLink v-for="link in quickLinks" :key="link.to" :to="link.to" class="quick-link group">
            <div class="p-3 rounded-xl transition-colors" :class="link.iconBg">
              <UIcon :name="link.icon" class="w-6 h-6" :class="link.iconColor" />
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-white transition-colors truncate">{{ link.label }}</p>
              <p class="text-xs text-white/50 truncate">{{ link.description }}</p>
            </div>
            <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-white/20 ml-auto group-hover:text-white/60 transition-colors hidden md:block" />
          </NuxtLink>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { wedding, loading, createWedding, isSlugAvailable, setPublished, updateContent, updateSlug } = useMyWedding()
const { dashboardSettings } = useThemes()
const { guests, totalInvited, totalResponded, totalAttending, totalNotAttending, totalGuestCount } = useGuests(() => wedding.value?.id)
const toast = useToast()
const config = useRuntimeConfig()

// --- Setup checklist: a quick "what's left" nudge computed straight from
// the wedding's own data, so it never drifts out of sync with what's
// actually been filled in - no separate progress field to maintain.
const checklistItems = computed(() => {
  if (!wedding.value) return []
  const c = wedding.value.content
  return [
    { key: 'cover', label: 'Add a cover photo', done: !!c.coverPhotoUrl, to: '/dashboard/editor' },
    { key: 'date', label: 'Set your wedding date & venue', done: !!c.dateISO && !!c.venueName, to: '/dashboard/editor' },
    { key: 'guests', label: 'Add your first guest', done: totalInvited.value > 0, to: '/dashboard/guests' },
    { key: 'flow', label: 'Plan your day flow', done: (wedding.value.flow?.length || 0) > 0, to: '/dashboard/flow' },
    { key: 'rsvp', label: 'Customize your RSVP text', done: !!c.rsvpDeadlineLabel, to: '/dashboard/rsvp-editor' },
    { key: 'publish', label: 'Publish your card live', done: wedding.value.status === 'published', to: '/dashboard', action: togglePublish }
  ]
})
const checklistDoneCount = computed(() => checklistItems.value.filter((i) => i.done).length)
const checklistPercent = computed(() => checklistItems.value.length ? Math.round((checklistDoneCount.value / checklistItems.value.length) * 100) : 100)

function onChecklistClick(event: MouseEvent, action: () => void) {
  event.preventDefault()
  action()
}

const responseRatePercent = computed(() => (totalInvited.value > 0 ? Math.round((totalResponded.value / totalInvited.value) * 100) : 0))
const recentGuests = computed(() => guests.value.filter((g) => g.attending).slice(0, 5))

const quickLinks = [
  { to: '/dashboard/opening', label: 'Opening Design', description: 'Choose the envelope-opening style', icon: 'i-heroicons-envelope', iconBg: 'bg-rose-400/10 group-hover:bg-rose-400/20', iconColor: 'text-rose-300' },
  { to: '/dashboard/editor', label: 'Design Studio', description: 'Edit text, theme, and photos', icon: 'i-heroicons-paint-brush', iconBg: 'bg-gold-400/10 group-hover:bg-gold-400/20', iconColor: 'text-gold-300' },
  { to: '/dashboard/rsvp-editor', label: 'RSVP Editor', description: 'Customize the guest RSVP flow', icon: 'i-heroicons-pencil-square', iconBg: 'bg-purple-400/10 group-hover:bg-purple-400/20', iconColor: 'text-purple-300' },
  { to: '/dashboard/guests', label: 'Guest List', description: 'Manage RSVPs & VIPs', icon: 'i-heroicons-clipboard-document-list', iconBg: 'bg-emerald-400/10 group-hover:bg-emerald-400/20', iconColor: 'text-emerald-400' },
  { to: '/dashboard/flow', label: 'Day Flow', description: 'Plan your event timeline', icon: 'i-heroicons-clock', iconBg: 'bg-indigo-400/10 group-hover:bg-indigo-400/20', iconColor: 'text-indigo-400' },
  { to: '/dashboard/billing', label: 'Billing & Plans', description: 'Manage your plan', icon: 'i-heroicons-credit-card', iconBg: 'bg-sky-400/10 group-hover:bg-sky-400/20', iconColor: 'text-sky-300' }
]

const brideName = ref('')

const editingNames = ref(false)
const editBrideName = ref('')
const editGroomName = ref('')
const savingNames = ref(false)

function startEditingNames() {
  if (!wedding.value) return
  editBrideName.value = wedding.value.content.brideName
  editGroomName.value = wedding.value.content.groomName
  editingNames.value = true
}

async function saveNames() {
  if (!editBrideName.value.trim() || !editGroomName.value.trim()) return
  savingNames.value = true
  try {
    await updateContent({ brideName: editBrideName.value.trim(), groomName: editGroomName.value.trim() })
    editingNames.value = false
  } finally {
    savingNames.value = false
  }
}

const groomName = ref('')
const slugInput = ref('')
const slugError = ref('')
const creating = ref(false)
const copied = ref(false)

const slugPreview = computed(() => slugify(slugInput.value))

function onSlugInput() {
  slugError.value = ''
}

watch([brideName, groomName], () => {
  if (!slugInput.value) {
    slugInput.value = `${brideName.value}-${groomName.value}`.trim()
  }
})

async function handleCreate() {
  slugError.value = ''
  if (!brideName.value.trim() || !groomName.value.trim()) {
    toast.add({ title: 'Please enter both names', color: 'warning' })
    return
  }
  const clean = slugify(slugInput.value)
  if (!clean) {
    slugError.value = 'Please choose a link name'
    return
  }

  creating.value = true
  try {
    const available = await isSlugAvailable(clean)
    if (!available) {
      slugError.value = 'That link name is already taken'
      return
    }
    await createWedding(clean, brideName.value.trim(), groomName.value.trim())
    toast.add({ title: 'Your wedding card is ready!', color: 'success' })
  } catch (error) {
    slugError.value = error instanceof Error ? error.message : 'Something went wrong'
  } finally {
    creating.value = false
  }
}

const publicUrl = computed(() => {
  if (!wedding.value) return ''
  const base = config.public.siteUrl || (import.meta.client ? window.location.origin : '')
  return `${base}/w/${wedding.value.slug}`
})

const siteUrlPrefix = computed(() => config.public.siteUrl || (import.meta.client ? window.location.origin : ''))

const editingSlug = ref(false)
const editSlugValue = ref('')
const savingSlug = ref(false)

function startEditingSlug() {
  if (!wedding.value) return
  editSlugValue.value = wedding.value.slug
  editingSlug.value = true
}

async function saveSlug() {
  if (!editSlugValue.value.trim()) return
  savingSlug.value = true
  try {
    await updateSlug(editSlugValue.value.trim())
    editingSlug.value = false
    toast.add({ title: 'Link name updated', color: 'success' })
  } catch (error: any) {
    toast.add({ title: error?.message || 'Could not update the link name', color: 'error' })
  } finally {
    savingSlug.value = false
  }
}

async function copyLink() {
  await navigator.clipboard.writeText(publicUrl.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

async function togglePublish() {
  if (!wedding.value) return
  await setPublished(wedding.value.status !== 'published')
  toast.add({ title: wedding.value.status === 'published' ? 'Card published live' : 'Card reverted to draft', color: 'success' })
}
</script>

<style scoped>
.stat-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 1.25rem;
  padding: 1.5rem;
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
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 0.25rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.02);
}

.quick-link:hover {
  border-color: rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.04);
  transform: translateX(4px);
  box-shadow: 0 10px 20px -10px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05);
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.7rem 0.9rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s ease;
}

.checklist-item:hover {
  border-color: rgba(212, 160, 23, 0.3);
  background: rgba(255, 255, 255, 0.04);
}

.checklist-item-done {
  opacity: 0.7;
}
</style>
