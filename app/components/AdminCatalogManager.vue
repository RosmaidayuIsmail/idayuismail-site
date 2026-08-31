<template>
    <AdminSidePreview :mode="livePreviewMode">
    <div>
      <!-- THEMES -->
      <div v-if="section === 'themes'" class="space-y-6 animate-fade-up">
        <div class="explain-card">
          <p class="font-semibold text-sm text-gold-200 mb-1.5">Where this applies</p>
          <p class="text-sm text-white/60 leading-relaxed">
            Every theme here shows up as a pickable card in a couple's own Design Studio (<code class="text-gold-300 bg-white/5 px-1 rounded">/dashboard/editor</code>). The colours become the actual background/accent/text colours of their cover card and details page; the price is what they're charged to unlock it if it isn't free. Removing a theme here doesn't touch any couple already using it - it just stops appearing as a choice for anyone new.
          </p>        </div>
        <div>
          <div v-if="customThemes.length === 0" class="empty-state">
            <div class="p-4 rounded-full bg-white/5 ring-1 ring-white/10">
              <UIcon name="i-heroicons-swatch" class="w-7 h-7" style="color: rgba(227, 176, 74, 0.5);" />
            </div>
            <p class="text-white/50 text-sm">No custom themes added yet.</p>
          </div>
          <div v-else class="grid sm:grid-cols-2 gap-3">
            <div v-for="theme in customThemes" :key="theme.id" class="catalog-card group">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-xl shrink-0 border border-white/10 shadow-inner" :style="{ background: `linear-gradient(135deg, ${theme.palette.bgFrom}, ${theme.palette.bgTo})` }"></div>
                <div class="min-w-0 flex-1">
                  <p class="font-medium truncate">{{ theme.name }}</p>
                  <p class="text-xs text-white/40 truncate">{{ theme.price === 0 ? 'Free' : `RM ${theme.price}` }} &middot; {{ theme.headingFont }}</p>
                </div>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <UButton size="xs" variant="ghost" color="neutral" icon="i-heroicons-pencil-square" @click="startEditTheme(theme)" />
                  <UButton size="xs" variant="ghost" color="error" icon="i-heroicons-trash" :loading="removingId === theme.id" @click="removeTheme(theme.id)" />
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div class="form-card">
          <div class="flex items-center gap-3 mb-1">
            <div class="p-2 rounded-lg bg-gold-400/10">
              <UIcon :name="editingThemeId ? 'i-heroicons-pencil-square' : 'i-heroicons-plus'" class="w-4 h-4 text-gold-300" />
            </div>
            <p class="font-semibold">{{ editingThemeId || editingBuiltInThemeId ? `Editing "${themeForm.name || (editingBuiltInThemeId || editingThemeId)}"${editingBuiltInThemeId ? ' (built-in)' : ''}` : 'Add a new theme' }}</p>
            <button v-if="editingThemeId || editingBuiltInThemeId" type="button" class="text-xs text-white/40 hover:text-white/70 ml-auto" @click="cancelEditTheme">Cancel</button>
          </div>
  
          <div class="grid sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label class="field-label">Theme name</label>
              <UInput v-model="themeForm.name" placeholder="e.g. Coastal Breeze" size="lg" class="w-full" />
            </div>
            <div>
              <label class="field-label">Short tagline</label>
              <UInput v-model="themeForm.tagline" placeholder="e.g. Airy blues for a beachside wedding" size="lg" class="w-full" />
            </div>
            <div>
              <label class="field-label">Price (RM, 0 = free)</label>
              <UInput v-model.number="themeForm.price" type="number" min="0" size="lg" class="w-full" />
            </div>
            <div>
              <label class="field-label">Heading font</label>
              <USelect v-model="themeForm.headingFont" :items="fontSelectItems" size="lg" class="w-full" />
            </div>
          </div>
  
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
            <div v-for="field in colorFields" :key="field.key">
              <label class="field-label">{{ field.label }}</label>
              <div class="flex items-center gap-2">
                <input v-model="themeForm[field.key]" type="color" class="w-9 h-9 rounded-lg border border-white/20 bg-transparent shrink-0 cursor-pointer" />
                <UInput v-model="themeForm[field.key]" size="sm" class="w-full" />
              </div>
            </div>
          </div>
  
          <div class="flex items-center gap-3 mt-5">
            <UButton color="primary" :icon="editingThemeId ? 'i-heroicons-check' : 'i-heroicons-plus'" size="lg" class="font-semibold shadow-lg shadow-gold-500/20" :loading="addingTheme" :disabled="!canAddTheme" @click="submitTheme">
              {{ editingThemeId ? 'Save changes' : 'Add theme' }}
            </UButton>
            <p v-if="!canAddTheme" class="text-xs text-white/30">Give it a name to enable this button.</p>
          </div>
        </div>
  
        <div>
          <p class="section-heading">Built-in themes (editable)</p>
          <div class="grid sm:grid-cols-2 gap-2">
            <div v-for="theme in builtInThemesEffective" :key="theme.id" class="catalog-card group flex items-center gap-2">
              <div class="w-6 h-6 rounded shrink-0 border border-white/10" :style="{ background: `linear-gradient(135deg, ${theme.palette.bgFrom}, ${theme.palette.bgTo})` }"></div>
              <div class="min-w-0 flex-1">
                <p class="text-sm truncate">{{ theme.name }}</p>
                <p class="text-xs text-white/40">{{ theme.price === 0 ? 'Free' : `RM ${theme.price}` }}</p>
              </div>
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <UButton size="xs" variant="ghost" color="neutral" icon="i-heroicons-pencil-square" title="Edit built-in (price, name, colours)" @click="startEditBuiltInTheme(theme)" />
                <UButton size="xs" variant="ghost" color="neutral" icon="i-heroicons-arrow-path" title="Reset to built-in defaults" @click="resetBuiltInTheme(theme.id)" />
              </div>
            </div>
          </div>
          <p class="text-xs text-white/40 mt-2">Editing a built-in saves an override that applies everywhere - including the price couples are charged at checkout. Reset returns it to the shipped default.</p>
        </div>
      </div>
  
      <!-- FONTS -->
      <div v-if="section === 'fonts'" class="space-y-6 animate-fade-up">
        <div class="explain-card">
          <p class="font-semibold text-sm text-gold-200 mb-1.5">Where this applies</p>
          <p class="text-sm text-white/60 leading-relaxed">
            These are the fonts a couple can pick for their card's heading text (names, titles) in Design Studio, and for the Opening screen's title/greeting text. A font must be a real, published Google Fonts family name - it's loaded automatically, nothing to upload.
          </p>        </div>
        <div>
          <div v-if="customFonts.length === 0" class="empty-state">
            <div class="p-4 rounded-full bg-white/5 ring-1 ring-white/10">
              <UIcon name="i-heroicons-language" class="w-7 h-7" style="color: rgba(227, 176, 74, 0.5);" />
            </div>
            <p class="text-white/50 text-sm">No custom fonts added yet.</p>
          </div>
          <div v-else class="space-y-2">
            <div v-for="font in customFonts" :key="font.id" class="catalog-card group flex items-center justify-between">
              <div>
                <p class="font-medium">{{ font.label }}</p>
                <p class="text-xs text-white/40">{{ font.id }} &middot; {{ font.category }}</p>
              </div>
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <UButton size="xs" variant="ghost" color="neutral" icon="i-heroicons-pencil-square" @click="startEditFont(font)" />
                <UButton size="xs" variant="ghost" color="error" icon="i-heroicons-trash" :loading="removingId === font.id" @click="removeFont(font.id)" />
              </div>
            </div>
          </div>
        </div>
  
        <div class="form-card">
          <div class="flex items-center gap-3 mb-1">
            <div class="p-2 rounded-lg bg-gold-400/10">
              <UIcon :name="editingFontId ? 'i-heroicons-pencil-square' : 'i-heroicons-plus'" class="w-4 h-4 text-gold-300" />
            </div>
            <p class="font-semibold">{{ editingFontId ? `Editing "${fontForm.label || editingFontId}"` : 'Add a new font' }}</p>
            <button v-if="editingFontId" type="button" class="text-xs text-white/40 hover:text-white/70 ml-auto" @click="cancelEditFont">Cancel</button>
          </div>
  
          <div class="grid sm:grid-cols-3 gap-4 mt-4">
            <div class="sm:col-span-2">
              <label class="field-label">Google Font family name</label>
              <UInput v-model="fontForm.id" placeholder="e.g. Montserrat" size="lg" class="w-full" :disabled="!!editingFontId" />
            </div>
            <div>
              <label class="field-label">Category</label>
              <USelect v-model="fontForm.category" :items="['script', 'serif', 'sans']" size="lg" class="w-full" />
            </div>
          </div>
          <div class="mt-4">
            <label class="field-label">Display label</label>
            <UInput v-model="fontForm.label" placeholder="e.g. Montserrat (modern sans)" size="lg" class="w-full" />
          </div>
          <p class="text-xs text-white/40 mt-3">Loaded automatically via Google Fonts - make sure the family name is published there.</p>
          <div class="flex items-center gap-3 mt-4">
            <UButton color="primary" :icon="editingFontId ? 'i-heroicons-check' : 'i-heroicons-plus'" size="lg" class="font-semibold shadow-lg shadow-gold-500/20" :loading="addingFont" :disabled="!canAddFont" @click="submitFont">
              {{ editingFontId ? 'Save changes' : 'Add font' }}
            </UButton>
            <p v-if="!canAddFont" class="text-xs text-white/30">Enter a font family name to enable this button.</p>
          </div>
        </div>
  
        <div>
          <p class="section-heading">Built-in fonts (editable)</p>
          <div class="flex flex-wrap gap-2">
            <div v-for="font in builtInFontsEffective" :key="font.id" class="catalog-card group flex items-center gap-2 !py-1.5">
              <span class="text-xs">{{ font.label }}</span>
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <UButton size="xs" variant="ghost" color="neutral" icon="i-heroicons-pencil-square" @click="startEditBuiltInFont(font)" />
                <UButton size="xs" variant="ghost" color="neutral" icon="i-heroicons-arrow-path" @click="resetBuiltInFont(font.id)" />
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- TEXT PRESETS / LANGUAGES -->
      <div v-if="section === 'presets'" class="space-y-6 animate-fade-up">
        <div class="explain-card">
          <p class="font-semibold text-sm text-gold-200 mb-1.5">Where this applies</p>
          <p class="text-sm text-white/60 leading-relaxed">
            These are the one-click language/wording presets a couple sees on their Opening Design page (<code class="text-gold-300 bg-white/5 px-1 rounded">/dashboard/opening</code>) - clicking one fills in the title, greeting, and "tap to open" action text on their envelope screen. A couple can still hand-edit any of these words afterward; a preset just gives them a fast starting point.
          </p>        </div>
        <div>
          <p class="text-sm text-white/50 mb-4">Use <code class="text-gold-300 bg-white/5 px-1.5 py-0.5 rounded">{guestName}</code> as a placeholder in the greeting.</p>
  
          <div v-if="customPresets.length === 0" class="empty-state">
            <div class="p-4 rounded-full bg-white/5 ring-1 ring-white/10">
              <UIcon name="i-heroicons-language" class="w-7 h-7" style="color: rgba(227, 176, 74, 0.5);" />
            </div>
            <p class="text-white/50 text-sm">No custom presets added yet.</p>
          </div>
          <div v-else class="space-y-2">
            <div v-for="preset in customPresets" :key="preset.id" class="catalog-card group">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="font-medium">{{ preset.label }}</p>
                  <p class="text-xs text-white/40 mt-1.5">Title: "{{ preset.openingTitle }}"</p>
                  <p class="text-xs text-white/40">Greeting: "{{ preset.openingGreeting }}"</p>
                  <p class="text-xs text-white/40">Action: "{{ preset.openingActionText }}"</p>
                </div>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <UButton size="xs" variant="ghost" color="neutral" icon="i-heroicons-pencil-square" @click="startEditPreset(preset)" />
                  <UButton size="xs" variant="ghost" color="error" icon="i-heroicons-trash" :loading="removingId === preset.id" @click="removePreset(preset.id)" />
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div class="form-card">
          <div class="flex items-center gap-3 mb-1">
            <div class="p-2 rounded-lg bg-gold-400/10">
              <UIcon :name="editingPresetId ? 'i-heroicons-pencil-square' : 'i-heroicons-plus'" class="w-4 h-4 text-gold-300" />
            </div>
            <p class="font-semibold">{{ editingPresetId ? `Editing "${presetForm.label || editingPresetId}"` : 'Add a new preset / language' }}</p>
            <button v-if="editingPresetId" type="button" class="text-xs text-white/40 hover:text-white/70 ml-auto" @click="cancelEditPreset">Cancel</button>
          </div>
  
          <div class="space-y-4 mt-4">
            <div>
              <label class="field-label">Preset name</label>
              <UInput v-model="presetForm.label" placeholder="e.g. Indonesian" size="lg" class="w-full" />
            </div>
            <div>
              <label class="field-label">Opening title</label>
              <UInput v-model="presetForm.openingTitle" placeholder="e.g. Walimatul Urus" size="lg" class="w-full" />
            </div>
            <div>
              <label class="field-label">Greeting</label>
              <UInput v-model="presetForm.openingGreeting" placeholder="Use {guestName} as a placeholder" size="lg" class="w-full" />
            </div>
            <div>
              <label class="field-label">Action text</label>
              <UInput v-model="presetForm.openingActionText" placeholder="e.g. Tap to open" size="lg" class="w-full" />
            </div>
          </div>
          <div class="flex items-center gap-3 mt-5">
            <UButton color="primary" :icon="editingPresetId ? 'i-heroicons-check' : 'i-heroicons-plus'" size="lg" class="font-semibold shadow-lg shadow-gold-500/20" :loading="addingPreset" :disabled="!canAddPreset" @click="submitPreset">
              {{ editingPresetId ? 'Save changes' : 'Add preset' }}
            </UButton>
          </div>
        </div>
  
        <div>
          <p class="section-heading">Built-in presets / languages (editable)</p>
          <div class="flex flex-wrap gap-2">
            <div v-for="p in builtInPresetsEffective" :key="p.id" class="catalog-card group flex items-center gap-2 !py-1.5">
              <span class="text-xs">{{ p.label }}</span>
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <UButton size="xs" variant="ghost" color="neutral" icon="i-heroicons-pencil-square" @click="startEditBuiltInPreset(p)" />
                <UButton size="xs" variant="ghost" color="neutral" icon="i-heroicons-arrow-path" @click="resetBuiltInPreset(p.id)" />
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- OPENING STYLES -->
      <div v-if="section === 'opening-styles'" class="space-y-6 animate-fade-up">
        <div class="explain-card">
          <p class="font-semibold text-sm text-gold-200 mb-1.5">Where this applies</p>
          <p class="text-sm text-white/60 leading-relaxed">
            This is the "Cover Layout Style" picker on a couple's Opening Design page - it controls the animation a guest sees the moment they tap to open the invitation (envelope slide, wax seal crack, fade, etc). Turning one off here removes it from that picker for anyone choosing from now on; a couple already using it keeps it until they change it themselves.
          </p>        </div>
        <UAlert
          icon="i-heroicons-information-circle"
          color="info"
          variant="soft"
          title="These can be turned on/off, not authored"
          description="Each style is real animation code, not just data, so this list can't create a brand new one - but you can control exactly which of these couples are allowed to pick from."
        />
  
        <!-- This is documentation for editing the codebase, NOT a live form -
             nothing typed here runs anywhere. It exists so a developer (you,
             or whoever you hire) doesn't have to go dig up docs/adding-new-
             animations.md separately. -->
        <div class="dev-guide-card">
          <button type="button" class="dev-guide-toggle" @click="showDevGuide = !showDevGuide">
            <UIcon name="i-heroicons-code-bracket" class="w-4 h-4 text-indigo-300" />
            <span class="font-semibold">How to add a brand new one (for developers)</span>
            <UIcon :name="showDevGuide ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="w-4 h-4 ml-auto text-white/40" />
          </button>
  
          <div v-if="showDevGuide" class="px-5 pb-5 space-y-6">
            <p class="text-xs text-white/40 -mt-1">
              This edits the project's source code and needs a normal deploy to take effect - it isn't something you fill in here on the website. Full copy also lives at <code class="text-gold-300 bg-white/5 px-1 rounded">docs/adding-new-animations.md</code> in the repo.
            </p>
  
            <div>
              <p class="text-sm font-semibold text-gold-200 mb-3">Adding a new Opening Style animation</p>
              <div class="space-y-4">
                <div v-for="step in openingStyleSteps" :key="step.title">
                  <p class="text-sm font-medium text-white">{{ step.title }}</p>
                  <p v-if="step.file" class="text-xs font-mono text-indigo-300/80 mt-0.5">{{ step.file }}</p>
                  <p class="text-xs text-white/50 mt-1.5">{{ step.body }}</p>
                  <pre v-if="step.code" class="code-block">{{ step.code }}</pre>
                </div>
              </div>
            </div>
  
            <div>
              <p class="text-sm font-semibold text-gold-200 mb-3">Adding a new Falling Petals shape</p>
              <div class="space-y-4">
                <div v-for="step in petalSteps" :key="step.title">
                  <p class="text-sm font-medium text-white">{{ step.title }}</p>
                  <p class="text-xs font-mono text-indigo-300/80 mt-0.5">{{ step.file }}</p>
                  <p class="text-xs text-white/50 mt-1.5">{{ step.body }}</p>
                  <pre class="code-block">{{ step.code }}</pre>
                </div>
              </div>
              <p class="text-xs text-white/40 mt-3">It'll then appear automatically in both the couple's Design Studio picker and the Starter Defaults petal-style dropdown - both read from the same list.</p>
            </div>
  
            <p class="text-xs text-white/40">
              Same pattern applies to Names Layout Alignment and similar options elsewhere in Design Studio - each is CSS/layout logic, not data, so a new one means adding to the relevant options array plus a matching template branch.
            </p>
          </div>
        </div>
  
        <div class="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
          <div class="space-y-2">
            <div v-for="style in openingStyleCatalog" :key="style.value" class="catalog-card flex items-center justify-between" :class="{ 'catalog-card-previewing': previewStyle === style.value }">
              <button type="button" class="flex items-center gap-3 min-w-0 text-left" @click="setPreviewStyle(style.value)">
                <div class="p-2 rounded-lg shrink-0" :class="isStyleEnabled(style.value) ? 'bg-gold-400/10' : 'bg-white/5'">
                  <UIcon :name="style.icon" class="w-4 h-4" :style="{ color: isStyleEnabled(style.value) ? '#e3b04a' : 'rgba(255,255,255,0.35)' }" />
                </div>
                <span class="font-medium truncate" :class="isStyleEnabled(style.value) ? 'text-white' : 'text-white/40'">{{ style.label }}</span>
                <UIcon v-if="previewStyle === style.value" name="i-heroicons-eye" class="w-4 h-4 text-gold-300 shrink-0" />
              </button>
              <USwitch :model-value="isStyleEnabled(style.value)" :loading="togglingStyle === style.value" @update:model-value="(v: boolean) => toggleStyle(style.value, v)" />
            </div>
          </div>
  
          <!-- Live preview: a DEMO card, never a real couple's wedding. Click
               any style on the left to load it here; tap the phone to see it
               open, same interaction a couple would have. -->
          <div class="lg:sticky lg:top-6">
            <div class="flex items-center justify-between mb-3 px-1">
              <p class="text-xs font-semibold uppercase tracking-widest text-gold-200/70 flex items-center gap-2">
                <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4" /> Live Preview
              </p>
              <button type="button" class="text-xs text-white/40 hover:text-white/70" @click="previewOpened = false">Reset</button>
            </div>
            <div class="phone-bezel w-full max-w-[360px] mx-auto shadow-2xl">
              <div class="phone-notch"></div>
              <div class="phone-screen relative bg-[#04101f]" :style="previewStyleVars">
                <EnvelopeIntro v-model:opened="previewOpened" guest-name="Guest Name" :content="previewContent" />
                <div v-if="previewOpened" class="absolute inset-0 flex items-center justify-center text-white/50 text-sm italic px-6 text-center">
                  (This is where the couple's own details would appear)
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin-authored opening styles -->
        <div class="form-card">
          <div class="flex items-center gap-3 mb-1">
            <div class="p-2 rounded-lg bg-gold-400/10"><UIcon :name="editingConfigId ? 'i-heroicons-pencil-square' : 'i-heroicons-sparkles'" class="w-4 h-4 text-gold-300" /></div>
            <p class="font-semibold">{{ editingConfigId ? 'Edit opening style' : 'Create a new opening style' }}</p>
            <button v-if="editingConfigId" type="button" class="text-xs text-white/40 hover:text-white/70 ml-auto" @click="cancelEditConfig">Cancel</button>
          </div>
          <p class="text-xs text-white/40 mb-4">Compose a brand-new opening animation from a template + your colors - no code needed. It appears in every couple's Opening Style picker once saved.</p>

          <div v-if="openingStyleConfigs.length" class="space-y-2 mb-5">
            <div v-for="c in openingStyleConfigs" :key="c.id" class="catalog-card flex items-center justify-between">
              <div class="flex items-center gap-3 min-w-0">
                <UIcon :name="c.icon" class="w-4 h-4 text-gold-300 shrink-0" />
                <span class="font-medium truncate">{{ c.label }}</span>
                <span class="text-xs text-white/40">{{ c.template }}</span>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <USwitch :model-value="c.enabled" @update:model-value="(v: boolean) => toggleConfigEnabled(c, v)" />
                <UButton size="xs" variant="ghost" color="neutral" icon="i-heroicons-pencil-square" @click="startEditConfig(c)" />
                <UButton size="xs" variant="ghost" color="error" icon="i-heroicons-trash" @click="deleteConfig(c.id)" />
              </div>
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <UFormField label="Style name"><UInput v-model="configForm.label" placeholder="e.g. Golden Hour" class="w-full" /></UFormField>
            <UFormField label="Template">
              <USelect v-model="configForm.template" :items="templateOptions" class="w-full" />
            </UFormField>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div><label class="field-label">From</label><input v-model="configForm.bgFrom" type="color" class="w-9 h-9 rounded-lg border border-white/20 bg-transparent cursor-pointer" /></div>
            <div><label class="field-label">Mid</label><input v-model="configForm.bgVia" type="color" class="w-9 h-9 rounded-lg border border-white/20 bg-transparent cursor-pointer" /></div>
            <div><label class="field-label">To</label><input v-model="configForm.bgTo" type="color" class="w-9 h-9 rounded-lg border border-white/20 bg-transparent cursor-pointer" /></div>
            <div><label class="field-label">Accent</label><input v-model="configForm.accent" type="color" class="w-9 h-9 rounded-lg border border-white/20 bg-transparent cursor-pointer" /></div>
          </div>
          <div class="flex items-center gap-3 mt-5">
            <UButton color="primary" :icon="editingConfigId ? 'i-heroicons-check' : 'i-heroicons-plus'" :loading="savingConfig" :disabled="!configForm.label.trim()" @click="saveConfig">
              {{ editingConfigId ? 'Save changes' : 'Add opening style' }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- DESIGN OPTIONS: ornaments, falling-particle styles, and cover/inner
           top icons - same "toggle, don't author" pattern as Opening Styles
           above, just without the phone preview (these render inline inside
           the couple's own card layout rather than as a full-screen intro). -->
      <div v-if="section === 'design-options'" class="space-y-8 animate-fade-up">
        <div class="explain-card">
          <p class="font-semibold text-sm text-gold-200 mb-1.5">Where this applies</p>
          <p class="text-sm text-white/60 leading-relaxed">
            Ornament styles and top icons render directly on a couple's cover card and inner details page (Design Studio's "Ornament Style" and "Top Icon" pickers). Falling particle styles are the animated background pieces (petals, confetti, hearts, etc.) that drift down the screen when a couple turns "Falling petals" on. Turning any of these off here removes it from that couple's picker going forward - it never changes what an existing couple already has selected.
          </p>        </div>
        <UAlert
          icon="i-heroicons-information-circle"
          color="info"
          variant="soft"
          title="These can be turned on/off, not authored"
          description="Each option is real CSS/markup in the codebase, so this can't invent a brand new one - but you control exactly which of these every couple is allowed to pick from in their own Design Studio."
        />

        <div>
          <h3 class="section-heading">Ornament styles</h3>
          <div class="space-y-2">
            <div v-for="opt in ornamentStyleCatalog" :key="opt.value" class="catalog-card flex items-center justify-between">
              <div class="flex items-center gap-3 min-w-0">
                <div class="p-2 rounded-lg shrink-0" :class="isOrnamentEnabled(opt.value) ? 'bg-gold-400/10' : 'bg-white/5'">
                  <UIcon :name="opt.icon" class="w-4 h-4" :style="{ color: isOrnamentEnabled(opt.value) ? '#e3b04a' : 'rgba(255,255,255,0.35)' }" />
                </div>
                <span class="font-medium truncate" :class="isOrnamentEnabled(opt.value) ? 'text-white' : 'text-white/40'">{{ opt.label }}</span>
              </div>
              <USwitch :model-value="isOrnamentEnabled(opt.value)" :loading="togglingOrnament === opt.value" @update:model-value="(v: boolean) => toggleOrnament(opt.value, v)" />
            </div>
          </div>
        </div>

        <div>
          <h3 class="section-heading">Falling particle styles</h3>
          <div class="space-y-2">
            <div v-for="opt in petalStyleCatalog" :key="opt.value" class="catalog-card flex items-center justify-between">
              <div class="flex items-center gap-3 min-w-0">
                <div class="p-2 rounded-lg shrink-0" :class="isPetalEnabled(opt.value) ? 'bg-gold-400/10' : 'bg-white/5'">
                  <UIcon :name="opt.icon" class="w-4 h-4" :style="{ color: isPetalEnabled(opt.value) ? '#e3b04a' : 'rgba(255,255,255,0.35)' }" />
                </div>
                <span class="font-medium truncate" :class="isPetalEnabled(opt.value) ? 'text-white' : 'text-white/40'">{{ opt.label }}</span>
              </div>
              <USwitch :model-value="isPetalEnabled(opt.value)" :loading="togglingPetal === opt.value" @update:model-value="(v: boolean) => togglePetal(opt.value, v)" />
            </div>
          </div>
        </div>

        <div>
          <h3 class="section-heading">Cover &amp; Inner Card top icons</h3>
          <div class="space-y-2">
            <div v-for="opt in topIconCatalog" :key="opt.value" class="catalog-card flex items-center justify-between">
              <div class="flex items-center gap-3 min-w-0">
                <div class="p-2 rounded-lg shrink-0" :class="isTopIconEnabled(opt.value) ? 'bg-gold-400/10' : 'bg-white/5'">
                  <UIcon :name="opt.icon" class="w-4 h-4" :style="{ color: isTopIconEnabled(opt.value) ? '#e3b04a' : 'rgba(255,255,255,0.35)' }" />
                </div>
                <span class="font-medium truncate" :class="isTopIconEnabled(opt.value) ? 'text-white' : 'text-white/40'">{{ opt.label }}</span>
              </div>
              <USwitch :model-value="isTopIconEnabled(opt.value)" :loading="togglingTopIcon === opt.value" @update:model-value="(v: boolean) => toggleTopIcon(opt.value, v)" />
            </div>
          </div>
        </div>

        <div class="form-card">
          <h3 class="section-heading">Color choices for couples</h3>
          <p class="text-xs text-white/40 mb-4">Pick a category + style, then define the colors a couple can choose for it. If a style has no colors here, couples won't see a color picker for it.</p>
          <div class="grid sm:grid-cols-2 gap-4">
            <UFormField label="Category">
              <USelect v-model="colorCategory" :items="[{ label: 'Ornament styles', value: 'ornament' }, { label: 'Falling particles', value: 'petal' }, { label: 'Top icons', value: 'topIcon' }]" class="w-full" />
            </UFormField>
            <UFormField label="Style">
              <USelect v-model="colorStyle" :items="colorStyleOptions" class="w-full" />
            </UFormField>
          </div>
          <div class="mt-4">
            <label class="field-label">Offered colors</label>
            <div class="flex items-center gap-2 flex-wrap">
              <div v-for="c in currentColorTags" :key="c" class="group relative w-8 h-8 rounded-full border border-white/20" :style="{ background: c }">
                <button type="button" class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] leading-none items-center justify-center hidden group-hover:flex" title="Remove" @click="removeColor(c)">✕</button>
              </div>
              <label class="w-8 h-8 rounded-full border border-dashed border-white/30 flex items-center justify-center cursor-pointer overflow-hidden relative" title="Add color">
                <input v-model="newColor" type="color" class="absolute inset-0 opacity-0 cursor-pointer" />
                <UIcon name="i-heroicons-plus" class="w-3.5 h-3.5 text-white/60" />
              </label>
              <UButton size="xs" color="primary" variant="soft" @click="addColor">Add {{ newColor }}</UButton>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AdminSidePreview>
  </template>

  <script setup lang="ts">
  import type { Theme, FontOption, TextPreset } from '~/composables/useThemes'
  import type { WeddingContent } from '~/composables/useWeddingTypes'
  
  const props = defineProps<{ section: 'themes' | 'fonts' | 'presets' | 'opening-styles' | 'design-options' }>()

  const toast = useToast()
  const {
    themes, fontOptions, builtInTextPresets,
    openingStyleCatalog, disabledOpeningStyles,
    ornamentStyleCatalog, petalStyleCatalog, topIconCatalog,
    disabledOrnamentStyles, disabledPetalStyles, disabledTopIcons,
    setOrnamentStyleEnabled, setPetalStyleEnabled, setTopIconEnabled,
    allThemes, allFontOptions, allTextPresets,
    addCustomTheme, removeCustomTheme, addCustomFont, removeCustomFont, addTextPreset, removeTextPreset,
    setOpeningStyleEnabled, themeStyleVars,
    saveThemeOverride, resetThemeOverride, saveFontOverride, resetFontOverride, saveTextPresetOverride, resetTextPresetOverride,
    ornamentColorTags, petalColorTags, topIconColorTags, saveOrnamentColorTags, savePetalColorTags, saveTopIconColorTags,
    openingStyleConfigs, saveOpeningStyleConfig, removeOpeningStyleConfig
  } = useThemes()
  import { defaultOpeningStyleConfig, type OpeningStyleConfig } from '~/composables/useThemes'

  // --- Design Options (ornaments / petals / top icons) ---
  const togglingOrnament = ref('')
  function isOrnamentEnabled(value: string) { return !disabledOrnamentStyles.value.includes(value) }
  async function toggleOrnament(value: string, enabled: boolean) {
    togglingOrnament.value = value
    try { await setOrnamentStyleEnabled(value, enabled) } catch (error) { console.error(error); toast.add({ title: 'Could not update that ornament style', color: 'error' }) } finally { togglingOrnament.value = '' }
  }

  const togglingPetal = ref('')
  function isPetalEnabled(value: string) { return !disabledPetalStyles.value.includes(value) }
  async function togglePetal(value: string, enabled: boolean) {
    togglingPetal.value = value
    try { await setPetalStyleEnabled(value, enabled) } catch (error) { console.error(error); toast.add({ title: 'Could not update that petal style', color: 'error' }) } finally { togglingPetal.value = '' }
  }

  const togglingTopIcon = ref('')
  function isTopIconEnabled(value: string) { return !disabledTopIcons.value.includes(value) }
  async function toggleTopIcon(value: string, enabled: boolean) {
    togglingTopIcon.value = value
    try { await setTopIconEnabled(value, enabled) } catch (error) { console.error(error); toast.add({ title: 'Could not update that icon', color: 'error' }) } finally { togglingTopIcon.value = '' }
  }

  // --- Color choices per design-option style ---
  const colorCategory = ref<'ornament' | 'petal' | 'topIcon'>('ornament')
  const colorStyle = ref('')
  const newColor = ref('#d4a017')
  const colorStyleOptions = computed(() => {
    const list = colorCategory.value === 'ornament' ? ornamentStyleCatalog : colorCategory.value === 'petal' ? petalStyleCatalog : topIconCatalog
    return list.map((o) => ({ label: o.label, value: o.value }))
  })
  // Keep the selected style valid when the category changes.
  watch(colorCategory, (cat) => {
    const list = cat === 'ornament' ? ornamentStyleCatalog : cat === 'petal' ? petalStyleCatalog : topIconCatalog
    if (!list.some((o) => o.value === colorStyle.value)) colorStyle.value = list[0]?.value || ''
  }, { immediate: true })
  const currentColorTags = computed(() => {
    const map = colorCategory.value === 'ornament' ? ornamentColorTags.value : colorCategory.value === 'petal' ? petalColorTags.value : topIconColorTags.value
    return map[colorStyle.value] || []
  })
  async function persistColors(next: string[]) {
    try {
      if (colorCategory.value === 'ornament') await saveOrnamentColorTags(colorStyle.value, next)
      else if (colorCategory.value === 'petal') await savePetalColorTags(colorStyle.value, next)
      else await saveTopIconColorTags(colorStyle.value, next)
    } catch (error) { console.error(error); toast.add({ title: 'Could not save colors', color: 'error' }) }
  }
  function addColor() {
    if (!colorStyle.value || currentColorTags.value.includes(newColor.value)) return
    persistColors([...currentColorTags.value, newColor.value])
  }
  function removeColor(c: string) {
    persistColors(currentColorTags.value.filter((x) => x !== c))
  }
  
  const removingId = ref('')
  // 'themes'/'fonts'/'design-options' all render on the actual card, so they
  // share the 'design' preview; 'presets' and 'opening-styles' both affect
  // the opening/envelope screen, so they share the 'opening' preview.
  const livePreviewMode = computed(() => (props.section === 'presets' || props.section === 'opening-styles' ? 'opening' : 'design'))

  // Anything in allThemes/allFontOptions/allTextPresets that ISN'T in the
  // built-in list must be a custom, admin-added one.
  const customThemes = computed(() => allThemes.value.filter((t) => !themes.some((b) => b.id === t.id)))
  const customFonts = computed(() => allFontOptions.value.filter((f) => !fontOptions.some((b) => b.id === f.id)))
  const customPresets = computed(() => allTextPresets.value.filter((p) => !builtInTextPresets.some((b) => b.id === p.id)))

  // Built-ins WITH any admin override merged on top - what the built-in edit
  // sections display so an edited price/name shows its current value.
  const builtInThemesEffective = computed(() => allThemes.value.filter((t) => themes.some((b) => b.id === t.id)))
  const builtInFontsEffective = computed(() => allFontOptions.value.filter((f) => fontOptions.some((b) => b.id === f.id)))
  const builtInPresetsEffective = computed(() => allTextPresets.value.filter((p) => builtInTextPresets.some((b) => b.id === p.id)))
  
  function slugify(text: string) {
    return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }
  
  const emptyThemeForm = () => ({ name: '', tagline: '', price: 0, headingFont: 'Great Vibes', bgFrom: '#04101f', bgVia: '#0b1c30', bgTo: '#142a45', accent: '#d4a017', ink: '#ffffff' })
  
  // --- Themes ---
  const fontSelectItems = computed(() => allFontOptions.value.map((f) => ({ label: f.label, value: f.id })))
  const colorFields: { key: 'bgFrom' | 'bgVia' | 'bgTo' | 'accent' | 'ink'; label: string }[] = [
    { key: 'bgFrom', label: 'Background start' },
    { key: 'bgVia', label: 'Background mid' },
    { key: 'bgTo', label: 'Background end' },
    { key: 'accent', label: 'Accent' },
    { key: 'ink', label: 'Text color' }
  ]
  const themeForm = ref(emptyThemeForm())
  const editingThemeId = ref<string | null>(null)
  const editingBuiltInThemeId = ref<string | null>(null)
  const canAddTheme = computed(() => themeForm.value.name.trim().length > 0)
  const addingTheme = ref(false)

  function startEditTheme(theme: Theme) {
    editingThemeId.value = theme.id
    editingBuiltInThemeId.value = null
    loadThemeForm(theme)
  }
  function startEditBuiltInTheme(theme: Theme) {
    editingBuiltInThemeId.value = theme.id
    editingThemeId.value = null
    loadThemeForm(theme)
  }
  function loadThemeForm(theme: Theme) {
    themeForm.value = {
      name: theme.name,
      tagline: theme.tagline,
      price: theme.price,
      headingFont: theme.headingFont,
      bgFrom: theme.palette.bgFrom,
      bgVia: theme.palette.bgVia,
      bgTo: theme.palette.bgTo,
      accent: theme.palette.accent,
      ink: theme.palette.ink
    }
  }
  function cancelEditTheme() {
    editingThemeId.value = null
    editingBuiltInThemeId.value = null
    themeForm.value = emptyThemeForm()
  }

  async function resetBuiltInTheme(id: string) {
    try {
      await resetThemeOverride(id)
      if (editingBuiltInThemeId.value === id) cancelEditTheme()
      toast.add({ title: 'Theme reset to its built-in defaults', color: 'success' })
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not reset theme', color: 'error' })
    }
  }

  async function submitTheme() {
    if (!canAddTheme.value) return
    addingTheme.value = true
    try {
      // Editing a BUILT-IN writes an override (price/name/palette) that merges
      // over the baseline everywhere, including the ToyyibPay checkout.
      if (editingBuiltInThemeId.value) {
        await saveThemeOverride(editingBuiltInThemeId.value, {
          name: themeForm.value.name.trim(),
          tagline: themeForm.value.tagline.trim(),
          price: Number(themeForm.value.price) || 0,
          headingFont: themeForm.value.headingFont,
          palette: {
            bgFrom: themeForm.value.bgFrom,
            bgVia: themeForm.value.bgVia,
            bgTo: themeForm.value.bgTo,
            accent: themeForm.value.accent,
            accentSoft: hexToRgba(themeForm.value.accent, 0.18),
            ink: themeForm.value.ink,
            onAccent: themeForm.value.bgFrom
          }
        })
        toast.add({ title: `"${themeForm.value.name}" updated`, color: 'success' })
        cancelEditTheme()
        return
      }
      const id = editingThemeId.value || `custom-${slugify(themeForm.value.name)}` || `custom-${Date.now()}`
      const theme: Theme = {
        id,
        name: themeForm.value.name.trim(),
        tagline: themeForm.value.tagline.trim() || 'A custom theme',
        price: Number(themeForm.value.price) || 0,
        currency: 'RM',
        headingFont: themeForm.value.headingFont,
        palette: {
          bgFrom: themeForm.value.bgFrom,
          bgVia: themeForm.value.bgVia,
          bgTo: themeForm.value.bgTo,
          accent: themeForm.value.accent,
          accentSoft: hexToRgba(themeForm.value.accent, 0.18),
          ink: themeForm.value.ink,
          onAccent: themeForm.value.bgFrom
        }
      }
      await addCustomTheme(theme)
      toast.add({ title: editingThemeId.value ? `"${theme.name}" updated` : `"${theme.name}" added to the theme catalog`, color: 'success' })
      cancelEditTheme()
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not save theme', color: 'error' })
    } finally {
      addingTheme.value = false
    }
  }
  
  async function removeTheme(id: string) {
    removingId.value = id
    try {
      await removeCustomTheme(id)
      if (editingThemeId.value === id) cancelEditTheme()
      toast.add({ title: 'Theme removed', color: 'success' })
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not remove theme', color: 'error' })
    } finally {
      removingId.value = ''
    }
  }
  
  // --- Fonts ---
  const emptyFontForm = () => ({ id: '', label: '', category: 'sans' as FontOption['category'] })
  const fontForm = ref(emptyFontForm())
  const editingFontId = ref<string | null>(null)
  const editingBuiltInFontId = ref<string | null>(null)
  const canAddFont = computed(() => fontForm.value.id.trim().length > 0)
  const addingFont = ref(false)

  function startEditFont(font: FontOption) {
    editingFontId.value = font.id
    editingBuiltInFontId.value = null
    fontForm.value = { id: font.id, label: font.label, category: font.category }
  }
  function startEditBuiltInFont(font: FontOption) {
    editingBuiltInFontId.value = font.id
    editingFontId.value = null
    fontForm.value = { id: font.id, label: font.label, category: font.category }
  }
  function cancelEditFont() {
    editingFontId.value = null
    editingBuiltInFontId.value = null
    fontForm.value = emptyFontForm()
  }
  async function resetBuiltInFont(id: string) {
    try {
      await resetFontOverride(id)
      if (editingBuiltInFontId.value === id) cancelEditFont()
      toast.add({ title: 'Font reset to its built-in label', color: 'success' })
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not reset font', color: 'error' })
    }
  }

  async function submitFont() {
    if (!canAddFont.value) return
    addingFont.value = true
    try {
      if (editingBuiltInFontId.value) {
        await saveFontOverride(editingBuiltInFontId.value, {
          label: fontForm.value.label.trim() || fontForm.value.id.trim(),
          category: fontForm.value.category
        })
        toast.add({ title: `"${fontForm.value.label}" updated`, color: 'success' })
        cancelEditFont()
        return
      }
      const font: FontOption = {
        id: fontForm.value.id.trim(),
        label: fontForm.value.label.trim() || fontForm.value.id.trim(),
        category: fontForm.value.category
      }
      await addCustomFont(font)
      toast.add({ title: editingFontId.value ? `"${font.label}" updated` : `"${font.label}" added to the font catalog`, color: 'success' })
      cancelEditFont()
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not save font', color: 'error' })
    } finally {
      addingFont.value = false
    }
  }
  
  async function removeFont(id: string) {
    removingId.value = id
    try {
      await removeCustomFont(id)
      if (editingFontId.value === id) cancelEditFont()
      toast.add({ title: 'Font removed', color: 'success' })
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not remove font', color: 'error' })
    } finally {
      removingId.value = ''
    }
  }
  
  // --- Text Presets ---
  const emptyPresetForm = () => ({ label: '', openingTitle: '', openingGreeting: '', openingActionText: '' })
  const presetForm = ref(emptyPresetForm())
  const editingPresetId = ref<string | null>(null)
  const editingBuiltInPresetId = ref<string | null>(null)
  const canAddPreset = computed(() =>
    presetForm.value.label.trim() && presetForm.value.openingTitle.trim() && presetForm.value.openingGreeting.trim() && presetForm.value.openingActionText.trim()
  )
  const addingPreset = ref(false)

  function startEditPreset(preset: TextPreset) {
    editingPresetId.value = preset.id
    editingBuiltInPresetId.value = null
    loadPresetForm(preset)
  }
  function startEditBuiltInPreset(preset: TextPreset) {
    editingBuiltInPresetId.value = preset.id
    editingPresetId.value = null
    loadPresetForm(preset)
  }
  function loadPresetForm(preset: TextPreset) {
    presetForm.value = {
      label: preset.label,
      openingTitle: preset.openingTitle,
      openingGreeting: preset.openingGreeting,
      openingActionText: preset.openingActionText
    }
  }
  function cancelEditPreset() {
    editingPresetId.value = null
    editingBuiltInPresetId.value = null
    presetForm.value = emptyPresetForm()
  }
  async function resetBuiltInPreset(id: string) {
    try {
      await resetTextPresetOverride(id)
      if (editingBuiltInPresetId.value === id) cancelEditPreset()
      toast.add({ title: 'Preset reset to its built-in wording', color: 'success' })
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not reset preset', color: 'error' })
    }
  }

  async function submitPreset() {
    if (!canAddPreset.value) return
    addingPreset.value = true
    try {
      if (editingBuiltInPresetId.value) {
        await saveTextPresetOverride(editingBuiltInPresetId.value, {
          label: presetForm.value.label.trim(),
          openingTitle: presetForm.value.openingTitle.trim(),
          openingGreeting: presetForm.value.openingGreeting.trim(),
          openingActionText: presetForm.value.openingActionText.trim()
        })
        toast.add({ title: `"${presetForm.value.label}" updated`, color: 'success' })
        cancelEditPreset()
        return
      }
      const preset: TextPreset = {
        id: editingPresetId.value || `custom-${slugify(presetForm.value.label)}` || `custom-${Date.now()}`,
        label: presetForm.value.label.trim(),
        openingTitle: presetForm.value.openingTitle.trim(),
        openingGreeting: presetForm.value.openingGreeting.trim(),
        openingActionText: presetForm.value.openingActionText.trim()
      }
      await addTextPreset(preset)
      toast.add({ title: editingPresetId.value ? `"${preset.label}" updated` : `"${preset.label}" preset added`, color: 'success' })
      cancelEditPreset()
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not save preset', color: 'error' })
    } finally {
      addingPreset.value = false
    }
  }
  
  async function removePreset(id: string) {
    removingId.value = id
    try {
      await removeTextPreset(id)
      if (editingPresetId.value === id) cancelEditPreset()
      toast.add({ title: 'Preset removed', color: 'success' })
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not remove preset', color: 'error' })
    } finally {
      removingId.value = ''
    }
  }
  
  // --- Opening Styles ---
  const togglingStyle = ref('')
  function isStyleEnabled(value: string) {
    return !disabledOpeningStyles.value.includes(value)
  }
  async function toggleStyle(value: string, enabled: boolean) {
    togglingStyle.value = value
    try {
      await setOpeningStyleEnabled(value, enabled)
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not update that style', color: 'error' })
    } finally {
      togglingStyle.value = ''
    }
  }

  // --- Admin-authored opening styles (data-driven) ---
  const configForm = ref<OpeningStyleConfig>(defaultOpeningStyleConfig())
  const editingConfigId = ref('')
  const savingConfig = ref(false)
  const templateOptions = [
    { label: 'Gradient Fade (soft, elegant)', value: 'gradient-fade' },
    { label: 'Blob Background (drifting color)', value: 'blob-background' },
    { label: 'Split Door (two panels part)', value: 'split-door' },
    { label: 'Confetti Burst (celebratory)', value: 'confetti-burst' }
  ]
  function startEditConfig(c: OpeningStyleConfig) {
    editingConfigId.value = c.id
    configForm.value = { ...defaultOpeningStyleConfig(), ...c }
  }
  function cancelEditConfig() {
    editingConfigId.value = ''
    configForm.value = defaultOpeningStyleConfig()
  }
  async function saveConfig() {
    if (!configForm.value.label.trim()) return
    savingConfig.value = true
    try {
      await saveOpeningStyleConfig({ ...configForm.value, id: editingConfigId.value || '' })
      toast.add({ title: `"${configForm.value.label}" saved`, description: 'It now appears in the couple Opening Style picker.', color: 'success' })
      cancelEditConfig()
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not save opening style', color: 'error' })
    } finally {
      savingConfig.value = false
    }
  }
  async function deleteConfig(id: string) {
    try {
      await removeOpeningStyleConfig(id)
      if (editingConfigId.value === id) cancelEditConfig()
      toast.add({ title: 'Opening style removed', color: 'success' })
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Could not remove opening style', color: 'error' })
    }
  }
  async function toggleConfigEnabled(c: OpeningStyleConfig, enabled: boolean) {
    await saveOpeningStyleConfig({ ...c, enabled })
  }
  
  // Demo-only preview state - never a real couple's wedding. EnvelopeIntro
  // just needs enough of a WeddingContent shape to render; everything else
  // defaults sensibly since it's only ever read, never saved anywhere.
  const previewStyle = ref(openingStyleCatalog[0]?.value || 'classic')
  const previewOpened = ref(false)
  const previewContent = computed(() => ({
    brideName: 'Aisyah',
    groomName: 'Danial',
    openingStyle: previewStyle.value,
    openingBgUrl: '',
    openingTitle: "You're Invited",
    openingGreeting: 'Dear {guestName}',
    openingActionText: 'Tap to open'
  }) as WeddingContent)
  const previewStyleVars = computed(() => themeStyleVars('timeless-gold'))
  
  function setPreviewStyle(value: string) {
    previewStyle.value = value
    previewOpened.value = false
  }
  
  // Reference text shown in the "How to add a new one" panel below. Plain
  // strings rendered inside <pre> tags via {{ }} - Vue escapes these
  // automatically, so code like "<div v-if=...>" displays as literal text
  // instead of being parsed as real template markup.
  const showDevGuide = ref(false)
  const openingStyleSteps = [
    {
      title: '1. Register it in the shared catalog',
      file: 'app/composables/useThemes.ts',
      body: "Add one entry to openingStyleCatalog:",
      code: `export const openingStyleCatalog: OpeningStyle[] = [
    { label: 'Classic Envelope', value: 'classic', icon: 'i-heroicons-envelope' },
    // ...existing entries...
    { label: 'Confetti Burst', value: 'confetti-burst', icon: 'i-heroicons-sparkles' }, // <- new
  ]`
    },
    {
      title: '2. Add the background/animation markup',
      file: 'app/components/EnvelopeIntro.vue',
      body: "Find the v-if/v-else-if chain for the background layer (search for content.openingStyle === 'wax-seal') and add a new branch:",
      code: `<div v-else-if="content.openingStyle === 'confetti-burst'" class="absolute inset-0 z-0 confetti-burst-bg">
    <!-- your markup -->
  </div>`
    },
    {
      title: '3. Add the transition CSS',
      file: 'app/components/EnvelopeIntro.vue',
      body: "Inside <style scoped>. Copy the pattern from the Wax Seal implementation (search for wax-seal-shake, wax-crack-flash) - it shows how to sequence a multi-stage animation using CSS keyframes and transition-delay.",
      code: `.confetti-burst-leave-active {
    transition: opacity 0.4s ease, transform 0.6s ease;
  }`
    },
    {
      title: '4. Test it',
      file: null,
      body: 'Run the dev server, open Design Studio / Opening Design, pick the new style from the Cover Layout Style grid, and click the phone preview to open it. It will also now appear automatically in this Opening Styles toggle list above.',
      code: ''
    }
  ]
  const petalSteps = [
    {
      title: '1. Add the shape',
      file: 'app/components/PetalsBackground.vue',
      body: "Add a v-else-if branch for your styleName alongside the existing 'confetti' / 'hearts' / 'sparkles' ones. The falling motion (speed, drift, rotation) is already generic - you only supply the shape:",
      code: `<svg v-else-if="styleName === 'stars'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- your shape -->
  </svg>`
    },
    {
      title: '2. Add it to the picker',
      file: 'app/pages/dashboard/editor.vue',
      body: 'Add one entry to petalStyleOptions:',
      code: `const petalStyleOptions = [
    // ...existing entries...
    { label: 'Stars', value: 'stars', icon: 'i-heroicons-star' },
  ]`
    }
  ]
  
  // Reset any in-progress edit when switching sections via the sidebar.
  watch(() => props.section, () => {
    cancelEditTheme()
    cancelEditFont()
    cancelEditPreset()
  })
  </script>
  
  <style scoped>
  .explain-card {
    border-radius: 1rem;
    padding: 1.1rem 1.25rem;
    background: rgba(99, 102, 241, 0.05);
    border: 1px solid rgba(99, 102, 241, 0.16);
  }

  .section-heading {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
    color: rgba(227, 176, 74, 0.7);
    margin-bottom: 0.75rem;
  }

  .catalog-card {
    border-radius: 1rem;
    padding: 1rem 1.1rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
  }
  
  .catalog-card:hover {
    border-color: rgba(255, 255, 255, 0.16);
    background: rgba(255, 255, 255, 0.035);
  }
  
  .form-card {
    border-radius: 1.25rem;
    padding: 1.5rem;
    background: linear-gradient(160deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.015));
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }
  
  .field-label {
    display: block;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.4);
    margin-bottom: 0.4rem;
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 2.5rem 1rem;
    border-radius: 1rem;
    border: 1px dashed rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.015);
  }
  
  .catalog-card-previewing {
    border-color: rgba(212, 160, 23, 0.4);
    background: rgba(212, 160, 23, 0.06);
  }
  
  .phone-bezel {
    position: relative;
    height: 640px;
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
  }
  
  .phone-screen {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
  
  .dev-guide-card {
    border-radius: 1rem;
    border: 1px solid rgba(99, 102, 241, 0.2);
    background: rgba(99, 102, 241, 0.04);
    overflow: hidden;
  }
  
  .dev-guide-toggle {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    width: 100%;
    padding: 1rem 1.25rem;
    text-align: left;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.85);
    transition: background 0.2s ease;
  }
  
  .dev-guide-toggle:hover {
    background: rgba(99, 102, 241, 0.06);
  }
  
  .code-block {
    margin-top: 0.6rem;
    padding: 0.85rem 1rem;
    border-radius: 0.65rem;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
    font-size: 0.75rem;
    line-height: 1.6;
    color: #d4e0ff;
    white-space: pre-wrap;
    word-break: break-word;
    overflow-x: auto;
  }
  </style>