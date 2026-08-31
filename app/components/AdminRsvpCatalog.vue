<template>
  <AdminSidePreview mode="rsvp" :rsvp-texts="form.texts">
  <div class="space-y-6 animate-fade-up">
    <UAlert icon="i-heroicons-language" color="info" variant="soft" title="Global RSVP languages" description="Create a language preset here. It appears as a one-click option in every user's RSVP Editor; each user can still adjust their own final wording." />

    <div class="explain-card">
      <p class="font-semibold text-sm text-gold-200 mb-1.5">Where this applies</p>
      <p class="text-sm text-white/60 leading-relaxed">
        Each preset here fills in every question, label, and button on a couple's own RSVP page (<code class="text-gold-300 bg-white/5 px-1 rounded">/w/[slug]/rsvp</code>) - the page their guests actually fill in. A couple picks a language preset once from their RSVP Editor, then can hand-edit any individual line afterward without losing the rest. The preview shows whatever preset you're currently adding or editing below.
      </p>
    </div>

    <div v-if="customPresets.length" class="space-y-2">
      <div v-for="preset in customPresets" :key="preset.id" class="catalog-row">
        <span class="font-medium">{{ preset.label }}</span>
        <div class="ml-auto flex gap-1"><UButton size="xs" variant="ghost" color="neutral" icon="i-heroicons-pencil-square" @click="edit(preset)" /><UButton size="xs" variant="ghost" color="error" icon="i-heroicons-trash" :loading="removing === preset.id" @click="remove(preset.id)" /></div>
      </div>
    </div>

    <div>
      <p class="text-xs font-semibold uppercase tracking-widest text-gold-200/70 mb-2">Built-in languages (editable)</p>
      <div class="space-y-2">
        <div v-for="preset in builtInEffective" :key="preset.id" class="catalog-row group">
          <span class="font-medium">{{ preset.label }}</span>
          <div class="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <UButton size="xs" variant="ghost" color="neutral" icon="i-heroicons-pencil-square" title="Edit built-in wording" @click="editBuiltIn(preset)" />
            <UButton size="xs" variant="ghost" color="neutral" icon="i-heroicons-arrow-path" title="Reset to built-in wording" @click="resetBuiltIn(preset.id)" />
          </div>
        </div>
      </div>
    </div>

    <div class="form-card">
      <div class="flex items-center gap-3"><h2 class="font-display text-lg">{{ editingId ? `Edit ${form.label || 'language'}` : 'Add RSVP language' }}</h2><UButton v-if="editingId" class="ml-auto" size="xs" variant="ghost" color="neutral" @click="reset">Cancel</UButton></div>
      <UFormField label="Language name" class="mt-4"><UInput v-model="form.label" placeholder="e.g. Korean, Japanese, Chinese, Indonesian" class="w-full" /></UFormField>

      <div class="flex items-end gap-2 mt-4 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15">
        <UFormField label="Translate all fields to (code)" class="flex-1 mb-0">
          <UInput v-model="translateTarget" placeholder="e.g. ms, ko, ja, id" class="w-full" />
        </UFormField>
        <UButton color="neutral" variant="soft" icon="i-heroicons-language" :loading="translating" :disabled="!translateTarget.trim()" @click="translateAll">
          Auto-translate
        </UButton>
      </div>
      <p class="text-xs text-white/40 mt-2">Uses Google Translate (Papago if configured) to draft every line below from its current wording. {placeholders} are kept intact. Always review the result before saving.</p>

      <div class="grid sm:grid-cols-2 gap-4 mt-4">
        <UFormField v-for="field in rsvpTextFields" :key="field.key" :label="field.label"><UInput v-model="form.texts[field.key]" class="w-full" /></UFormField>
      </div>
      <UButton class="mt-5" color="primary" :loading="saving" :disabled="!form.label.trim()" @click="save">{{ editingId ? 'Save language' : 'Add language' }}</UButton>
    </div>
  </div>
  </AdminSidePreview>
</template>

<script setup lang="ts">
import { rsvpTextFields, type RsvpPreset, type RsvpTextKey } from '~/composables/useThemes'
import { createDefaultContent } from '~/composables/useWeddingTypes'
const { builtInRsvpPresets, allRsvpPresets, addRsvpPreset, removeRsvpPreset, saveRsvpPresetOverride, resetRsvpPresetOverride } = useThemes()
const toast = useToast()
const empty = () => ({ label: '', texts: Object.fromEntries(rsvpTextFields.map((field) => [field.key, createDefaultContent()[field.key]])) as Record<RsvpTextKey, string> })
const form = ref(empty())
const editingId = ref('')
const editingBuiltInId = ref('')
const saving = ref(false)
const removing = ref('')
const customPresets = computed(() => allRsvpPresets.value.filter((preset) => !builtInRsvpPresets.some((builtIn) => builtIn.id === preset.id)))
const builtInEffective = computed(() => allRsvpPresets.value.filter((preset) => builtInRsvpPresets.some((builtIn) => builtIn.id === preset.id)))
function slugify(value: string) { return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }
function edit(preset: RsvpPreset) { editingId.value = preset.id; editingBuiltInId.value = ''; form.value = { label: preset.label, texts: { ...empty().texts, ...preset.texts } } }
function editBuiltIn(preset: RsvpPreset) { editingBuiltInId.value = preset.id; editingId.value = ''; form.value = { label: preset.label, texts: { ...empty().texts, ...preset.texts } } }
function reset() { editingId.value = ''; editingBuiltInId.value = ''; form.value = empty() }
async function resetBuiltIn(id: string) { try { await resetRsvpPresetOverride(id); if (editingBuiltInId.value === id) reset(); toast.add({ title: 'RSVP language reset to built-in wording', color: 'success' }) } catch (error) { console.error(error); toast.add({ title: 'Could not reset RSVP language', color: 'error' }) } }
async function save() {
  saving.value = true
  try {
    if (editingBuiltInId.value) {
      await saveRsvpPresetOverride(editingBuiltInId.value, { label: form.value.label.trim(), texts: { ...form.value.texts } })
      toast.add({ title: 'RSVP language updated', color: 'success' }); reset(); return
    }
    const preset: RsvpPreset = { id: editingId.value || `rsvp-${slugify(form.value.label) || Date.now()}`, label: form.value.label.trim(), texts: { ...form.value.texts } }
    await addRsvpPreset(preset); toast.add({ title: 'RSVP language saved', color: 'success' }); reset()
  } catch (error) { console.error(error); toast.add({ title: 'Could not save RSVP language', color: 'error' }) } finally { saving.value = false }
}
async function remove(id: string) { removing.value = id; try { await removeRsvpPreset(id); toast.add({ title: 'RSVP language removed', color: 'success' }) } catch (error) { console.error(error); toast.add({ title: 'Could not remove RSVP language', color: 'error' }) } finally { removing.value = '' } }

// --- Translation assist ---
const { translate } = useTranslation()
const translateTarget = ref('')
const translating = ref(false)
async function translateAll() {
  if (!translateTarget.value.trim()) return
  translating.value = true
  try {
    for (const field of rsvpTextFields) {
      const source = form.value.texts[field.key]
      if (!source?.trim()) continue
      try {
        form.value.texts[field.key] = await translate(source, translateTarget.value.trim())
      } catch {
        // Leave that field as-is; keep going with the rest.
      }
    }
    toast.add({ title: 'Draft translation applied', description: 'Review each line before saving.', color: 'success' })
  } finally {
    translating.value = false
  }
}
</script>

<style scoped>
.form-card,.catalog-row { border:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.03); border-radius:1rem; padding:1.25rem; }
.catalog-row { display:flex; align-items:center; }
.explain-card { border-radius: 1rem; padding: 1.1rem 1.25rem; background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.16); }
</style>
