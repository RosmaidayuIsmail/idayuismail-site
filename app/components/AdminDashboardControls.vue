<template>
  <AdminSidePreview mode="dashboard" :dashboard-form="form">
  <div class="space-y-6 animate-fade-up">
    <UAlert icon="i-heroicons-shield-check" color="info" variant="soft" title="Platform controls — not a couple's invitation" description="These settings change the dashboard labels and pages available to every user. Wedding names, dates, guests and RSVP responses remain owned by each couple." />

    <div class="explain-card">
      <p class="font-semibold text-sm text-gold-200 mb-1.5">Where this applies</p>
      <p class="text-sm text-white/60 leading-relaxed">
        Every couple who signs in lands on <code class="text-gold-300 bg-white/5 px-1 rounded">/dashboard</code>, which uses this exact sidebar and overview copy. Turning a page off here removes it from every couple's sidebar (the page itself still exists, it just isn't linked); renaming a page only changes its label. The "Overview copy" fields are the two headline lines and the empty-state card text every couple sees the moment they sign in, before they've created a wedding.
      </p>
    </div>

    <div class="form-card">
      <h2 class="font-display text-lg">Dashboard pages</h2>
      <p class="text-sm text-white/50 mt-1">Rename or hide a supported page. Its route and security remain fixed in the app.</p>
      <div class="mt-5 space-y-3">
        <div v-for="item in form.navItems" :key="item.id" class="page-row">
          <USwitch v-model="item.enabled" />
          <div class="min-w-0 flex-1">
            <p class="text-xs uppercase tracking-wider text-white/40 mb-1">{{ pageNames[item.id] }}</p>
            <UInput v-model="item.label" size="sm" class="w-full" :disabled="!item.enabled" />
          </div>
        </div>
      </div>
    </div>

    <div class="form-card space-y-4">
      <div><h2 class="font-display text-lg">Overview copy</h2><p class="text-sm text-white/50 mt-1">Text shown on the user dashboard overview and first-card screen.</p></div>
      <UFormField label="Overview eyebrow"><UInput v-model="form.overviewEyebrow" class="w-full" /></UFormField>
      <UFormField label="Overview title"><UInput v-model="form.overviewTitle" class="w-full" /></UFormField>
      <UFormField label="New-card title"><UInput v-model="form.createCardTitle" class="w-full" /></UFormField>
      <UFormField label="New-card description"><UTextarea v-model="form.createCardDescription" :rows="2" class="w-full" /></UFormField>
    </div>

    <div class="flex items-center gap-3"><UButton color="primary" icon="i-heroicons-check" size="lg" :loading="saving" @click="save">Save user dashboard controls</UButton><UButton variant="ghost" color="neutral" size="sm" :disabled="saving" @click="reset">Reset defaults</UButton></div>
  </div>
  </AdminSidePreview>
</template>

<script setup lang="ts">
import { defaultDashboardSettings, type DashboardSettings } from '~/composables/useThemes'
const { dashboardSettings, saveDashboardSettings } = useThemes()
const toast = useToast()
const saving = ref(false)
const form = ref<DashboardSettings>(structuredClone(toRaw(dashboardSettings.value)))
const pageNames = { overview: 'Overview', opening: 'Opening Design', editor: 'Design Studio', rsvp: 'RSVP Editor', guests: 'Guest List', flow: 'Wedding Day Flow', billing: 'Billing & Plans' }
watch(dashboardSettings, (value) => { form.value = structuredClone(toRaw(value)) }, { once: true })
async function save() { saving.value = true; try { await saveDashboardSettings(structuredClone(toRaw(form.value))); toast.add({ title: 'User dashboard controls saved', color: 'success' }) } catch (error) { console.error(error); toast.add({ title: 'Could not save dashboard controls', color: 'error' }) } finally { saving.value = false } }
function reset() { form.value = structuredClone(defaultDashboardSettings) }
</script>

<style scoped>
.form-card { border-radius: 1.25rem; padding: 1.5rem; background: linear-gradient(160deg, rgba(255,255,255,.035), rgba(255,255,255,.015)); border: 1px solid rgba(255,255,255,.1); }
.page-row { display: flex; align-items: center; gap: 1rem; padding: 1rem; border-radius: .9rem; background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.07); }
.explain-card { border-radius: 1rem; padding: 1.1rem 1.25rem; background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.16); }
</style>
