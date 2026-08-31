<template>
  <AdminSidePreview mode="dayflow" :day-flow-form="labelsForm">
  <div class="space-y-6 animate-fade-up">
    <UAlert icon="i-heroicons-clock" color="info" variant="soft" title="Global Day Flow controls" description="Quick Start presets appear as one-click template buttons on every user's Day Flow page. Page labels change what every user sees at the top of that page. A user's own timeline is never touched by anything here." />

    <div class="explain-card">
      <p class="font-semibold text-sm text-gold-200 mb-1.5">Where this applies</p>
      <p class="text-sm text-white/60 leading-relaxed">
        This is the couple's own Wedding Day Flow page in their dashboard (<code class="text-gold-300 bg-white/5 px-1 rounded">/dashboard/flow</code>) - a private planning tool, guests never see it. The page title/description are exactly what's shown at the top. Each Quick Start preset is a one-click "fill my timeline with this" button - a couple can still edit, reorder, or delete every item afterward.
      </p>
    </div>

    <div class="form-card space-y-4">
      <h2 class="font-display text-lg">Page labels</h2>
      <UFormField label="Page title"><UInput v-model="labelsForm.pageTitle" class="w-full" /></UFormField>
      <UFormField label="Page description"><UInput v-model="labelsForm.pageDescription" class="w-full" /></UFormField>
      <UButton color="primary" :loading="savingLabels" @click="saveLabels">Save page labels</UButton>
    </div>

    <!-- Details Page Layout: which of the two /w/[slug]/details templates
         (Classic Slideshow vs the newer Menu-style tabbed layout) a couple
         is allowed to pick from on this same Day Flow page. Same
         "toggle, don't author" pattern as Opening Styles / Design Options
         in Platform Admin > Themes & Catalog - both templates are real
         markup in details.vue, not data. -->
    <div class="form-card space-y-3">
      <h2 class="font-display text-lg">Details Page Layout</h2>
      <p class="text-xs text-white/40">Controls which layout styles appear in the "Details Page Style" picker a couple sees on their own Day Flow page. Turning one off doesn't change a couple who's already using it.</p>
      <div class="space-y-2">
        <div v-for="style in detailsLayoutStyleCatalog" :key="style.value" class="catalog-row justify-between">
          <div class="flex items-center gap-3 min-w-0">
            <div class="p-2 rounded-lg shrink-0" :class="isLayoutStyleEnabled(style.value) ? 'bg-gold-400/10' : 'bg-white/5'">
              <UIcon :name="style.icon" class="w-4 h-4" :style="{ color: isLayoutStyleEnabled(style.value) ? '#e3b04a' : 'rgba(255,255,255,0.35)' }" />
            </div>
            <span class="font-medium truncate" :class="isLayoutStyleEnabled(style.value) ? 'text-white' : 'text-white/40'">{{ style.label }}</span>
          </div>
          <USwitch :model-value="isLayoutStyleEnabled(style.value)" :loading="togglingLayoutStyle === style.value" @update:model-value="(v: boolean) => toggleLayoutStyle(style.value, v)" />
        </div>
      </div>
    </div>

    <div v-if="customPresets.length" class="space-y-2">
      <div v-for="preset in customPresets" :key="preset.id" class="catalog-row items-start">
        <div class="min-w-0 flex-1">
          <p class="font-medium">{{ preset.label }}</p>
          <p class="text-xs text-white/40 mt-1">{{ preset.items.length }} item(s)</p>
        </div>
        <div class="flex gap-1 shrink-0"><UButton size="xs" variant="ghost" color="neutral" icon="i-heroicons-pencil-square" @click="edit(preset)" /><UButton size="xs" variant="ghost" color="error" icon="i-heroicons-trash" :loading="removing === preset.id" @click="remove(preset.id)" /></div>
      </div>
    </div>

    <div class="form-card">
      <div class="flex items-center gap-3">
        <h2 class="font-display text-lg">{{ editingId ? `Edit ${form.label || 'preset'}` : 'Add Quick Start preset' }}</h2>
        <UButton v-if="editingId" class="ml-auto" size="xs" variant="ghost" color="neutral" @click="reset">Cancel</UButton>
      </div>
      <UFormField label="Preset name" class="mt-4"><UInput v-model="form.label" placeholder="e.g. Chinese Tea Ceremony" class="w-full" /></UFormField>

      <div class="mt-4">
        <div class="flex items-center justify-between mb-2">
          <label class="field-label mb-0">Timeline items</label>
          <UButton size="xs" variant="soft" color="neutral" icon="i-heroicons-plus" @click="form.items.push({ time: '', title: '', description: '' })">Add item</UButton>
        </div>
        <div v-if="form.items.length === 0" class="empty-state">
          <p class="text-white/40 text-sm">No items yet.</p>
        </div>
        <div v-else class="space-y-3">
          <div v-for="(item, index) in form.items" :key="index" class="flow-row">
            <UInput v-model="item.time" placeholder="4:00 PM" size="sm" class="w-28 shrink-0" />
            <UInput v-model="item.title" placeholder="Akad Nikah" size="sm" class="flex-1 min-w-[120px]" />
            <UInput v-model="item.description" placeholder="Short description (optional)" size="sm" class="flex-[2] min-w-[160px]" />
            <UButton size="xs" variant="ghost" color="error" icon="i-heroicons-trash" @click="form.items.splice(index, 1)" />
          </div>
        </div>
      </div>

      <UButton class="mt-5" color="primary" :loading="saving" :disabled="!canSave" @click="save">{{ editingId ? 'Save preset' : 'Add preset' }}</UButton>
    </div>

    <div>
      <p class="text-xs font-semibold uppercase tracking-widest text-gold-200/70 mb-2">Built-in presets (editable)</p>
      <div class="space-y-2">
        <div v-for="p in builtInEffective" :key="p.id" class="catalog-row group">
          <div class="min-w-0 flex-1">
            <p class="font-medium">{{ p.label }}</p>
            <p class="text-xs text-white/40 mt-1">{{ p.items.length }} item(s)</p>
          </div>
          <div class="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <UButton size="xs" variant="ghost" color="neutral" icon="i-heroicons-pencil-square" title="Edit built-in preset" @click="editBuiltIn(p)" />
            <UButton size="xs" variant="ghost" color="neutral" icon="i-heroicons-arrow-path" title="Reset to built-in items" @click="resetBuiltIn(p.id)" />
          </div>
        </div>
      </div>
    </div>
  </div>
  </AdminSidePreview>
</template>

<script setup lang="ts">
import { defaultDayFlowSettings, type DayFlowSettings, type FlowPreset } from '~/composables/useThemes'

const toast = useToast()
const {
  builtInDayFlowPresets, allDayFlowPresets, addDayFlowPreset, removeDayFlowPreset,
  dayFlowSettings, saveDayFlowSettings, saveDayFlowPresetOverride, resetDayFlowPresetOverride,
  detailsLayoutStyleCatalog, disabledDetailsLayoutStyles, setDetailsLayoutStyleEnabled
} = useThemes()

const isLayoutStyleEnabled = (value: string) => !disabledDetailsLayoutStyles.value.includes(value)
const togglingLayoutStyle = ref('')
async function toggleLayoutStyle(value: string, enabled: boolean) {
  togglingLayoutStyle.value = value
  try {
    await setDetailsLayoutStyleEnabled(value, enabled)
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Could not update layout style', color: 'error' })
  } finally {
    togglingLayoutStyle.value = ''
  }
}

const customPresets = computed(() => allDayFlowPresets.value.filter((p) => !builtInDayFlowPresets.some((b) => b.id === p.id)))
const builtInEffective = computed(() => allDayFlowPresets.value.filter((p) => builtInDayFlowPresets.some((b) => b.id === p.id)))

const empty = () => ({ label: '', items: [] as { time: string; title: string; description: string }[] })
const form = ref(empty())
const editingId = ref('')
const editingBuiltInId = ref('')
const saving = ref(false)
const removing = ref('')
const canSave = computed(() => form.value.label.trim().length > 0 && form.value.items.length > 0)

function slugify(value: string) { return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }

function edit(preset: FlowPreset) {
  editingId.value = preset.id
  editingBuiltInId.value = ''
  form.value = { label: preset.label, items: preset.items.map((i) => ({ ...i })) }
}
function editBuiltIn(preset: FlowPreset) {
  editingBuiltInId.value = preset.id
  editingId.value = ''
  form.value = { label: preset.label, items: preset.items.map((i) => ({ ...i })) }
}
function reset() { editingId.value = ''; editingBuiltInId.value = ''; form.value = empty() }
async function resetBuiltIn(id: string) {
  try { await resetDayFlowPresetOverride(id); if (editingBuiltInId.value === id) reset(); toast.add({ title: 'Preset reset to built-in items', color: 'success' }) }
  catch (error) { console.error(error); toast.add({ title: 'Could not reset preset', color: 'error' }) }
}

async function save() {
  if (!canSave.value) return
  saving.value = true
  try {
    const items = form.value.items.map((i) => ({ time: i.time.trim(), title: i.title.trim(), description: i.description.trim() }))
    if (editingBuiltInId.value) {
      await saveDayFlowPresetOverride(editingBuiltInId.value, { label: form.value.label.trim(), items })
      toast.add({ title: 'Day Flow preset updated', color: 'success' })
      reset()
      return
    }
    const preset: FlowPreset = { id: editingId.value || `flow-${slugify(form.value.label) || Date.now()}`, label: form.value.label.trim(), items }
    await addDayFlowPreset(preset)
    toast.add({ title: 'Day Flow preset saved', color: 'success' })
    reset()
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Could not save preset', color: 'error' })
  } finally {
    saving.value = false
  }
}

async function remove(id: string) {
  removing.value = id
  try {
    await removeDayFlowPreset(id)
    if (editingId.value === id) reset()
    toast.add({ title: 'Preset removed', color: 'success' })
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Could not remove preset', color: 'error' })
  } finally {
    removing.value = ''
  }
}

// --- Page labels ---
const labelsForm = ref<DayFlowSettings>(structuredClone(toRaw(dayFlowSettings.value)))
watch(dayFlowSettings, (v) => { labelsForm.value = structuredClone(toRaw(v)) }, { once: true })
const savingLabels = ref(false)
async function saveLabels() {
  savingLabels.value = true
  try {
    await saveDayFlowSettings(structuredClone(toRaw(labelsForm.value)))
    toast.add({ title: 'Day Flow page labels saved', color: 'success' })
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Could not save page labels', color: 'error' })
  } finally {
    savingLabels.value = false
  }
}
void defaultDayFlowSettings
</script>

<style scoped>
.form-card,.catalog-row { border:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.03); border-radius:1rem; padding:1.25rem; }
.catalog-row { display:flex; align-items:center; gap: 1rem; }
.field-label { display:block; font-size:.7rem; text-transform:uppercase; letter-spacing:.08em; font-weight:600; color:rgba(255,255,255,.4); }
.flow-row { display:flex; align-items:center; gap:.5rem; flex-wrap:wrap; }
.empty-state { padding: 1.5rem 1rem; border-radius: .85rem; border: 1px dashed rgba(255,255,255,.12); text-align:center; }
.explain-card { border-radius: 1rem; padding: 1.1rem 1.25rem; background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.16); }
</style>
