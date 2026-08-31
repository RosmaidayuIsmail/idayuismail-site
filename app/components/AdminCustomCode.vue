<template>
  <div class="space-y-6 animate-fade-up">
    <UAlert
      icon="i-heroicons-shield-exclamation"
      color="warning"
      variant="soft"
      title="This runs on every live wedding page - contained, but real"
      description="Whatever you save here renders for every visitor to every wedding card. It runs inside a sandboxed iframe with no access to this site's cookies, Firebase session, or the rest of the page's DOM - so a bad paste can only break its own box, not the app - but it can still call out to the internet and show visitors anything you write. Preview carefully before enabling."
    />

    <div class="explain-card space-y-3">
      <div>
        <p class="font-semibold text-sm text-gold-200 mb-1.5">What this is</p>
        <p class="text-sm text-white/60 leading-relaxed">
          A single free-form box of HTML/CSS (and JS if your HTML includes a <code class="text-gold-300 bg-white/5 px-1 rounded">&lt;script&gt;</code> tag) that you write once here and it appears on <strong>every</strong> couple's public invitation page (<code class="text-gold-300 bg-white/5 px-1 rounded">/w/[slug]</code>) - the page their guests open. Think of it as a way to add something platform-wide (an announcement banner, a tracking/analytics snippet, a small widget) without touching source code or doing a deploy.
        </p>
      </div>
      <div>
        <p class="font-semibold text-sm text-gold-200 mb-1.5">For admin (you)</p>
        <p class="text-sm text-white/60 leading-relaxed">
          You write HTML/CSS in the two boxes below, choose whether it sits above the opening envelope ("Top") or below the RSVP/Details buttons ("Bottom"), and flip "enabled" on. It saves to one shared setting - there's no per-couple version.
        </p>
      </div>
      <div>
        <p class="font-semibold text-sm text-gold-200 mb-1.5">For a couple and their guests</p>
        <p class="text-sm text-white/60 leading-relaxed">
          Couples don't see this anywhere in their own dashboard and can't turn it off - it's entirely platform-controlled. Their guests, when they open the invitation link, will see and experience whatever you've enabled here as part of the page, exactly as it looks in the preview below.
        </p>
      </div>
      <div>
        <p class="font-semibold text-sm text-gold-200 mb-1.5">Why it appears / how it's contained</p>
        <p class="text-sm text-white/60 leading-relaxed">
          It only appears at all when "enabled" is on and you've saved. When it renders, it's placed inside a sandboxed <code class="text-gold-300 bg-white/5 px-1 rounded">&lt;iframe&gt;</code> - a technique that deliberately walls the code off in its own mini-browser-tab-like box with no access to cookies, Firebase login sessions, guest RSVP data, or the rest of the page. That's what makes it safe to give this much freedom: even a mistake or a bad paste can only break the box itself, never leak data or deface the real app around it.
        </p>
      </div>
      <p class="text-xs text-white/40 flex items-center gap-1.5">
        <UIcon name="i-heroicons-arrow-down" class="w-3.5 h-3.5" />
        The "Live preview" panel below is the actual live view - it renders your unsaved draft in the exact same sandboxed box a real visitor gets, live as you type, so a separate View Live button isn't needed here.
      </p>
    </div>

    <div class="form-card space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="font-display text-lg">Custom Code</h2>
        <USwitch v-model="form.enabled" />
      </div>

      <UFormField label="Position on the invitation page">
        <USelect v-model="form.position" :items="[{ label: 'Bottom (after RSVP/Details buttons)', value: 'bottom' }, { label: 'Top (before the opening envelope)', value: 'top' }]" class="w-full" />
      </UFormField>

      <UFormField label="HTML">
        <UTextarea v-model="form.html" :rows="8" class="w-full font-mono text-sm" placeholder="<div>Your markup, including &lt;script&gt; tags if needed</div>" />
      </UFormField>

      <UFormField label="CSS">
        <UTextarea v-model="form.css" :rows="6" class="w-full font-mono text-sm" placeholder=".my-class { color: gold; }" />
      </UFormField>

      <div class="flex items-center gap-3">
        <UButton color="primary" icon="i-heroicons-check" size="lg" :loading="saving" @click="save">Save Custom Code</UButton>
        <button type="button" class="text-xs text-white/40 hover:text-white/70" @click="form = structuredClone(defaultCustomCode)">Clear</button>
      </div>
    </div>

    <div>
      <p class="text-xs font-semibold uppercase tracking-widest text-gold-200/70 mb-3 flex items-center gap-2">
        <UIcon name="i-heroicons-eye" class="w-4 h-4" /> Live preview (sandboxed, same as what visitors see)
      </p>
      <div v-if="!form.html.trim() && !form.css.trim()" class="empty-state">
        <p class="text-white/40 text-sm">Nothing to preview yet - add some HTML or CSS above.</p>
      </div>
      <iframe
        v-else
        :srcdoc="previewSrcdoc"
        sandbox="allow-scripts allow-popups"
        referrerpolicy="no-referrer"
        title="Custom code preview"
        class="preview-frame"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defaultCustomCode, type CustomCode } from '~/composables/useThemes'

const toast = useToast()
const { customCode, saveCustomCode } = useThemes()

const form = ref<CustomCode>(structuredClone(toRaw(customCode.value)))
watch(customCode, (v) => { form.value = structuredClone(toRaw(v)) }, { once: true })

const saving = ref(false)
async function save() {
  saving.value = true
  try {
    await saveCustomCode(structuredClone(toRaw(form.value)))
    toast.add({ title: 'Custom Code saved', description: form.value.enabled ? 'Now live on every wedding page.' : 'Saved but disabled - nothing renders yet.', color: 'success' })
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Could not save Custom Code', color: 'error' })
  } finally {
    saving.value = false
  }
}

// Same sandboxed-srcdoc shape as CustomCodeBlock.vue, bound to the unsaved
// draft so admin can see exactly what a visitor would see before saving.
const previewSrcdoc = computed(() => `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 12px; background: #04101f; color: #fff; font-family: system-ui, sans-serif; }
  * { box-sizing: border-box; }
  ${form.value.css}
</style>
</head>
<body>
${form.value.html}
</body>
</html>`)
</script>

<style scoped>
.form-card { border-radius: 1.25rem; padding: 1.5rem; background: linear-gradient(160deg, rgba(255,255,255,.035), rgba(255,255,255,.015)); border: 1px solid rgba(255,255,255,.1); }
.empty-state { padding: 1.5rem 1rem; border-radius: .85rem; border: 1px dashed rgba(255,255,255,.12); text-align:center; }
.preview-frame { width: 100%; min-height: 220px; border: 1px solid rgba(255,255,255,.1); border-radius: 1rem; background: #04101f; }
.explain-card { border-radius: 1rem; padding: 1.1rem 1.25rem; background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.16); }
</style>
