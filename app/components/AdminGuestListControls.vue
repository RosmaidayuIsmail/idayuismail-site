<template>
  <AdminSidePreview mode="guests" :guest-list-form="form">
  <div class="space-y-6 animate-fade-up">
    <UAlert icon="i-heroicons-users" color="info" variant="soft" title="Global Guest List controls" description="Labels and which optional columns are shown on every user's Guest List page. A couple's actual guest data is never touched by anything here." />

    <div class="explain-card">
      <p class="font-semibold text-sm text-gold-200 mb-1.5">Where this applies</p>
      <p class="text-sm text-white/60 leading-relaxed">
        This is the couple's own Guest List page in their dashboard (<code class="text-gold-300 bg-white/5 px-1 rounded">/dashboard/guests</code>) - a private management tool, guests never see it. The page title/description and tier labels appear exactly as typed here. The two column switches only hide or show a column in that table - the underlying "special seating"/"dietary" answers a couple's guests submit through RSVP are always collected either way.
      </p>
    </div>

    <div class="form-card space-y-4">
      <h2 class="font-display text-lg">Page labels</h2>
      <UFormField label="Page title"><UInput v-model="form.pageTitle" class="w-full" /></UFormField>
      <UFormField label="Page description"><UInput v-model="form.pageDescription" class="w-full" /></UFormField>
      <div class="grid sm:grid-cols-2 gap-4">
        <UFormField label="VIP tier label"><UInput v-model="form.vipLabel" class="w-full" /></UFormField>
        <UFormField label="General tier label"><UInput v-model="form.generalLabel" class="w-full" /></UFormField>
      </div>
    </div>

    <div class="form-card space-y-3">
      <h2 class="font-display text-lg">Optional columns</h2>
      <p class="text-sm text-white/50">Hide a column that doesn't matter for how you run weddings - the underlying RSVP answer is still collected either way, this only controls whether the Guest List table displays that column.</p>
      <div class="page-row">
        <USwitch v-model="form.showSpecialSeating" />
        <span class="text-sm">Show "Special Seating" column</span>
      </div>
      <div class="page-row">
        <USwitch v-model="form.showDietary" />
        <span class="text-sm">Show "Dietary Needs" column</span>
      </div>
    </div>

    <UButton color="primary" icon="i-heroicons-check" size="lg" :loading="saving" @click="save">Save Guest List controls</UButton>
  </div>
  </AdminSidePreview>
</template>

<script setup lang="ts">
import { defaultGuestListSettings, type GuestListSettings } from '~/composables/useThemes'

const toast = useToast()
const { guestListSettings, saveGuestListSettings } = useThemes()

const form = ref<GuestListSettings>(structuredClone(toRaw(guestListSettings.value)))
watch(guestListSettings, (v) => { form.value = structuredClone(toRaw(v)) }, { once: true })

const saving = ref(false)
async function save() {
  saving.value = true
  try {
    await saveGuestListSettings(structuredClone(toRaw(form.value)))
    toast.add({ title: 'Guest List controls saved', color: 'success' })
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Could not save Guest List controls', color: 'error' })
  } finally {
    saving.value = false
  }
}
void defaultGuestListSettings
</script>

<style scoped>
.form-card { border-radius: 1.25rem; padding: 1.5rem; background: linear-gradient(160deg, rgba(255,255,255,.035), rgba(255,255,255,.015)); border: 1px solid rgba(255,255,255,.1); }
.page-row { display: flex; align-items: center; gap: 1rem; padding: .85rem 1rem; border-radius: .9rem; background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.07); }
.explain-card { border-radius: 1rem; padding: 1.1rem 1.25rem; background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.16); }
</style>
