<template>
  <div class="flex gap-6 items-start">
    <!-- Main editor content -->
    <div class="flex-1 min-w-0">
      <slot />
    </div>

    <!-- Persistent live preview (xl+). On smaller screens it collapses below.
         Replaces the old "View Live" popup everywhere in Platform Admin -
         see AdminLivePreview.vue's history: every mode here used to be a
         UModal a couple of clicks away, only reflecting the last-SAVED
         catalog state. Now it's always visible beside the form, and for
         dashboard/day-flow/guest-list/rsvp it reflects the CURRENT UNSAVED
         form values (passed in via the optional *Form/*Texts props) so it's
         genuinely live as you type, not just after you hit Save. -->
    <aside class="asp-aside" :class="{ 'asp-aside-wide': isFrameMode }">
      <div class="flex items-center justify-between mb-3 px-1">
        <p class="text-xs font-semibold uppercase tracking-widest text-gold-200/70 flex items-center gap-2">
          <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4" /> Live preview
        </p>
        <button v-if="mode === 'opening'" type="button" class="text-xs text-white/40 hover:text-white/70" @click="opened = false">Reset</button>
      </div>

      <div v-if="isFrameMode" class="asp-frame">
        <!-- USER DASHBOARD -->
        <div v-if="mode === 'dashboard'" class="real-dashboard-frame">
          <aside class="real-dashboard-aside">
            <div class="flex items-center gap-2 px-3 py-3 mb-2">
              <div class="p-1.5 rounded-lg bg-white/5 border border-white/10">
                <UIcon name="i-heroicons-heart" class="w-4 h-4 text-gold-300" />
              </div>
              <span class="font-display font-semibold text-sm text-gold-100 tracking-wide">WeddingCard</span>
            </div>
            <nav class="flex flex-col gap-1.5 px-1">
              <div v-for="(item, index) in mockDashboardNavItems" :key="item.id" class="real-nav-link" :class="{ 'real-nav-link-active': index === 0 }">
                <UIcon :name="dashboardNavIcons[item.id] || 'i-heroicons-square-2-stack'" class="w-4 h-4 shrink-0" />
                <span>{{ item.label }}</span>
              </div>
              <p v-if="mockDashboardNavItems.length === 0" class="text-xs text-white/30 px-3 pt-2">Every page is currently turned off.</p>
            </nav>
          </aside>
          <div class="real-dashboard-main">
            <p class="text-xs uppercase tracking-widest text-gold-300/70 font-semibold mb-1">{{ effectiveDashboardForm.overviewEyebrow }}</p>
            <p class="text-lg font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-100 via-gold-300 to-gold-500 tracking-tight">{{ effectiveDashboardForm.overviewTitle }}</p>
            <div class="mt-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-2xl">
              <p class="text-sm font-semibold text-white/85">{{ effectiveDashboardForm.createCardTitle }}</p>
              <p class="text-xs text-white/50 mt-1.5">{{ effectiveDashboardForm.createCardDescription }}</p>
            </div>
          </div>
        </div>

        <!-- RSVP -->
        <div v-else-if="mode === 'rsvp'" class="real-rsvp-frame" :style="rsvpStyleVars">
          <div class="real-rsvp-card" :class="{ 'real-rsvp-card-theme': rsvpCardStyleResolved !== 'dark' }" :style="{ '--card-text': rsvpCardTextColorResolved }">
            <div class="text-center space-y-1.5 mb-4">
              <h1 class="text-xl font-bold tracking-wide" :style="{ color: 'var(--card-text)', fontFamily: 'var(--theme-heading-font)' }">{{ effectiveRsvpTexts.rsvpTitle }}</h1>
              <div class="h-px w-12 mx-auto" :style="{ background: 'var(--theme-accent)' }" />
              <p class="text-[0.65rem] text-[color-mix(in_srgb,var(--card-text)_70%,transparent)] font-light tracking-wide pt-1">{{ effectiveRsvpTexts.rsvpDeadlineText }} <span class="font-medium" :style="{ color: 'var(--theme-accent)' }">12 Dec 2026</span></p>
            </div>
            <div class="space-y-3">
              <div>
                <p class="text-[0.7rem] text-[color-mix(in_srgb,var(--card-text)_50%,transparent)] mb-1">{{ effectiveRsvpTexts.rsvpNameLabel }}</p>
                <div class="real-rsvp-input">{{ effectiveRsvpTexts.rsvpNamePlaceholder }}</div>
              </div>
              <div>
                <p class="text-xs text-[color-mix(in_srgb,var(--card-text)_80%,transparent)] mb-2 font-medium">{{ effectiveRsvpTexts.rsvpAttendQuestion }}</p>
                <div class="grid grid-cols-2 gap-2">
                  <div class="real-option-card real-option-card-active"><span class="text-xs font-medium">{{ effectiveRsvpTexts.rsvpAttendYes }}</span></div>
                  <div class="real-option-card"><span class="text-xs font-medium">{{ effectiveRsvpTexts.rsvpAttendNo }}</span></div>
                </div>
              </div>
              <button type="button" class="real-rsvp-button">{{ effectiveRsvpTexts.rsvpConfirmButton }}</button>
            </div>
          </div>
        </div>

        <!-- DAY FLOW -->
        <div v-else-if="mode === 'dayflow'" class="real-tool-frame">
          <h1 class="text-lg font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-100 via-gold-300 to-gold-500 tracking-tight">{{ effectiveDayFlowForm.pageTitle }}</h1>
          <p class="text-xs text-white/50 mt-1 mb-4">{{ effectiveDayFlowForm.pageDescription }}</p>
          <div class="real-tool-panel">
            <FlowTimeline :items="sampleFlowTimelineItems" />
          </div>
        </div>

        <!-- GUEST LIST -->
        <div v-else-if="mode === 'guests'" class="real-tool-frame">
          <h1 class="text-lg font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-100 via-gold-300 to-gold-500 tracking-tight">{{ effectiveGuestListForm.pageTitle }}</h1>
          <p class="text-xs text-white/50 mt-1.5 mb-4">{{ effectiveGuestListForm.pageDescription }}</p>
          <div class="real-tool-panel">
            <table class="real-guests-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Tier</th>
                  <th v-if="effectiveGuestListForm.showSpecialSeating">Seating</th>
                  <th v-if="effectiveGuestListForm.showDietary">Dietary</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Sample Guest 1</td>
                  <td><span class="real-tier-badge">{{ effectiveGuestListForm.vipLabel }}</span></td>
                  <td v-if="effectiveGuestListForm.showSpecialSeating">Wheelchair</td>
                  <td v-if="effectiveGuestListForm.showDietary">Vegetarian</td>
                </tr>
                <tr>
                  <td>Sample Guest 2</td>
                  <td><span class="real-tier-badge real-tier-badge-general">{{ effectiveGuestListForm.generalLabel }}</span></td>
                  <td v-if="effectiveGuestListForm.showSpecialSeating">-</td>
                  <td v-if="effectiveGuestListForm.showDietary">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-else class="phone-bezel shadow-2xl">
        <div class="phone-notch"></div>
        <div class="phone-screen relative bg-[#04101f]" :style="styleVars">
          <template v-if="mode === 'opening'">
            <EnvelopeIntro v-model:opened="opened" guest-name="Guest Name" :content="content" />
          </template>
          <template v-else>
            <WeddingCardPreview :content="content" :theme-id="themeId" />
          </template>
        </div>
      </div>
      <p class="text-xs text-white/40 mt-3">
        {{ isFrameMode ? 'Updates live as you type below. Illustrative sample data - never a real couple\'s account.' : 'Updates live as you edit. Uses a sample couple — never real data.' }}
      </p>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { createDefaultContent } from '~/composables/useWeddingTypes'
import { defaultDashboardSettings, defaultDayFlowSettings, defaultGuestListSettings, rsvpTextFields, type DashboardSettings, type DayFlowSettings, type GuestListSettings, type RsvpTextKey } from '~/composables/useThemes'

// Persistent, always-visible live preview that sits beside an admin editor and
// updates reactively as the form changes (replaces the old "View Live" popup
// - see the comment above the <aside> in the template for the full history).
const props = withDefaults(defineProps<{
  mode?: 'design' | 'opening' | 'dashboard' | 'rsvp' | 'dayflow' | 'guests'
  themeId?: string
  overrides?: Record<string, unknown>
  /** Pass the admin page's own in-progress form so the preview reflects
   *  unsaved edits, not just the last-saved catalog value. Optional - falls
   *  back to the saved catalog settings when omitted. */
  dashboardForm?: DashboardSettings
  dayFlowForm?: DayFlowSettings
  guestListForm?: GuestListSettings
  rsvpTexts?: Partial<Record<RsvpTextKey, string>>
}>(), {
  mode: 'design',
  themeId: 'timeless-gold',
  overrides: () => ({})
})

const {
  themeStyleVars, starterDefaults, enabledPetalStyles, enabledOrnamentStyles, enabledTopIcons, enabledOpeningStyles, allTextPresets,
  dashboardSettings, dayFlowSettings, guestListSettings, allDayFlowPresets, allThemes, resolveCardStyle
} = useThemes()

const isFrameMode = computed(() => props.mode === 'dashboard' || props.mode === 'rsvp' || props.mode === 'dayflow' || props.mode === 'guests')

const opened = ref(false)

const content = computed(() => {
  const base = createDefaultContent('Aisyah', 'Danial')
  const englishPreset = allTextPresets.value.find((p) => p.id === 'en') || allTextPresets.value[0]
  return {
    ...base,
    story: starterDefaults.value.story || base.story,
    enablePetals: starterDefaults.value.enablePetals,
    petalStyle: enabledPetalStyles.value[0]?.value || starterDefaults.value.petalStyle,
    ornamentStyle: enabledOrnamentStyles.value[0]?.value ?? starterDefaults.value.ornamentStyle,
    textWeight: starterDefaults.value.textWeight,
    btnDetails: starterDefaults.value.btnDetails,
    btnRsvp: starterDefaults.value.btnRsvp,
    innerTopIcon: enabledTopIcons.value[0]?.value || 'none',
    openingStyle: enabledOpeningStyles.value[0]?.value || base.openingStyle,
    openingTitle: englishPreset?.openingTitle || base.openingTitle,
    openingGreeting: (englishPreset?.openingGreeting || base.openingGreeting).replace('{guestName}', 'Guest Name'),
    openingActionText: englishPreset?.openingActionText || base.openingActionText,
    dateLabel: '12 December 2026',
    venueName: 'Sample Grand Ballroom',
    ...props.overrides
  } as ReturnType<typeof createDefaultContent>
})

const styleVars = computed(() => themeStyleVars(props.themeId))

// --- Dashboard mode ---
const effectiveDashboardForm = computed(() => props.dashboardForm || dashboardSettings.value || defaultDashboardSettings)
const mockDashboardNavItems = computed(() => effectiveDashboardForm.value.navItems.filter((item) => item.enabled))
const dashboardNavIcons: Record<string, string> = {
  overview: 'i-heroicons-home', opening: 'i-heroicons-envelope', editor: 'i-heroicons-paint-brush',
  rsvp: 'i-heroicons-pencil-square', guests: 'i-heroicons-users', flow: 'i-heroicons-clock', billing: 'i-heroicons-credit-card'
}

// --- Day Flow mode ---
const effectiveDayFlowForm = computed(() => props.dayFlowForm || dayFlowSettings.value || defaultDayFlowSettings)
const sampleFlowTimelineItems = computed(() => {
  const preset = allDayFlowPresets.value[0]
  if (!preset) return []
  return preset.items.map((item, index) => ({ id: String(index), ...item }))
})

// --- Guest List mode ---
const effectiveGuestListForm = computed(() => props.guestListForm || guestListSettings.value || defaultGuestListSettings)

// --- RSVP mode ---
const rsvpDefaults = createDefaultContent()
const effectiveRsvpTexts = computed(() => {
  const merged: Record<string, string> = {}
  for (const field of rsvpTextFields) merged[field.key] = rsvpDefaults[field.key] as string
  return { ...merged, ...(props.rsvpTexts || {}) } as Record<RsvpTextKey, string>
})
const rsvpSampleThemeId = computed(() => allThemes.value[0]?.id || 'timeless-gold')
const rsvpStyleVars = computed(() => themeStyleVars(rsvpSampleThemeId.value))
const rsvpCardStyleResolved = computed(() => resolveCardStyle(rsvpSampleThemeId.value, undefined))
const rsvpCardTextColorResolved = computed(() => (rsvpCardStyleResolved.value === 'dark' ? '#ffffff' : 'var(--theme-ink)'))
</script>

<style scoped>
.asp-aside {
  width: 340px;
  flex-shrink: 0;
  position: sticky;
  top: 1rem;
}
.asp-aside-wide {
  width: 380px;
}
@media (max-width: 1279px) {
  .asp-aside { display: none; }
}
.phone-bezel {
  position: relative;
  height: 620px;
  background: #000;
  border: 12px solid #1e293b;
  border-radius: 2.5rem;
  overflow: hidden;
}
.phone-notch {
  position: absolute;
  top: 0; left: 50%;
  transform: translateX(-50%);
  width: 40%; height: 24px;
  background: #1e293b;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
  z-index: 50;
}
.phone-screen { width: 100%; height: 100%; overflow-y: auto; overflow-x: hidden; }

/* Frame modes (dashboard/rsvp/dayflow/guests) - ported from
   AdminLivePreview.vue's non-phone variants, scaled down to fit a sticky
   side panel instead of a modal. */
.asp-frame {
  border-radius: 1.25rem;
  overflow: hidden;
  max-height: 620px;
  overflow-y: auto;
}

.real-dashboard-frame {
  display: flex;
  border-radius: 1.25rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #051021;
  min-height: 280px;
}
.real-dashboard-aside {
  width: 150px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: rgba(11, 28, 48, 0.4);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  padding: 0.75rem 0.5rem;
}
.real-nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.6rem;
  border-radius: 0.6rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  border: 1px solid transparent;
}
.real-nav-link-active {
  background: rgba(212, 160, 23, 0.12);
  color: #f3ddaa;
  border-color: rgba(212, 160, 23, 0.2);
}
.real-dashboard-main { flex: 1; padding: 1.1rem; min-width: 0; }

.real-rsvp-frame {
  border-radius: 1.25rem;
  padding: 1.25rem 1rem;
  background: linear-gradient(160deg, var(--theme-bg-from, #04101f), var(--theme-bg-via, #0b1c30), var(--theme-bg-to, #142a45));
}
.real-rsvp-card {
  border-radius: 1.25rem;
  border: 1px solid var(--theme-accent-soft, rgba(212, 160, 23, 0.2));
  background: linear-gradient(
    165deg,
    color-mix(in srgb, var(--theme-bg-via, #0b1c30) 30%, #0a1420) 0%,
    color-mix(in srgb, var(--theme-bg-to, #142a45) 25%, #050b14) 100%
  );
  backdrop-filter: blur(20px);
  padding: 1.25rem 1rem;
  color: var(--card-text, #fff);
}
.real-rsvp-card-theme {
  background: linear-gradient(
    165deg,
    color-mix(in srgb, var(--theme-bg-via, #0b1c30) 92%, var(--theme-ink, #000) 8%) 0%,
    color-mix(in srgb, var(--theme-bg-to, #142a45) 88%, var(--theme-ink, #000) 12%) 100%
  );
  color: var(--card-text, var(--theme-ink, #fff));
}
.real-option-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0.75rem;
  border-radius: 0.85rem;
  border: 1px solid color-mix(in srgb, var(--card-text, #fff) 15%, transparent);
  background: color-mix(in srgb, var(--card-text, #fff) 3%, transparent);
}
.real-option-card-active {
  border-color: var(--theme-accent, #e3b04a);
  background: var(--theme-accent-soft, rgba(212, 160, 23, 0.15));
  color: var(--card-text, #fff);
}
.real-rsvp-input {
  padding: 0.45rem 0.7rem;
  border-radius: 0.55rem;
  background: color-mix(in srgb, var(--card-text, #fff) 3%, transparent);
  border: 1px solid color-mix(in srgb, var(--card-text, #fff) 10%, transparent);
  font-size: 0.75rem;
  color: color-mix(in srgb, var(--card-text, #fff) 40%, transparent);
}
.real-rsvp-button {
  width: 100%;
  padding: 0.6rem;
  border-radius: 999px;
  background: var(--theme-accent, #d4a017);
  color: var(--theme-bg-from, #1f1400);
  font-weight: 600;
  font-size: 0.8rem;
}

.real-tool-frame { border-radius: 1.25rem; }
.real-tool-panel {
  border-radius: 1.1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.real-guests-table { width: 100%; border-collapse: collapse; font-size: 0.75rem; }
.real-guests-table th {
  text-align: left;
  padding: 0.4rem 0.5rem;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.real-guests-table td {
  padding: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.7);
}
.real-tier-badge {
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.65rem;
  background: rgba(212, 160, 23, 0.15);
  color: #f3ddaa;
}
.real-tier-badge-general { background: rgba(255, 255, 255, 0.06); color: rgba(255, 255, 255, 0.6); }
</style>
