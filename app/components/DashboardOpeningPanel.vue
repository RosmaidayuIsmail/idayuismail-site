<template>
  <div class="h-full min-h-screen lg:h-[calc(100vh-6rem)] flex flex-col overflow-x-hidden">
    
    <div v-if="loading" class="flex flex-col items-center justify-center flex-1 text-white/60 space-y-4">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" style="color: #e3b04a;" />
      <p class="animate-pulse tracking-widest uppercase text-xs">Loading Studio...</p>
    </div>

    <div v-else-if="!wedding" class="flex flex-col items-center justify-center flex-1 text-white/60 space-y-6">
      <div class="p-6 rounded-full bg-white/5 ring-1 ring-white/10 mb-2">
        <UIcon name="i-heroicons-envelope-open" class="w-12 h-12" style="color: rgba(227, 176, 74, 0.5);" />
      </div>
      <p class="text-lg">You haven't created your wedding card yet.</p>
      <UButton to="/dashboard" size="lg" color="primary" class="font-semibold shadow-lg shadow-gold-500/20">Go create it</UButton>
    </div>

    <div v-else class="flex-1 min-h-0 flex flex-col mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-4">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0 pt-4 lg:pt-0">
        <div>
          <h1 class="text-3xl sm:text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-100 via-gold-300 to-gold-500 tracking-tight">
            Opening Design
          </h1>
          <p class="text-sm text-white/50 mt-1 flex items-center gap-2">
            <UIcon name="i-heroicons-envelope-open" class="w-4 h-4" style="color: #e3b04a;" />
            Design the first thing your guests see when they click your link.
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
            @click="saveContent"
          >
            Save changes
          </UButton>
        </div>
      </div>

      <div class="flex-1 flex flex-col lg:flex-row gap-8 xl:gap-12 lg:min-h-0">
        
        <!-- Left Column: Controls -->
        <div class="flex-1 w-full lg:overflow-y-auto custom-scrollbar lg:pr-6 pb-8 lg:pb-20 space-y-8 order-2 lg:order-1">
          
          <div class="space-y-8 form-panel animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div>
              <h3 class="text-sm font-semibold text-white mb-3">Page Layout</h3>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  class="ornament-card group"
                  :class="{ 'ornament-card-active': (form.layoutStyle || 'classic') === 'classic' }"
                  @click="form.layoutStyle = 'classic'"
                >
                  <div class="h-12 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity"
                       :style="{ color: (form.layoutStyle || 'classic') === 'classic' ? '#e3b04a' : 'currentColor' }">
                    <UIcon name="i-heroicons-document-duplicate" class="w-6 h-6 drop-shadow" />
                  </div>
                  <span class="text-xs font-medium">Classic Pages</span>
                  <UIcon v-if="(form.layoutStyle || 'classic') === 'classic'" name="i-heroicons-check-circle" class="absolute top-2 right-2 w-4 h-4 text-current" />
                </button>
                <button
                  type="button"
                  class="ornament-card group"
                  :class="{ 'ornament-card-active': form.layoutStyle === 'story' }"
                  @click="form.layoutStyle = 'story'"
                >
                  <div class="h-12 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity"
                       :style="{ color: form.layoutStyle === 'story' ? '#e3b04a' : 'currentColor' }">
                    <UIcon name="i-heroicons-arrows-up-down" class="w-6 h-6 drop-shadow" />
                  </div>
                  <span class="text-xs font-medium">Scrolling Story</span>
                  <UIcon v-if="form.layoutStyle === 'story'" name="i-heroicons-check-circle" class="absolute top-2 right-2 w-4 h-4 text-current" />
                </button>
              </div>
              <p class="text-xs text-white/40 mt-2">
                {{ form.layoutStyle === 'story' ? 'Guests scroll through one continuous page - cover, couple, details, and RSVP all flow together.' : 'Guests move through separate Opening, Details, and RSVP pages (today\'s default).' }}
              </p>
            </div>

            <!-- Cover Style Selector -->
            <div>
              <h3 class="text-sm font-semibold text-white mb-3">Cover Layout Style</h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  v-for="opt in openingStyles"
                  :key="opt.value"
                  type="button"
                  class="ornament-card group"
                  :class="{ 'ornament-card-active': form.openingStyle === opt.value }"
                  @click="form.openingStyle = opt.value"
                >
                  <div class="h-12 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity"
                       :style="{ color: form.openingStyle === opt.value ? '#e3b04a' : 'currentColor' }">
                    <UIcon :name="opt.icon" class="w-6 h-6 drop-shadow" />
                  </div>
                  <span class="text-[10px] sm:text-xs font-medium text-center px-1">{{ opt.label }}</span>
                  <UIcon v-if="form.openingStyle === opt.value" name="i-heroicons-check-circle" class="absolute top-2 right-2 w-4 h-4 text-current" />
                </button>
              </div>
            </div>

            <Transition name="fade-down">
              <div v-if="form.openingStyle === 'modern-dark'" class="p-5 rounded-xl bg-[#111827] border border-gray-700 space-y-3">
                <h3 class="text-sm font-semibold text-white">Modern Dark Palette</h3>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    v-for="palette in modernDarkPaletteCatalog"
                    :key="palette.id"
                    type="button"
                    class="palette-swatch"
                    :class="{ 'palette-swatch-active': (form.openingModernDarkPalette || modernDarkPaletteCatalog[0].id) === palette.id }"
                    @click="form.openingModernDarkPalette = palette.id"
                  >
                    <span class="palette-swatch-dot" :style="{ background: palette.swatch }" />
                    <span class="text-xs">{{ palette.label }}</span>
                  </button>
                </div>
              </div>
              <div v-else-if="form.openingStyle === 'minimal-light'" class="p-5 rounded-xl bg-[#111827] border border-gray-700 space-y-3">
                <h3 class="text-sm font-semibold text-white">Minimal Light Palette</h3>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    v-for="palette in minimalLightPaletteCatalog"
                    :key="palette.id"
                    type="button"
                    class="palette-swatch"
                    :class="{ 'palette-swatch-active': (form.openingMinimalLightPalette || minimalLightPaletteCatalog[0].id) === palette.id }"
                    @click="form.openingMinimalLightPalette = palette.id"
                  >
                    <span class="palette-swatch-dot" :style="{ background: palette.swatch }" />
                    <span class="text-xs">{{ palette.label }}</span>
                  </button>
                </div>
              </div>
            </Transition>

            <!-- Cover Picture Upload -->
            <Transition name="fade-down">
              <div v-if="showOpeningBgUpload" class="p-5 rounded-xl bg-indigo-900/20 border border-indigo-800 space-y-4">
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-indigo-800/40 shrink-0">
                    <UIcon name="i-heroicons-paint-brush" class="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-white">{{ openingBgPanelCopy.title }}</p>
                    <p class="text-xs text-gray-400">{{ openingBgPanelCopy.description }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <div v-if="form.openingBgUrl" class="w-16 h-24 rounded-lg overflow-hidden border border-gray-700 shrink-0 shadow-md">
                    <img :src="form.openingBgUrl" class="w-full h-full object-cover" />
                  </div>
                  <div class="flex flex-col gap-2">
                    <input ref="openingBgInput" type="file" accept="image/*" class="hidden" @change="handleOpeningBgSelect">
                    <div class="flex flex-wrap gap-2">
                      <UButton size="sm" variant="soft" color="gray" icon="i-heroicons-arrow-up-tray" :loading="openingBgUploading" :disabled="!cloudinaryConfigured" @click="openingBgInput?.click()">
                        {{ form.openingBgUrl ? 'Change Background' : 'Upload Image' }}
                      </UButton>
                      <UButton v-if="form.openingBgUrl" size="sm" variant="ghost" color="error" icon="i-heroicons-trash" @click="form.openingBgUrl = ''" />
                    </div>
                  </div>
                </div>
              </div>
            </Transition>

            <!-- Remove Dark Overlay Toggle -->
            <Transition name="fade-down">
              <div v-if="showOpeningBgUpload" class="p-5 rounded-xl bg-gold-400/5 border border-gold-400/30 space-y-4 mt-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-semibold text-gold-300 mb-1">Remove Dark Shadow / Gradient</h3>
                    <p class="text-xs text-gray-400 max-w-[320px]">Turn this on to disable the automatic dark gradient over your image, keeping your pastel colors bright and clean.</p>
                  </div>
                  <button
                    type="button"
                    @click="form.openingRemoveOverlay = !form.openingRemoveOverlay"
                    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#e3b04a] focus:ring-offset-2 focus:ring-offset-[#111827]"
                    :class="form.openingRemoveOverlay ? 'bg-[#e3b04a]' : 'bg-gray-700'"
                  >
                    <span
                      aria-hidden="true"
                      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                      :class="form.openingRemoveOverlay ? 'translate-x-5' : 'translate-x-0'"
                    />
                  </button>
                </div>
              </div>
            </Transition>

            <Transition name="fade-down">
              <div v-if="showOpeningBgUpload" class="p-5 rounded-xl bg-gold-400/5 border border-gold-400/30 space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-semibold text-gold-300 mb-1">Use Image As-Is</h3>
                    <p class="text-xs text-gray-400 max-w-[320px]">Turn this on to completely hide our title/guest-name/tap text on this screen and show your uploaded image in full, uncropped and undimmed. Perfect if you designed everything directly in Canva.</p>
                  </div>
                  <button
                    type="button"
                    @click="form.openingHideText = !form.openingHideText"
                    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#e3b04a] focus:ring-offset-2 focus:ring-offset-[#111827]"
                    :class="form.openingHideText ? 'bg-[#e3b04a]' : 'bg-gray-700'"
                  >
                    <span
                      aria-hidden="true"
                      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                      :class="form.openingHideText ? 'translate-x-5' : 'translate-x-0'"
                    />
                  </button>
                </div>

                <div v-if="!form.openingHideText">
                  <p class="text-xs text-gray-400 mb-2">Text Position</p>
                  <div class="grid grid-cols-3 gap-2">
                    <button
                      v-for="opt in [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]"
                      :key="opt.value"
                      type="button"
                      class="p-2 rounded-lg border text-xs font-medium transition-colors"
                      :class="(form.openingTextAlign || 'center') === opt.value ? 'border-gold-400 bg-gold-400/10 text-gold-200' : 'border-gray-700 text-gray-400 hover:border-gray-600'"
                      @click="form.openingTextAlign = opt.value"
                    >
                      {{ opt.label }}
                    </button>
                  </div>
                </div>
              </div>
            </Transition>

            <!-- Background Music -->
            <div class="pt-6 border-t border-gray-800">
              <h3 class="text-sm font-semibold text-white mb-1">Background Music</h3>
              <p class="text-xs text-gray-400 mb-4">Plays as soon as a guest opens the envelope. Leave empty for a silent opening.</p>
              <div class="flex items-center gap-3 flex-wrap">
                <input ref="audioInput" type="file" accept="audio/*" class="hidden" @change="handleAudioSelect">
                <UButton size="sm" variant="soft" color="gray" icon="i-heroicons-arrow-up-tray" :loading="audioUploading" :disabled="!cloudinaryConfigured" @click="audioInput?.click()">
                  {{ form.audioSrc ? 'Change Track' : 'Upload Audio' }}
                </UButton>
                <MusicToggle v-if="form.audioSrc" :src="form.audioSrc" />
                <UButton v-if="form.audioSrc" size="sm" variant="ghost" color="error" icon="i-heroicons-trash" @click="form.audioSrc = ''" />
              </div>
              <UFormField label="Or paste a song link — YouTube, YouTube Music, or a direct audio URL" class="mt-3">
                <UInput v-model="form.audioSrc" placeholder="https://music.youtube.com/watch?v=... or https://.../song.mp3" class="w-full" />
              </UFormField>
            </div>

            <!-- Language Translation Presets -->
            <div class="pt-6 border-t border-gray-800">
              <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 class="text-sm font-semibold text-white">Opening Text Settings</h3>
                <div class="flex flex-wrap bg-gray-900 border border-gray-700 rounded-full p-1 gap-0.5">
                  <button v-for="preset in allTextPresets" :key="preset.id" type="button" @click="applyTranslation(preset)" class="px-3 py-1 text-xs font-medium rounded-full transition-colors hover:bg-gray-800 hover:text-white text-gray-400">{{ preset.label }}</button>
                </div>
              </div>

              <div class="space-y-4">
                <UFormField label="Main Title">
                  <UInput v-model="form.openingTitle" placeholder="e.g. Walimatul Urus" size="lg" class="w-full" />
                </UFormField>
                <button type="button" class="text-xs text-gold-300 hover:text-gold-200 flex items-center gap-1" @click="showTitleStyle = !showTitleStyle">
                  <UIcon :name="showTitleStyle ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'" class="w-3.5 h-3.5" /> Customize font, size, color &amp; boldness
                </button>
                <div v-if="showTitleStyle" class="p-4 rounded-xl bg-[#111827] border border-gray-700 space-y-4">
                  <TextStyleFields prefix="openingTitle" :form="form" :font-select-items="fontSelectItems" />
                </div>

                <UFormField label="Guest Greeting">
                  <UInput v-model="form.openingGreeting" placeholder="e.g. Menjemput {guestName} sekeluarga" size="lg" class="w-full" />
                  <template #help><span class="text-xs text-gray-500">Use <code class="text-gold-300">{guestName}</code> anywhere in the sentence.</span></template>
                </UFormField>
                
                <UFormField label="Guest Name Style">
                  <div class="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2">
                    <button
                      v-for="opt in guestNameBoxOptions"
                      :key="opt.value"
                      type="button"
                      class="flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-colors"
                      :class="form.openingGuestNameBox === opt.value ? 'border-gold-400 bg-gold-400/10' : 'border-gray-700 hover:border-gray-600'"
                      @click="form.openingGuestNameBox = opt.value"
                    >
                      <div class="w-full h-10 rounded flex items-center justify-center bg-[#1a1f2e]">
                        <UIcon v-if="opt.value === 'custom'" name="i-heroicons-arrow-up-tray" class="w-4 h-4 text-gray-400" />
                        <span v-else class="gn-preview text-[9px] text-white px-2" :class="`gn-preview-${opt.value}`">Name</span>
                      </div>
                      <span class="text-[10px] text-gray-400">{{ opt.label }}</span>
                    </button>
                  </div>
                </UFormField>

                <Transition name="fade-down">
                  <div v-if="form.openingGuestNameBox === 'custom'" class="p-5 rounded-xl bg-indigo-900/20 border border-indigo-800 space-y-4">
                    <div class="flex items-center gap-3">
                      <div class="p-2 rounded-lg bg-indigo-800/40 shrink-0">
                        <UIcon name="i-heroicons-photo" class="w-5 h-5 text-indigo-300" />
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-white">Upload your own design</p>
                        <p class="text-xs text-gray-400">A frame, ribbon, or box graphic to sit behind the guest's name.</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-4">
                      <div v-if="form.openingGuestNameBoxImageUrl" class="w-24 h-16 rounded-lg overflow-hidden border border-gray-700 shrink-0 shadow-md bg-[#111827]">
                        <img :src="form.openingGuestNameBoxImageUrl" class="w-full h-full object-contain" />
                      </div>
                      <div class="flex flex-col gap-2">
                        <input ref="guestNameBoxInput" type="file" accept="image/*" class="hidden" @change="handleGuestNameBoxSelect">
                        <div class="flex flex-wrap gap-2">
                          <UButton size="sm" variant="soft" color="gray" icon="i-heroicons-arrow-up-tray" :loading="guestNameBoxUploading" :disabled="!cloudinaryConfigured" @click="guestNameBoxInput?.click()">
                            {{ form.openingGuestNameBoxImageUrl ? 'Change Image' : 'Upload Image' }}
                          </UButton>
                          <UButton v-if="form.openingGuestNameBoxImageUrl" size="sm" variant="ghost" color="error" icon="i-heroicons-trash" @click="form.openingGuestNameBoxImageUrl = ''" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Transition>

                <!-- Guest Name Animation -->
                <div class="p-4 rounded-xl bg-[#111827] border border-gray-700 flex items-center justify-between gap-4">
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-white flex items-center gap-2">
                      <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-gold-300 shrink-0" />
                      Guest Name Animation
                    </p>
                    <p class="text-xs text-gray-400 mt-1">Let the guest's name unroll into view like a scroll.</p>
                  </div>
                  <USwitch v-model="form.openingGuestNameAnimate" size="lg" />
                </div>

                <button type="button" class="text-xs text-gold-300 hover:text-gold-200 flex items-center gap-1" @click="showGreetingStyle = !showGreetingStyle">
                  <UIcon :name="showGreetingStyle ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'" class="w-3.5 h-3.5" /> Customize font for the text before the name
                </button>
                <div v-if="showGreetingStyle" class="p-4 rounded-xl bg-[#111827] border border-gray-700 space-y-4">
                  <TextStyleFields prefix="openingGreeting" :form="form" :font-select-items="fontSelectItems" />
                </div>

                <button type="button" class="text-xs text-gold-300 hover:text-gold-200 flex items-center gap-1" @click="showGuestNameStyle = !showGuestNameStyle">
                  <UIcon :name="showGuestNameStyle ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'" class="w-3.5 h-3.5" /> Customize font for the guest's name itself
                </button>
                <div v-if="showGuestNameStyle" class="p-4 rounded-xl bg-[#111827] border border-gray-700 space-y-4">
                  <TextStyleFields prefix="openingGuestName" :form="form" :font-select-items="fontSelectItems" />
                </div>

                <button type="button" class="text-xs text-gold-300 hover:text-gold-200 flex items-center gap-1" @click="showGreetingAfterStyle = !showGreetingAfterStyle">
                  <UIcon :name="showGreetingAfterStyle ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'" class="w-3.5 h-3.5" /> Customize font for the text after the name
                </button>
                <div v-if="showGreetingAfterStyle" class="p-4 rounded-xl bg-[#111827] border border-gray-700 space-y-4">
                  <TextStyleFields prefix="openingGreetingAfter" :form="form" :font-select-items="fontSelectItems" />
                </div>

                <UFormField label="Action Button Text">
                  <UInput v-model="form.openingActionText" placeholder="e.g. Klik untuk buka" size="lg" class="w-full" />
                </UFormField>
                <button type="button" class="text-xs text-gold-300 hover:text-gold-200 flex items-center gap-1" @click="showActionStyle = !showActionStyle">
                  <UIcon :name="showActionStyle ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'" class="w-3.5 h-3.5" /> Customize font, size, color &amp; boldness
                </button>
                <div v-if="showActionStyle" class="p-4 rounded-xl bg-[#111827] border border-gray-700 space-y-4">
                  <TextStyleFields prefix="openingAction" :form="form" :font-select-items="fontSelectItems" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Live Mobile Preview of the ENVELOPE -->
        <div class="w-full lg:w-[360px] xl:w-[400px] shrink-0 flex flex-col items-center pb-8 lg:pb-0 overflow-y-auto hide-scrollbar order-1 lg:order-2">
          <div class="flex items-center justify-between w-full mb-4 px-2">
            <p class="text-xs font-semibold uppercase tracking-widest text-gold-200/70 flex items-center gap-2">
              <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4" /> Live Preview
            </p>
            <UButton variant="link" color="gray" size="xs" icon="i-heroicons-arrow-path" :padded="false" @click="previewOpened = false">
              Reset Preview
            </UButton>
          </div>

          <!-- Smartphone Mockup Wrapper -->
          <div class="phone-bezel w-full max-w-[360px] shadow-2xl shrink-0">
            <div class="phone-notch"></div>
            <div class="phone-screen hide-scrollbar relative bg-[#04101f]" :style="styleVars">
              <EnvelopeIntro v-model:opened="previewOpened" guest-name="Guest Name" :content="form" />
              <div v-if="previewOpened" class="absolute inset-0 flex items-center justify-center text-white/50 text-sm italic">
                (Inner card revealed)
              </div>
              <div v-if="previewOpened && form.audioSrc" class="absolute top-4 right-4 z-30">
                <MusicToggle :src="form.audioSrc" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createDefaultContent, type WeddingContent } from '~/composables/useWeddingTypes'
import type { TextPreset } from '~/composables/useThemes'

const props = defineProps<{ overrideWeddingId?: string | null }>()
const { wedding, loading, saving, updateContent } = useMyWedding(toRef(props, 'overrideWeddingId'))
const { isConfigured: cloudinaryConfigured, uploadImage, uploadAudio } = useCloudinary()
const { themeStyleVars, allFontOptions, allTextPresets, enabledOpeningStyles: openingStyles } = useThemes()

const fontSelectItems = computed(() => [
  { label: 'Auto (use theme default)', value: '' },
  ...allFontOptions.value.map((f) => ({ label: f.label, value: f.id }))
])

const showTitleStyle = ref(false)
const showGreetingStyle = ref(false)
const showGuestNameStyle = ref(false)

const guestNameBoxOptions: { value: WeddingContent['openingGuestNameBox']; label: string }[] = [
  { value: 'none', label: 'Plain' },
  { value: 'arch', label: 'Arch' },
  { value: 'pill', label: 'Oval' },
  { value: 'hexagon', label: 'Hexagon' },
  { value: 'ribbon', label: 'Ribbon' },
  { value: 'custom', label: 'Upload your own' }
]
const guestNameBoxInput = ref<HTMLInputElement | null>(null)
const guestNameBoxUploading = ref(false)

async function handleGuestNameBoxSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !wedding.value) return
  guestNameBoxUploading.value = true
  try {
    const url = await uploadImage(file, `weddings/${wedding.value.id}/opening`)
    form.openingGuestNameBoxImageUrl = url
    toast.add({ title: 'Guest name design uploaded', color: 'success' })
  } catch (error) {
    toast.add({ title: 'Upload failed', color: 'error' })
  } finally {
    guestNameBoxUploading.value = false
  }
  if (guestNameBoxInput.value) guestNameBoxInput.value.value = ''
}

const showGreetingAfterStyle = ref(false)
const showActionStyle = ref(false)
const toast = useToast()

const form = reactive<WeddingContent>(createDefaultContent())
const savedAt = ref<number | null>(null)
const previewOpened = ref(false)

const openingBgInput = ref<HTMLInputElement | null>(null)
const openingBgUploading = ref(false)

const audioInput = ref<HTMLInputElement | null>(null)
const audioUploading = ref(false)

async function handleAudioSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !wedding.value) return
  audioUploading.value = true
  try {
    const url = await uploadAudio(file, `weddings/${wedding.value.id}/audio`, file.name)
    form.audioSrc = url
    toast.add({ title: 'Background music uploaded', color: 'success' })
  } catch (error) {
    toast.add({ title: error instanceof Error ? error.message : 'Upload failed', color: 'error' })
  } finally {
    audioUploading.value = false
  }
  if (audioInput.value) audioInput.value.value = ''
}

const slideStyles = ['slide-up', 'slide-down', 'slide-left', 'slide-right']
const showOpeningBgUpload = computed(() =>
  form.openingStyle.includes('custom') || form.openingStyle === 'wax-seal' || slideStyles.includes(form.openingStyle)
)

const openingBgPanelCopy = computed(() => {
  if (form.openingStyle === 'wax-seal') {
    return {
      title: 'Wax Seal Door Picture (optional)',
      description: 'Upload a vertical photo (1080x1920) to show behind the wax seal as it cracks open.'
    }
  }
  if (form.openingStyle === 'custom-split') {
    return {
      title: 'Split Door Background',
      description: 'Upload your own vertical design (1080x1920) - it\'s sliced in half and slides open like double doors.'
    }
  }
  if (slideStyles.includes(form.openingStyle)) {
    return {
      title: 'Slide Cover Picture (optional)',
      description: 'Upload a vertical photo (1080x1920) to use as the cover.'
    }
  }
  return {
    title: 'Custom Canva Background',
    description: 'Upload your own vertical design (1080x1920) to use as the opening background.'
  }
})

useHead({
  link: computed(() => {
    if (form.customFontUrl && !form.customFontUrl.includes('fonts.google.com/specimen/')) {
      return [{ rel: 'stylesheet', href: form.customFontUrl }]
    }
    return []
  })
})

const styleVars = computed(() => {
  if (!wedding.value) return {}
  return themeStyleVars(
    wedding.value.themeId,
    { bgFrom: form.customBgFrom, bgTo: form.customBgTo, accent: form.customAccent },
    form.customFontFamily || form.fontFamily
  )
})

function applyTranslation(preset: TextPreset) {
  form.openingTitle = preset.openingTitle
  form.openingGreeting = preset.openingGreeting
  form.openingActionText = preset.openingActionText
  toast.add({ title: 'Text presets applied', color: 'success' })
}

let initialized = false
watch(
  wedding,
  (value) => {
    if (!value || initialized) return
    initialized = true
    Object.assign(form, value.content)
    
    // Fallbacks
    if (!form.layoutStyle) form.layoutStyle = 'classic'
    if (!form.openingStyle) form.openingStyle = 'classic'
    if (!form.openingTitle) form.openingTitle = "You're Invited"
    if (!form.openingGreeting) form.openingGreeting = 'Dear'
    if (!form.openingActionText) form.openingActionText = 'Tap to open'
    if (!form.openingGuestNameBox) form.openingGuestNameBox = 'none'
    if (!form.openingTextAlign) form.openingTextAlign = 'center'
    if (form.openingRemoveOverlay === undefined) form.openingRemoveOverlay = false
  },
  { immediate: true }
)

async function saveContent() {
  await updateContent({ ...form })
  savedAt.value = Date.now()
  toast.add({ title: 'Opening Design saved', color: 'success' })
  setTimeout(() => { savedAt.value = null }, 3000)
}

async function handleOpeningBgSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !wedding.value) return
  openingBgUploading.value = true
  try {
    const url = await uploadImage(file, `weddings/${wedding.value.id}/opening`)
    form.openingBgUrl = url
    toast.add({ title: 'Opening background uploaded', color: 'success' })
  } catch (error) {
    toast.add({ title: 'Upload failed', color: 'error' })
  } finally {
    openingBgUploading.value = false
  }
  if (openingBgInput.value) openingBgInput.value.value = ''
}

useSeoMeta({ title: 'Opening Design — WeddingCard' })
</script>

<style scoped>
.gn-preview { 
  white-space: nowrap; 
}

.gn-preview-arch { 
  background: rgba(255, 255, 255, 0.08); 
  border: 1px solid rgba(255, 255, 255, 0.2); 
  border-radius: 50% 50% 2px 2px / 85% 85% 2px 2px; 
  padding-top: 3px; 
  padding-bottom: 1px; 
}

.gn-preview-pill { 
  background: rgba(255, 255, 255, 0.08); 
  border: 1px solid rgba(255, 255, 255, 0.2); 
  border-radius: 999px; 
  padding-top: 2px; 
  padding-bottom: 2px; 
}

.gn-preview-hexagon { 
  background: rgba(255, 255, 255, 0.1); 
  clip-path: polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%); 
  padding-top: 2px; 
  padding-bottom: 2px; 
  padding-left: 9px; 
  padding-right: 9px; 
}

.gn-preview-ribbon {
  background: #c9a876; 
  color: #1a1f2e !important;
  clip-path: polygon(0% 0%, 100% 0%, 100% 28%, 88% 50%, 100% 72%, 100% 100%, 0% 100%, 0% 72%, 12% 50%, 0% 28%);
  padding-top: 3px; 
  padding-bottom: 3px;
}

.form-panel { 
  border-radius: 1.25rem; 
  padding: 1.75rem; 
  background: #111827; 
  border: 1px solid #374151; 
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5); 
}

.panel-header { 
  margin-bottom: 1.5rem; 
  padding-bottom: 1rem; 
  border-bottom: 1px solid #374151; 
}

.ornament-card { 
  position: relative; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  padding: 1rem 0.5rem; 
  border-radius: 1rem; 
  background: #1F2937; 
  border: 1px solid #374151; 
  color: #9CA3AF; 
  transition: all 0.3s ease; 
}

.ornament-card:hover { 
  background: #374151; 
  border-color: rgba(212, 160, 23, 0.4); 
  color: white; 
}

.ornament-card-active { 
  background: rgba(212, 160, 23, 0.1); 
  border-color: var(--color-gold-400); 
  color: #f3ddaa; 
}

.palette-swatch { 
  display: flex; 
  align-items: center; 
  gap: 0.5rem; 
  padding: 0.5rem 0.75rem; 
  border-radius: 0.75rem; 
  background: #1F2937; 
  border: 1px solid #374151; 
  color: #9CA3AF; 
  transition: all 0.2s ease; 
}

.palette-swatch:hover { 
  border-color: rgba(212, 160, 23, 0.4); 
  color: white; 
}

.palette-swatch-active { 
  background: rgba(212, 160, 23, 0.1); 
  border-color: var(--color-gold-400); 
  color: #f3ddaa; 
}

.palette-swatch-dot { 
  width: 1rem; 
  height: 1rem; 
  border-radius: 50%; 
  border: 1px solid rgba(255, 255, 255, 0.25); 
  flex-shrink: 0; 
}

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
}

.fade-down-enter-active, 
.fade-down-leave-active { 
  transition: opacity 0.2s ease, 
  transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
}

.fade-down-enter-from, 
.fade-down-leave-to { 
  opacity: 0; 
  transform: translateY(-10px); 
}

.hide-scrollbar::-webkit-scrollbar { 
  display: none; 
}

.hide-scrollbar { 
  -ms-overflow-style: none; 
  scrollbar-width: none; 
}

.custom-scrollbar::-webkit-scrollbar { 
  width: 6px; 
}

.custom-scrollbar::-webkit-scrollbar-track { 
  background: transparent; 
}

.custom-scrollbar::-webkit-scrollbar-thumb { 
  background-color: #374151; 
  border-radius: 10px; 
}

</style>