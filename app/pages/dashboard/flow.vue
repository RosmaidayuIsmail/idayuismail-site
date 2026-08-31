<template>
  <div class="h-full min-h-screen lg:h-[calc(100vh-6rem)] flex flex-col overflow-x-hidden">
    
    <div v-if="loading" class="flex-1 flex items-center">
      <PageSkeleton variant="page" />
    </div>

    <div v-else-if="!wedding" class="flex flex-col items-center justify-center flex-1 text-white/60 space-y-6">
      <div class="p-6 rounded-full bg-white/5 ring-1 ring-white/10 mb-2">
        <UIcon name="i-heroicons-clock" class="w-12 h-12" style="color: rgba(227, 176, 74, 0.5);" />
      </div>
      <p class="text-lg">You haven't created your wedding card yet.</p>
      <UButton to="/dashboard" size="lg" color="primary" class="font-semibold shadow-lg shadow-gold-500/20">Go create it</UButton>
    </div>

    <div v-else class="flex-1 min-h-0 flex flex-col mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-4">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0 pt-4 lg:pt-0">
        <div>
          <h1 class="text-3xl sm:text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-100 via-gold-300 to-gold-500 tracking-tight">
            {{ dayFlowSettings.pageTitle }}
          </h1>
          <p class="text-sm text-white/50 mt-1 flex items-center gap-2">
            <UIcon name="i-heroicons-sparkles" class="w-4 h-4" style="color: #e3b04a;" />
            {{ dayFlowSettings.pageDescription }}
          </p>
        </div>
        
        <div class="flex items-center gap-3">
          <span v-if="savedAt" class="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
            <UIcon name="i-heroicons-check-circle" class="w-4 h-4" /> Saved
          </span>
          <UButton 
            size="lg" 
            color="primary" 
            class="font-semibold shadow-xl shadow-gold-500/20 transition-all hover:-translate-y-0.5 hover:shadow-gold-500/30 w-full sm:w-auto" 
            :loading="saving" 
            @click="save"
          >
            Save changes
          </UButton>
        </div>
      </div>

      <!-- Fully Mobile-Responsive Dual Pane Setup -->
      <div class="flex-1 flex flex-col lg:flex-row gap-8 xl:gap-12 lg:min-h-0">
        
        <!-- Left Column: Controls & List -->
        <div class="flex-1 w-full lg:overflow-y-auto custom-scrollbar lg:pr-6 pb-8 lg:pb-20 space-y-6 order-2 lg:order-1">
          
          <!-- Ready-Made Templates Panel -->
          <div class="form-panel animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="flex items-center justify-between mb-4 border-b border-gray-700 pb-3">
              <h2 class="text-base font-semibold text-white flex items-center gap-2">
                <UIcon name="i-heroicons-bolt" style="color: #e3b04a;" class="w-5 h-5" />
                Quick Start Presets
              </h2>
            </div>
            <p class="text-xs text-gray-400 mb-4">Choose a ready-made template to auto-fill your timeline, then edit it below.</p>
            <div class="flex flex-wrap gap-3">
              <UButton
                v-for="preset in allDayFlowPresets"
                :key="preset.id"
                variant="soft" 
                color="gray"
                class="hover:bg-gray-800 border border-gray-700 transition-colors"
                @click="applyPreset(preset.items)"
              >
                {{ preset.label }}
              </UButton>
            </div>
          </div>

          <!-- Details Page Style: 'classic' (today's auto-advancing
               slideshow) vs 'menu' (tabbed, restaurant-menu-style browsing
               layout) for the guest-facing /w/[slug]/details page. Only
               shows the styles Platform Admin has enabled - see
               enabledDetailsLayoutStyles in useThemes.ts. -->
          <div v-if="enabledDetailsLayoutStyles.length > 1" class="form-panel animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 class="text-base font-semibold text-white mb-1 flex items-center gap-2">
              <UIcon name="i-heroicons-swatch" style="color: #e3b04a;" class="w-5 h-5" />
              Details Page Style
            </h2>
            <p class="text-xs text-gray-400 mb-4">Choose how your guests browse the Details page - Event Flow, Menu, and every other section below.</p>
            <div class="grid sm:grid-cols-2 gap-3">
              <button
                v-for="style in enabledDetailsLayoutStyles"
                :key="style.value"
                type="button"
                class="layout-style-card"
                :class="{ 'layout-style-card-active': layoutStyle === style.value }"
                @click="layoutStyle = style.value as 'classic' | 'menu'"
              >
                <UIcon :name="style.icon" class="w-5 h-5" />
                <span class="text-sm font-medium">{{ style.label }}</span>
              </button>
            </div>
          </div>

          <!-- Wedding Menu: reception food items, shown as their own
               tappable section on the Details page once at least one dish
               is added - inspired by a restaurant menu page. -->
          <div class="form-panel animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 class="text-base font-semibold text-white mb-4 border-b border-gray-700 pb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-book-open" style="color: #e3b04a;" class="w-5 h-5" />
              Wedding Menu
            </h2>
            <p class="text-xs text-gray-400 mb-4">Add your reception food/dishes, grouped by category (e.g. Appetizer, Main Course, Dessert). Appears as its own section on your Details page once you add at least one item.</p>

            <div class="grid sm:grid-cols-3 gap-3 mb-4">
              <UInput v-model="menuDraft.category" placeholder="Category (e.g. Main Course)" size="lg" icon="i-heroicons-tag" :ui="{ icon: { base: 'text-gold-400' } }" />
              <UInput v-model="menuDraft.name" placeholder="Dish name" size="lg" class="sm:col-span-2" />
            </div>
            <UInput v-model="menuDraft.description" placeholder="Optional short description" size="lg" class="w-full mb-4" />
            <UButton color="primary" icon="i-heroicons-plus" size="md" class="font-semibold shadow-md" @click="addMenuItem">
              Add Dish
            </UButton>

            <div v-if="menuItems.length" class="mt-5 space-y-2">
              <div v-for="(item, index) in menuItems" :key="item.id" class="flow-row group">
                <div class="flex-1 w-full space-y-2">
                  <div class="flex items-center gap-2">
                    <UInput v-model="item.category" size="xs" class="w-40 shrink-0 opacity-80" />
                    <UInput v-model="item.name" size="sm" class="flex-1 font-medium" />
                  </div>
                  <UInput v-model="item.description" size="xs" placeholder="Description..." class="w-full opacity-80" />
                </div>
                <UButton size="sm" variant="ghost" color="error" icon="i-heroicons-trash" class="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" @click="menuItems.splice(index, 1)" />
              </div>
            </div>
          </div>

          <!-- Add an Item Panel -->
          <div class="form-panel animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <h2 class="text-base font-semibold text-white mb-4 border-b border-gray-700 pb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-plus-circle" style="color: #e3b04a;" class="w-5 h-5" />
              Add Custom Event
            </h2>
            
            <div class="grid sm:grid-cols-[140px_1fr] gap-4 mb-4">
              <UInput v-model="draft.time" placeholder="e.g. 10:00 AM" size="lg" icon="i-heroicons-clock" :ui="{ icon: { base: 'text-gold-400' } }" />
              <UInput v-model="draft.title" placeholder="e.g. Akad Nikah Ceremony" size="lg" icon="i-heroicons-bookmark" :ui="{ icon: { base: 'text-gold-400' } }" />
            </div>
            <UInput v-model="draft.description" placeholder="Optional short description (e.g. Please arrive early for seating)" size="lg" class="w-full mb-4" />
            <UInput v-model="draft.location" placeholder="Optional venue / hall name (e.g. Dewan Utama)" size="lg" icon="i-heroicons-map-pin" :ui="{ icon: { base: 'text-gold-400' } }" class="w-full mb-4" />
            <div class="flex items-center justify-between gap-4">
              <label class="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none">
                <UCheckbox v-model="draft.highlight" />
                Mark as key moment
              </label>
              <UButton color="primary" icon="i-heroicons-plus" size="md" class="font-semibold shadow-md" @click="addItem">
                Add to Timeline
              </UButton>
            </div>
          </div>

          <!-- Current Flow List -->
          <div>
            <h3 class="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3 ml-1">Your Timeline</h3>
            <div v-if="items.length === 0" class="text-center text-gray-500 py-12 bg-[#111827] border border-dashed border-gray-700 rounded-2xl">
              <UIcon name="i-heroicons-queue-list" class="w-10 h-10 mx-auto mb-2 opacity-50" />
              No items yet — add your first event above or use a preset.
            </div>
            
            <div v-else class="space-y-3">
              <TransitionGroup name="list">
                <div v-for="(item, index) in items" :key="item.id" class="flow-row group" :class="{ 'flow-row-highlight': item.highlight }">
                  <div class="flex flex-col gap-1 shrink-0 bg-gray-800/50 rounded-lg p-1">
                    <UButton size="2xs" variant="ghost" color="gray" icon="i-heroicons-chevron-up" :disabled="index === 0" class="hover:text-gold-400" @click="move(index, -1)" />
                    <UButton size="2xs" variant="ghost" color="gray" icon="i-heroicons-chevron-down" :disabled="index === items.length - 1" class="hover:text-gold-400" @click="move(index, 1)" />
                  </div>

                  <!-- Editable Inline Fields -->
                  <div class="flex flex-col sm:flex-row flex-1 gap-4 items-start sm:items-center">
                    <UInput v-model="item.time" size="sm" class="w-28 shrink-0 font-medium" />
                    <div class="flex-1 w-full space-y-2">
                      <UInput v-model="item.title" size="sm" class="w-full font-medium" />
                      <UInput v-model="item.description" size="xs" placeholder="Description..." class="w-full opacity-80" />
                      <UInput v-model="item.location" size="xs" placeholder="Venue / hall (optional)..." icon="i-heroicons-map-pin" class="w-full opacity-80" />
                    </div>
                  </div>

                  <UButton
                    size="sm"
                    variant="ghost"
                    :color="item.highlight ? 'warning' : 'gray'"
                    icon="i-heroicons-star"
                    :title="item.highlight ? 'Unmark key moment' : 'Mark as key moment'"
                    class="shrink-0"
                    :class="item.highlight ? '' : 'opacity-0 group-hover:opacity-100 transition-opacity'"
                    @click="item.highlight = !item.highlight"
                  />
                  <UButton size="sm" variant="ghost" color="error" icon="i-heroicons-trash" class="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" @click="removeItem(index)" />
                </div>
              </TransitionGroup>
            </div>
          </div>
          
        </div>

        <!-- Right Column: Live Mobile Preview -->
        <div class="w-full lg:w-[360px] xl:w-[400px] shrink-0 flex flex-col items-center pb-8 lg:pb-0 overflow-y-auto hide-scrollbar order-1 lg:order-2">
          <div class="flex items-center justify-between w-full mb-4 px-2">
            <p class="text-xs font-semibold uppercase tracking-widest text-gold-200/70 flex items-center gap-2">
              <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4" /> Mobile Preview
            </p>
            <UButton variant="link" color="gray" size="xs" :to="wedding ? `/w/${wedding.slug}/details` : undefined" target="_blank" external padded={false}>
              Open Live <UIcon name="i-heroicons-arrow-top-right-on-square" class="ml-1 w-3 h-3"/>
            </UButton>
          </div>
          
          <!-- Smartphone Mockup Wrapper -->
          <div class="phone-bezel w-full max-w-[360px] shadow-2xl shrink-0">
            <div class="phone-notch"></div>
            
            <!-- Themed Phone Screen -->
            <div class="phone-screen hide-scrollbar relative flex flex-col p-6" :style="styleVars">
              <div class="absolute inset-0 z-0 bg-gradient-to-b" :style="{ background: 'linear-gradient(160deg, var(--theme-bg-from), var(--theme-bg-via), var(--theme-bg-to))' }"></div>
              
              <!-- PHOTO AND ORNAMENT TO FLOW PREVIEW -->
              <div v-if="wedding?.content.coverPhotoUrl" class="absolute inset-0 z-0 opacity-40">
                <img :src="wedding.content.coverPhotoUrl" class="w-full h-full object-cover" />
                <div class="absolute inset-0" :style="{ background: `linear-gradient(to bottom, transparent, var(--theme-bg-to))` }"></div>
              </div>
              <CardOrnament v-if="wedding?.content.ornamentStyle" :style="wedding.content.ornamentStyle" color="var(--theme-accent)" class="z-0" />

              <!-- Content mirroring the guest 'details.vue' view -->
              <div class="relative z-10 w-full flex-1 pt-12 bg-ink-900/40 backdrop-blur-xl border border-white/10 rounded-[1.5rem] mt-6 px-4 py-8 shadow-xl">
                <h2 class="text-2xl mb-8 text-center drop-shadow-md" :style="{ color: 'var(--theme-accent)', fontFamily: 'var(--theme-heading-font)' }">Event Flow</h2>
                
                <!-- FIXED: v-else moved to wrapper div to prevent compile error -->
                <div v-if="items.length === 0" class="text-center text-sm opacity-50 mt-10 italic" :style="{ color: 'var(--theme-ink)' }">
                  Your timeline will appear here...
                </div>
                
                <!-- Re-using the exact component the guest sees -->
                <div v-else class="max-h-[400px] overflow-y-auto hide-scrollbar text-left">
                  <FlowTimeline :items="items" :style="{ color: 'var(--theme-ink)' }" class="w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FlowItem, MenuItem } from '~/composables/useWeddingTypes'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { wedding, loading, saving, updateFlow, updateMenu, updateContent } = useMyWedding()
const { themeStyleVars, allDayFlowPresets, dayFlowSettings, enabledDetailsLayoutStyles } = useThemes()
const toast = useToast()

const items = ref<FlowItem[]>([])
const draft = reactive({ time: '', title: '', description: '', location: '', highlight: false })
const savedAt = ref<number | null>(null)

// --- Wedding Menu (reception food) ---
const menuItems = ref<MenuItem[]>([])
const menuDraft = reactive({ category: '', name: '', description: '' })
function addMenuItem() {
  if (!menuDraft.name.trim()) {
    toast.add({ title: 'Please add a dish name', color: 'warning' })
    return
  }
  menuItems.value.push({
    id: `${Date.now()}`,
    category: menuDraft.category.trim() || 'Menu',
    name: menuDraft.name.trim(),
    description: menuDraft.description.trim()
  })
  menuDraft.category = ''
  menuDraft.name = ''
  menuDraft.description = ''
}

// --- Details Page Style ---
const layoutStyle = ref<'classic' | 'menu'>('classic')

// Computed styles to pass to the Live Preview so it matches the chosen theme perfectly
const styleVars = computed(() => {
  if (!wedding.value) return {}
  const c = wedding.value.content
  return themeStyleVars(
    wedding.value.themeId,
    { bgFrom: c.customBgFrom, bgTo: c.customBgTo, accent: c.customAccent },
    c.customFontFamily || c.fontFamily
  )
})

// Inject Google Font if custom one is used so preview renders correctly
useHead({
  link: computed(() => {
    if (wedding.value?.content.customFontUrl && !wedding.value.content.customFontUrl.includes('fonts.google.com/specimen/')) {
      return [{ rel: 'stylesheet', href: wedding.value.content.customFontUrl }]
    }
    return []
  })
})

// Ready-made templates now come from the shared platform catalog
// (app/composables/useThemes.ts) - allDayFlowPresets combines the built-in
// two with anything admin has added in Platform Admin > Day Flow.

let initialized = false
watch(
  wedding,
  (value) => {
    if (!value || initialized) return
    initialized = true
    items.value = [...value.flow]
    menuItems.value = [...(value.menu || [])]
    layoutStyle.value = value.content.detailsLayoutStyle === 'menu' ? 'menu' : 'classic'
  },
  { immediate: true }
)

function applyPreset(presetItems: Omit<FlowItem, 'id'>[]) {
  if (items.value.length > 0) {
    if (!confirm('This will replace your current timeline events. Do you want to continue?')) return
  }
  items.value = presetItems.map((item, index) => ({
    id: `${Date.now()}-${index}`,
    ...item
  }))
  toast.add({ title: 'Template applied', color: 'success' })
}

function addItem() {
  if (!draft.title.trim() || !draft.time.trim()) {
    toast.add({ title: 'Please add both a time and a title', color: 'warning' })
    return
  }
  items.value.push({
    id: `${Date.now()}`,
    time: draft.time.trim(),
    title: draft.title.trim(),
    description: draft.description.trim(),
    location: draft.location.trim(),
    highlight: draft.highlight
  })
  draft.time = ''
  draft.title = ''
  draft.description = ''
  draft.location = ''
  draft.highlight = false
}

function removeItem(index: number) {
  items.value.splice(index, 1)
}

function move(index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= items.value.length) return
  const copy = [...items.value]
  ;[copy[index], copy[target]] = [copy[target]!, copy[index]!]
  items.value = copy
}

async function save() {
  await Promise.all([
    updateFlow(items.value),
    updateMenu(menuItems.value),
    updateContent({ detailsLayoutStyle: layoutStyle.value })
  ])
  savedAt.value = Date.now()
  toast.add({ title: 'Wedding day flow saved', color: 'success' })
  setTimeout(() => { savedAt.value = null }, 3000)
}

useSeoMeta({ title: 'Day Flow — WeddingCard' })
</script>

<style scoped>
/* Glassmorphic Form Panels */
.form-panel {
  border-radius: 1.25rem;
  padding: 1.5rem;
  background: #111827; 
  border: 1px solid #374151; 
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
}

.panel-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #374151;
}

/* List Rows - Upgraded for inline editing */
.flow-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  background: #1F2937;
  border: 1px solid #374151;
  transition: all 0.3s ease;
}

.flow-row:hover {
  background: #374151;
  border-color: rgba(212, 160, 23, 0.3);
}

.flow-row-highlight {
  border-color: rgba(212, 160, 23, 0.4);
  box-shadow: inset 0 0 0 1px rgba(212, 160, 23, 0.15);
}

.layout-style-card {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
  border-radius: 0.9rem;
  background: #1F2937;
  border: 1px solid #374151;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.2s ease;
}
.layout-style-card:hover {
  border-color: rgba(212, 160, 23, 0.3);
  color: white;
}
.layout-style-card-active {
  border-color: #d4a017;
  background: rgba(212, 160, 23, 0.1);
  color: #f3ddaa;
}

/* Smartphone Bezel - Fixed Height Fix */
.phone-bezel {
  position: relative;
  height: 720px; 
  background: #000;
  border: 12px solid #1e293b;
  border-radius: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 2px rgba(255, 255, 255, 0.05);
  overflow: hidden;
  transform: translateZ(0);
}

.phone-notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40%;
  height: 24px;
  background: #1e293b;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
  z-index: 50;
  box-shadow: inset 0 -1px 1px rgba(255,255,255,0.05);
}

.phone-screen {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  background: #111;
}

/* List Transition */
.list-enter-active, .list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Scrollbars */
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #374151; 
  border-radius: 10px;
}
</style>