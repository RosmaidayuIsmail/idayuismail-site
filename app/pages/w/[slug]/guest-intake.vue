<template>
  <div v-if="loading" class="min-h-screen invite-backdrop flex flex-col items-center justify-center text-white/60 space-y-4">
    <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gold-400" />
    <p class="animate-pulse tracking-widest uppercase text-xs">Loading...</p>
  </div>

  <div v-else-if="notFound || !wedding" class="min-h-screen invite-backdrop flex items-center justify-center text-white text-center px-6">
    <div class="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
      <p class="text-xl font-display mb-2">We couldn't find that invitation.</p>
    </div>
  </div>

  <!-- No ?key= at all, or the key the server checked on first load turned
       out to be wrong/expired (linkInvalid) - either way nothing on this
       page can work, so show one plain message instead of a broken form.
       The real gate is always server-side (every request below re-checks
       the key against server/utils/guest-intake.ts). -->
  <div v-else-if="!keyParam || linkInvalid" class="min-h-screen invite-backdrop flex items-center justify-center text-white text-center px-6">
    <div class="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl max-w-sm">
      <UIcon name="i-heroicons-lock-closed" class="w-10 h-10 text-gold-300/60 mb-4 mx-auto" />
      <p class="text-lg font-display">This link looks incomplete.</p>
      <p class="text-sm text-white/60 mt-2">Please use the exact guest-list link you were given.</p>
    </div>
  </div>

  <section v-else class="min-h-screen theme-surface text-white flex items-center justify-center px-4 py-12" :style="{ ...styleVars, ...inputUiVars }">
    <UContainer class="max-w-xl w-full relative z-10">
      <div class="text-center space-y-3 mb-8">
        <p class="text-xs uppercase tracking-widest font-medium" :style="{ color: 'var(--theme-accent)' }">
          {{ wedding.content.brideName }} &amp; {{ wedding.content.groomName }}
        </p>
        <h1 class="text-4xl font-bold" :style="{ color: 'var(--theme-ink)', fontFamily: 'var(--theme-heading-font)' }">Add Your Guests</h1>
        <p class="text-sm max-w-md mx-auto" :style="{ color: 'color-mix(in srgb, var(--theme-ink) 70%, transparent)' }">
          Add each guest below, then send them their own invitation straight from this page - phone number optional. You can come back to this same link anytime to add more or send invites later.
        </p>
      </div>

      <div class="rounded-3xl border backdrop-blur-xl shadow-2xl px-6 py-8 sm:px-8 space-y-6" :style="{ background: 'color-mix(in srgb, var(--theme-ink) 5%, transparent)', borderColor: 'var(--theme-accent-soft)' }">
        <div class="grid sm:grid-cols-2 gap-4">
          <UFormField label="Guest name">
            <UInput v-model="form.name" placeholder="e.g. Ahmad bin Ali" size="lg" class="w-full" @keyup.enter="submitGuest" />
          </UFormField>
          <UFormField label="Phone (optional)">
            <UInput v-model="form.phone" placeholder="+60 12-345 6789" size="lg" class="w-full" @keyup.enter="submitGuest" />
          </UFormField>
        </div>

        <div>
          <p class="text-sm mb-3 font-medium" :style="{ color: 'color-mix(in srgb, var(--theme-ink) 80%, transparent)' }">Guest type</p>
          <div class="grid grid-cols-2 gap-3">
            <label class="intake-option" :class="{ 'intake-option-active': form.tier === 'general' }">
              <input v-model="form.tier" type="radio" value="general" class="sr-only"> General
            </label>
            <label class="intake-option" :class="{ 'intake-option-active': form.tier === 'vip' }">
              <input v-model="form.tier" type="radio" value="vip" class="sr-only"> VIP
            </label>
          </div>
        </div>

        <p v-if="errorMsg" class="text-sm text-red-400 font-medium">{{ errorMsg }}</p>

        <UButton block size="lg" icon="i-heroicons-user-plus" :loading="submitting" class="rounded-full px-8 accent-btn" @click="submitGuest">
          Add Guest
        </UButton>
      </div>

      <!-- Every guest already on the list (added here, or by whoever set
           up the invitation), each with its own ready-to-tap WhatsApp
           button - this is the "how do I actually send these out"
           half of the page. Adding a phone number (edit pencil) upgrades
           the button from "pick who to send to" into opening that exact
           contact's chat directly. -->
      <div class="mt-10">
        <div class="flex items-center justify-between mb-3">
          <p class="text-xs uppercase tracking-widest font-medium" :style="{ color: 'var(--theme-accent)' }">
            Your Guest List{{ guestsList.length ? ` (${guestsList.length})` : '' }}
          </p>
          <UIcon v-if="listLoading" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" :style="{ color: 'var(--theme-accent)' }" />
        </div>

        <p v-if="!listLoading && guestsList.length === 0" class="text-sm text-center py-6" :style="{ color: 'color-mix(in srgb, var(--theme-ink) 50%, transparent)' }">
          No guests yet - add your first one above.
        </p>

        <ul v-else class="space-y-3">
          <li
            v-for="g in guestsList"
            :key="g.id"
            class="rounded-2xl px-4 py-3"
            :style="{ background: 'color-mix(in srgb, var(--theme-ink) 5%, transparent)', color: 'var(--theme-ink)' }"
          >
            <template v-if="editingId === g.id">
              <div class="grid sm:grid-cols-2 gap-3 mb-3">
                <UInput v-model="editForm.name" placeholder="Guest name" size="sm" />
                <UInput v-model="editForm.phone" placeholder="Phone (optional)" size="sm" />
              </div>
              <div class="flex items-center justify-between gap-3">
                <div class="grid grid-cols-2 gap-2 flex-1 max-w-[220px]">
                  <label class="intake-option intake-option-compact" :class="{ 'intake-option-active': editForm.tier === 'general' }">
                    <input v-model="editForm.tier" type="radio" value="general" class="sr-only"> General
                  </label>
                  <label class="intake-option intake-option-compact" :class="{ 'intake-option-active': editForm.tier === 'vip' }">
                    <input v-model="editForm.tier" type="radio" value="vip" class="sr-only"> VIP
                  </label>
                </div>
                <div class="flex gap-2">
                  <UButton size="sm" color="neutral" variant="ghost" @click="cancelEdit">Cancel</UButton>
                  <UButton size="sm" class="accent-btn" :loading="savingEdit" @click="saveEdit(g.id)">Save</UButton>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="flex items-center justify-between gap-3 flex-wrap">
                <div class="min-w-0">
                  <p class="font-medium truncate">{{ g.name }}</p>
                  <p class="text-xs opacity-60 flex items-center gap-2 mt-0.5">
                    <span class="uppercase tracking-wide">{{ g.tier }}</span>
                    <span>&middot;</span>
                    <span>{{ g.phone || 'No phone' }}</span>
                    <span>&middot;</span>
                    <span :class="g.attending === 'Yes' ? 'text-emerald-500' : g.attending === 'No' ? 'text-red-400' : ''">
                      {{ g.attending === 'Yes' ? 'Attending' : g.attending === 'No' ? 'Declined' : 'No response yet' }}
                    </span>
                  </p>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <UButton size="sm" color="neutral" variant="ghost" icon="i-heroicons-pencil-square" title="Edit name / phone / type" @click="startEdit(g)" />
                  <UButton size="sm" color="neutral" variant="ghost" :icon="copiedId === g.id ? 'i-heroicons-check' : 'i-heroicons-link'" title="Copy invitation link" @click="copyInviteLink(g)" />
                  <UButton
                    size="sm"
                    color="success"
                    variant="soft"
                    icon="i-heroicons-chat-bubble-left-right"
                    :to="g.whatsappUrl"
                    target="_blank"
                    external
                    class="rounded-full"
                  >
                    WhatsApp
                  </UButton>
                </div>
              </div>
            </template>
          </li>
        </ul>

        <p v-if="guestsList.length" class="text-xs mt-4 text-center" :style="{ color: 'color-mix(in srgb, var(--theme-ink) 50%, transparent)' }">
          Tap "WhatsApp" next to a guest to send their invite - with a phone number saved it opens their chat directly, otherwise you'll pick who to send it to. Save this link to come back anytime.
        </p>
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
interface IntakeGuest {
  id: string
  name: string
  phone: string
  tier: 'vip' | 'general'
  attending: string
  inviteUrl: string
  whatsappUrl: string
}

const route = useRoute()
const slug = route.params.slug as string

const { wedding, loading, notFound } = useWeddingBySlug(slug)
const { themeStyleVars } = useThemes()
const toast = useToast()

// The secret that gates every request on this page - checked server-side
// against server/utils/guest-intake.ts on every call (list, add, edit).
// This page never verifies it itself, since a client-side check could
// never be trusted anyway. See DashboardGuestsPanel.vue's "Guest List
// Intake Link" panel for where a couple gets a link with this filled in.
const keyParam = computed(() => (typeof route.query.key === 'string' ? route.query.key : ''))
const linkInvalid = ref(false)

const styleVars = computed(() =>
  themeStyleVars(
    wedding.value?.themeId,
    {
      bgFrom: wedding.value?.content.customBgFrom,
      bgTo: wedding.value?.content.customBgTo,
      accent: wedding.value?.content.customAccent
    },
    wedding.value?.content.customFontFamily || wedding.value?.content.fontFamily,
    wedding.value?.content.textWeight
  )
)

// Nuxt UI's own form fields (UInput below, in both the add-guest form and
// each guest row's inline editor) don't read the wedding's theme colors at
// all - they read Nuxt UI's own semantic tokens (--ui-bg, --ui-border*,
// --ui-text-highlighted/dimmed, --ui-primary), which are fixed globally in
// app.config.ts (a dark "ink" background, gold primary), so every field
// rendered the same fixed dark pill regardless of the wedding's actual
// theme - this is exactly what rsvp.vue's cardUiVars does for the RSVP
// form's inputs, applied here at the <section> level (rather than just one
// card) so it reaches both the add-guest form AND the guest-list row
// editors below it.
const inputUiVars = computed(() => ({
  '--ui-bg': 'color-mix(in srgb, var(--theme-ink) 6%, transparent)',
  '--ui-bg-elevated': 'color-mix(in srgb, var(--theme-ink) 10%, transparent)',
  '--ui-bg-accented': 'color-mix(in srgb, var(--theme-ink) 14%, transparent)',
  '--ui-border': 'color-mix(in srgb, var(--theme-ink) 20%, transparent)',
  '--ui-border-accented': 'color-mix(in srgb, var(--theme-ink) 35%, transparent)',
  '--ui-border-muted': 'color-mix(in srgb, var(--theme-ink) 12%, transparent)',
  '--ui-text-highlighted': 'var(--theme-ink)',
  '--ui-text-dimmed': 'color-mix(in srgb, var(--theme-ink) 45%, transparent)',
  '--ui-text': 'color-mix(in srgb, var(--theme-ink) 80%, transparent)',
  '--ui-primary': 'var(--theme-accent)'
}))

useHead({
  link: computed(() => {
    if (wedding.value?.content.customFontUrl && !wedding.value.content.customFontUrl.includes('fonts.google.com/specimen/')) {
      return [{ rel: 'stylesheet', href: wedding.value.content.customFontUrl }]
    }
    return []
  })
})

const form = reactive({ name: '', phone: '', tier: 'general' as 'vip' | 'general' })
const submitting = ref(false)
const errorMsg = ref('')

const guestsList = ref<IntakeGuest[]>([])
const listLoading = ref(false)

async function loadGuests() {
  if (!wedding.value || !keyParam.value) return
  listLoading.value = true
  try {
    const { guests } = await $fetch<{ guests: IntakeGuest[] }>('/api/guests/intake-list', {
      query: { weddingId: wedding.value.id, key: keyParam.value }
    })
    guestsList.value = guests
  } catch (error) {
    const statusCode = (error as { data?: { statusCode?: number }; statusCode?: number })?.data?.statusCode
      ?? (error as { statusCode?: number })?.statusCode
    if (statusCode === 403) linkInvalid.value = true
    console.error(error)
  } finally {
    listLoading.value = false
  }
}

watch(() => wedding.value?.id, (id) => { if (id) loadGuests() }, { immediate: true })

async function submitGuest() {
  errorMsg.value = ''
  const name = form.name.trim()
  if (name.length < 2) {
    errorMsg.value = 'Please enter the guest’s name.'
    return
  }
  if (!wedding.value) return

  submitting.value = true
  try {
    await $fetch('/api/guests/intake', {
      method: 'POST',
      body: {
        weddingId: wedding.value.id,
        key: keyParam.value,
        name,
        phone: form.phone.trim(),
        tier: form.tier
      }
    })
    toast.add({ title: 'Guest added', color: 'success' })
    form.name = ''
    form.phone = ''
    form.tier = 'general'
    await loadGuests()
  } catch (error) {
    const statusMessage = (error as { data?: { statusMessage?: string } })?.data?.statusMessage
    errorMsg.value = statusMessage || 'Something went wrong - please try again.'
  } finally {
    submitting.value = false
  }
}

const copiedId = ref<string | null>(null)
async function copyInviteLink(guest: IntakeGuest) {
  try {
    await navigator.clipboard.writeText(guest.inviteUrl)
    copiedId.value = guest.id
    toast.add({ title: 'Invitation link copied', color: 'success' })
    setTimeout(() => { if (copiedId.value === guest.id) copiedId.value = null }, 2000)
  } catch {
    toast.add({ title: 'Could not copy link', color: 'error' })
  }
}

const editingId = ref<string | null>(null)
const editForm = reactive({ name: '', phone: '', tier: 'general' as 'vip' | 'general' })
const savingEdit = ref(false)

function startEdit(guest: IntakeGuest) {
  editingId.value = guest.id
  editForm.name = guest.name
  editForm.phone = guest.phone
  editForm.tier = guest.tier
}

function cancelEdit() {
  editingId.value = null
}

async function saveEdit(guestId: string) {
  if (!wedding.value) return
  const name = editForm.name.trim()
  if (name.length < 2) {
    toast.add({ title: 'Please enter a name', color: 'error' })
    return
  }
  savingEdit.value = true
  try {
    await $fetch('/api/guests/intake-update', {
      method: 'POST',
      body: {
        weddingId: wedding.value.id,
        key: keyParam.value,
        guestId,
        name,
        phone: editForm.phone.trim(),
        tier: editForm.tier
      }
    })
    editingId.value = null
    toast.add({ title: 'Guest updated', color: 'success' })
    await loadGuests()
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Could not save changes', color: 'error' })
  } finally {
    savingEdit.value = false
  }
}

watch(
  wedding,
  (value) => {
    if (!value) return
    useSeoMeta({ title: `Add Guests — ${value.content.brideName} & ${value.content.groomName}` })
  },
  { immediate: true }
)
</script>

<style scoped>
.accent-btn {
  background-color: var(--theme-accent, #d4a017) !important;
  color: var(--theme-on-accent, #1f1400) !important;
}
.accent-btn:hover {
  filter: brightness(1.08);
}

.intake-option {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem;
  border-radius: 0.75rem;
  border: 1px solid color-mix(in srgb, var(--theme-ink, #000) 15%, transparent);
  background: color-mix(in srgb, var(--theme-ink, #000) 3%, transparent);
  color: var(--theme-ink);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}
.intake-option:hover {
  border-color: color-mix(in srgb, var(--theme-ink, #000) 30%, transparent);
  background: color-mix(in srgb, var(--theme-ink, #000) 6%, transparent);
}
.intake-option-active {
  border-color: var(--theme-accent, #e3b04a);
  background: var(--theme-accent-soft, rgba(212, 160, 23, 0.15));
  box-shadow: 0 4px 12px -2px rgba(212, 160, 23, 0.2);
}
.intake-option-compact {
  padding: 0.5rem;
  font-size: 0.8rem;
}
</style>
