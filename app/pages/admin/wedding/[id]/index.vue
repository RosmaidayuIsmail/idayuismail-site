<template>
    <div class="pb-12">
      <div v-if="loading" class="min-h-[50vh] flex items-center">
        <PageSkeleton variant="page" />
      </div>
  
      <div v-else-if="!wedding" class="max-w-md mx-auto mt-12 text-center animate-fade-up">
        <UIcon name="i-heroicons-face-frown" class="w-10 h-10 text-white/30 mx-auto mb-4" />
        <p class="text-white/70 font-medium mb-2">Wedding not found</p>
        <p class="text-white/40 text-sm mb-6">It may have been deleted, or the link is wrong.</p>
        <UButton to="/admin" variant="soft" color="neutral" class="rounded-full">Back to all weddings</UButton>
      </div>
  
      <!-- Overview Dashboard -->
      <div v-else class="animate-fade-up space-y-8 max-w-6xl mx-auto">
  
        <!-- Top Section -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-md">
          <div>
            <p class="text-indigo-300 text-sm font-semibold tracking-widest uppercase mb-2 flex items-center gap-2">
              <UIcon name="i-heroicons-shield-check" class="w-4 h-4" /> Admin - Dashboard Overview
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
  
          <div class="flex flex-col gap-2 items-end">
            <UButton
              :color="wedding.status === 'published' ? 'neutral' : 'primary'"
              :variant="wedding.status === 'published' ? 'soft' : 'solid'"
              size="lg"
              class="rounded-full px-6 font-semibold shadow-md"
              @click="togglePublish"
            >
              {{ wedding.status === 'published' ? 'Unpublish Card' : 'Publish Card Live' }}
            </UButton>
            <USelect v-model="planValue" :items="planOptions" class="w-40" @update:model-value="changePlan" />
          </div>
        </div>
  
        <!-- Share Link Banner -->
        <div class="rounded-2xl border border-gold-400/20 bg-gradient-to-r from-gold-500/10 to-transparent p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between relative overflow-hidden">
          <div class="absolute left-0 top-0 w-1 h-full bg-gold-400"></div>
          <div class="flex-1 overflow-hidden">
            <div class="flex items-center gap-2 mb-1">
              <p class="text-xs text-white/50 uppercase tracking-widest font-semibold">Shareable Link</p>
              <button v-if="!editingSlug" type="button" class="text-white/40 hover:text-gold-300 transition-colors" @click="startEditingSlug">
                <UIcon name="i-heroicons-pencil-square" class="w-3.5 h-3.5" />
              </button>
            </div>
  
            <div v-if="!editingSlug">
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
            <p v-if="editingSlug" class="text-xs text-white/40 mt-1.5">Links already shared with the current name keep working - this just sets the name used for new links.</p>
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
  
        <!-- Danger Zone -->
        <div class="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-red-300 flex items-center gap-2"><UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4" /> Danger zone</p>
            <p class="text-xs text-white/50 mt-1">Permanently delete this wedding and all of its guest data. This can't be undone.</p>
          </div>
          <UButton color="error" variant="soft" icon="i-heroicons-trash" class="rounded-full shrink-0" :loading="deleting" @click="confirmDelete">
            Delete Wedding
          </UButton>
        </div>
  
        <!-- Bento Grid: Stats & Actions -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
  
          <!-- Stats Box -->
          <div class="md:col-span-2 grid grid-cols-2 gap-4">
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
  
          <!-- Quick Actions Vertical Stack -->
          <div class="space-y-4">
            <NuxtLink :to="`/admin/wedding/${weddingId}/editor`" class="quick-link group">
              <div class="p-3 rounded-xl bg-gold-400/10 group-hover:bg-gold-400/20 transition-colors">
                <UIcon name="i-heroicons-paint-brush" class="w-6 h-6 text-gold-300" />
              </div>
              <div>
                <p class="font-semibold text-white group-hover:text-gold-200 transition-colors">Design Studio</p>
                <p class="text-xs text-white/50">Edit text, theme, and photos</p>
              </div>
              <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-white/20 ml-auto group-hover:text-white/60 transition-colors" />
            </NuxtLink>
  
            <NuxtLink :to="`/admin/wedding/${weddingId}/guests`" class="quick-link group">
              <div class="p-3 rounded-xl bg-emerald-400/10 group-hover:bg-emerald-400/20 transition-colors">
                <UIcon name="i-heroicons-clipboard-document-list" class="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p class="font-semibold text-white group-hover:text-emerald-300 transition-colors">Guest List</p>
                <p class="text-xs text-white/50">Manage RSVPs & VIPs</p>
              </div>
              <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-white/20 ml-auto group-hover:text-white/60 transition-colors" />
            </NuxtLink>
  
            <NuxtLink :to="`/admin/wedding/${weddingId}/flow`" class="quick-link group">
              <div class="p-3 rounded-xl bg-indigo-400/10 group-hover:bg-indigo-400/20 transition-colors">
                <UIcon name="i-heroicons-clock" class="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <p class="font-semibold text-white group-hover:text-indigo-300 transition-colors">Day Flow</p>
                <p class="text-xs text-white/50">Plan the event timeline</p>
              </div>
              <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-white/20 ml-auto group-hover:text-white/60 transition-colors" />
            </NuxtLink>
          </div>
  
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { deleteDoc, doc, updateDoc } from 'firebase/firestore'
  
  definePageMeta({ layout: 'admin-wedding', middleware: 'superadmin' })
  
  const route = useRoute()
  const weddingId = computed(() => route.params.id as string)
  
  const { wedding, loading, setPublished, updateContent, updateSlug } = useMyWedding(weddingId)
  const { totalInvited, totalAttending, totalNotAttending, totalGuestCount } = useGuests(() => wedding.value?.id)
  const { db } = useFirebase()
  const toast = useToast()
  const config = useRuntimeConfig()
  
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
  
  const copied = ref(false)
  
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
  
  // Admin-only: override the plan directly (a couple can't do this themselves -
  // on the real dashboard this only ever changes via Billing/checkout).
  const planOptions = [
    { label: 'Free Plan', value: 'free' },
    { label: 'Premium Plan', value: 'premium' }
  ]
  const planValue = ref('free')
  watch(() => wedding.value?.plan, (plan) => { planValue.value = plan || 'free' }, { immediate: true })
  
  async function changePlan(value: string) {
    if (!db || !wedding.value || value === wedding.value.plan) return
    await updateDoc(doc(db, 'weddings', wedding.value.id), { plan: value })
    toast.add({ title: `Plan set to ${value}`, color: 'success' })
  }
  
  // Admin-only: permanently remove a wedding (e.g. spam signups, GDPR
  // requests). Regular couples have no equivalent action.
  const deleting = ref(false)
  async function confirmDelete() {
    if (!wedding.value) return
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Permanently delete ${wedding.value.content.brideName} & ${wedding.value.content.groomName}'s wedding? This cannot be undone.`)) return
    if (!db) return
    deleting.value = true
    try {
      await deleteDoc(doc(db, 'weddings', wedding.value.id))
      toast.add({ title: 'Wedding deleted', color: 'success' })
      await navigateTo('/admin')
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not delete wedding', color: 'error' })
    } finally {
      deleting.value = false
    }
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
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
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
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
  }
  
  .quick-link:hover {
    border-color: rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.04);
    transform: translateX(4px);
    box-shadow: 0 10px 20px -10px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }
  </style>