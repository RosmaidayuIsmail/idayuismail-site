<template>
  <div v-if="loading" class="min-h-screen invite-backdrop flex flex-col items-center justify-center text-white/60 space-y-4">
    <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gold-400" />
    <p class="animate-pulse tracking-widest uppercase text-xs">Loading RSVP...</p>
  </div>

  <div v-else-if="notFound || !wedding" class="min-h-screen invite-backdrop flex items-center justify-center text-white text-center px-6">
    <div class="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
      <p class="text-xl font-display mb-4">We couldn't find that invitation.</p>
      <UButton to="/" variant="soft" color="neutral" class="rounded-full">Go home</UButton>
    </div>
  </div>

  <div v-else-if="wedding.content.rsvpEnabled === false" class="min-h-screen invite-backdrop flex items-center justify-center text-white text-center px-6" :style="styleVars">
    <div class="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl max-w-sm">
      <UIcon name="i-heroicons-envelope" class="w-10 h-10 text-gold-300/60 mb-4 mx-auto" />
      <p class="text-xl font-display mb-2">RSVP isn't needed for this celebration.</p>
      <p class="text-sm text-white/60 mb-6">{{ wedding.content.brideName }} &amp; {{ wedding.content.groomName }} aren't collecting RSVPs online — this is an invitation-only card.</p>
      <UButton :to="backHref" variant="soft" color="neutral" class="rounded-full">Back to invitation</UButton>
    </div>
  </div>

  <!-- VIP guests get a page that actually belongs to the cinematic world
       they just came from (the same layered gradient backdrop and
       double-ring gold frame VipCinematicInvite.vue uses) instead of the
       plain classic RSVP look - see .vip-rsvp-surface/.vip-rsvp-card below.
       A wedding with vipEnabled=false still gets the original classic
       treatment, unchanged. -->
  <section v-else class="min-h-screen theme-surface text-white flex items-center justify-center px-4 py-12 relative overflow-x-hidden" :class="{ 'vip-rsvp-surface': isVip }" :style="styleVars">
    <!-- The .theme-surface class (main.css) paints the gradient directly on
         this section, which grows to fit all content (step form, then the
         much-taller Thank You + Wishes Wall screen). An absolutely-positioned
         overlay div was used here before, sized via inset:0 to the section's
         computed height - on some mobile browsers that computed height can
         momentarily desync from the real scrollable content height (e.g. as
         the address bar collapses/expands), which briefly revealed a plain
         dark background below the fold. Painting the gradient straight on
         the growing section itself removes that failure mode entirely. -->
    <div v-if="wedding.content.coverPhotoUrl" class="absolute inset-0 z-0 opacity-40 transition-opacity duration-1000 animate-in fade-in pointer-events-none">
      <img :src="optimizedImageUrl(wedding.content.coverPhotoUrl, 1600)" alt="Background" loading="eager" fetchpriority="high" class="w-full h-full object-cover" />
      <div class="absolute inset-0" :style="{ background: `linear-gradient(to bottom, transparent, var(--theme-bg-to))` }"></div>
    </div>

    <PetalsBackground v-if="wedding.content.enablePetals !== false" :style-name="wedding.content.petalStyle" class="z-0 pointer-events-none" />
    <!-- The classic ornament SVG is styled to sit around the classic
         layout's plainer card - it clashes with the VIP double-ring frame
         below, so VIP guests simply don't see it (the frame itself is the
         ornament here). -->
    <CardOrnament v-if="!isVip" :style="wedding.content.ornamentStyle" color="var(--theme-accent)" class="z-0 pointer-events-none" />

    <!-- Same background-music track as the Opening/Details pages -
         MusicToggle just hooks into the already-running singleton player,
         so arriving here doesn't restart or interrupt it. -->
    <div v-if="wedding.content.audioSrc" class="fixed top-4 right-4 z-30">
      <MusicToggle :src="wedding.content.audioSrc" autoplay />
    </div>

    <UContainer class="max-w-xl w-full relative z-10 animate-fade-up">
      <div class="flex justify-center mb-6">
        <!-- This pill sits directly on the page's own theme background
             (not the always-dark form card below), which can be a light
             palette (Ivory Minimalist, Sky Serenade) - hardcoded white
             text/background here made it wash out to near-invisible on
             those. Theme-ink-based coloring keeps it legible on every
             theme, same as the title just below. -->
        <UButton :to="backHref" variant="ghost" color="neutral" size="sm" icon="i-heroicons-arrow-left" aria-label="Back to Cover" class="rounded-full backdrop-blur-sm px-4 border transition-colors text-[color-mix(in_srgb,var(--theme-ink)_70%,transparent)] hover:text-[var(--theme-ink)] bg-[color-mix(in_srgb,var(--theme-ink)_6%,transparent)] border-[color-mix(in_srgb,var(--theme-ink)_12%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-ink)_10%,transparent)]! active:bg-[color-mix(in_srgb,var(--theme-ink)_10%,transparent)]! active:text-[var(--theme-ink)]!">
          {{ wedding.content.rsvpReturnButton || 'Return to Invitation' }}
        </UButton>
      </div>

      <div class="text-center space-y-3 mb-8">
        <!-- VIP: same eyebrow-label-over-names shape every cinematic scene
             uses, so this page reads as a continuation of that card rather
             than a hand-off to a completely different, plainer page. -->
        <p v-if="isVip" class="vip-rsvp-eyebrow">{{ wedding.content.brideName }} &amp; {{ wedding.content.groomName }}</p>
        <!-- FIXED: Injected custom Google Font styling directly into the header -->
        <h1 class="text-5xl font-bold tracking-wide drop-shadow-md" :class="{ 'vip-rsvp-title': isVip }" :style="{ color: 'var(--theme-ink)', fontFamily: 'var(--theme-heading-font)' }">
          {{ wedding.content.rsvpTitle || 'RSVP' }}
        </h1>
        <div class="h-px w-24 mx-auto" :style="{ background: 'var(--theme-accent)' }" />
        <!-- Was hardcoded text-white/70 - same wash-out on light themes
             (Matcha Strawberry, Ivory, Sky) as the back-button pill above,
             which already uses this same --theme-ink color-mix pattern. -->
        <p v-if="wedding.content.rsvpDeadlineLabel" class="text-sm text-[color-mix(in_srgb,var(--theme-ink)_70%,transparent)] font-light tracking-wide pt-2">
          {{ wedding.content.rsvpDeadlineText || 'Kindly respond by' }} <span class="font-medium" :style="{ color: 'var(--theme-accent)' }">{{ wedding.content.rsvpDeadlineLabel }}</span>
        </p>
      </div>

      <UAlert
        v-if="!isConfigured"
        icon="i-heroicons-exclamation-triangle"
        color="warning"
        variant="soft"
        title="Configuration Missing"
        description="Firebase credentials are required to save RSVPs."
        class="mb-6 rounded-2xl"
      />

      <div
        class="rounded-3xl border backdrop-blur-xl shadow-2xl px-6 py-10 sm:px-10"
        :class="isVip ? 'vip-rsvp-card' : (cardStyleResolved === 'dark' ? 'classic-rsvp-card' : (cardStyleResolved === 'glass' ? 'classic-rsvp-card-glass' : 'classic-rsvp-card-theme'))"
        :style="isVip
          ? { '--card-text': '#ffffff', ...cardUiVars }
          : { borderColor: cardStyleResolved === 'glass' ? 'transparent' : 'var(--theme-accent-soft)', '--card-text': cardTextColorResolved, ...cardUiVars }"
      >
        <template v-if="!submitted">
          <div class="flex items-center justify-center gap-3 mb-10">
            <template v-for="(label, index) in steps" :key="label">
              <div class="flex items-center gap-3">
                <div class="step-dot transition-all duration-500" :class="index <= currentStep ? 'step-dot-active scale-110 shadow-lg' : ''">
                  <UIcon v-if="index < currentStep" name="i-heroicons-check" class="w-4 h-4" />
                  <span v-else>{{ index + 1 }}</span>
                </div>
                <span class="hidden sm:inline text-xs uppercase tracking-widest font-medium transition-colors duration-300" :class="index <= currentStep ? '' : 'text-[color-mix(in_srgb,var(--card-text)_30%,transparent)]'" :style="index <= currentStep ? { color: 'var(--theme-accent)' } : {}">
                  {{ label }}
                </span>
              </div>
              <div v-if="index < steps.length - 1" class="w-6 sm:w-12 h-px transition-colors duration-500" :class="index < currentStep ? 'bg-gold-400/50' : 'bg-[color-mix(in_srgb,var(--card-text)_10%,transparent)]'" />
            </template>
          </div>

          <div class="relative min-h-[300px]">
            <Transition :name="transitionName" mode="out-in">
              <div :key="currentStep" class="w-full">
                
                <template v-if="currentStep === 0">
                  <div class="space-y-8">
                    <UFormField :label="wedding.content.rsvpNameLabel || 'Name(s)'" name="name" :error="errors.name">
                      <UInput v-model="state.name" :placeholder="wedding.content.rsvpNamePlaceholder || 'Type your full name'" size="xl" class="w-full shadow-inner" variant="outline" />
                    </UFormField>

                    <div>
                      <p class="text-sm text-[color-mix(in_srgb,var(--card-text)_80%,transparent)] mb-3 font-medium">{{ wedding.content.rsvpAttendQuestion || 'Will you be attending?' }}</p>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label class="option-card" :class="{ 'option-card-active': state.attending === 'Yes' }">
                          <input v-model="state.attending" type="radio" value="Yes" class="sr-only">
                          <UIcon name="i-heroicons-check-circle" class="w-6 h-6 mb-2 opacity-80" />
                          <span class="font-medium">{{ wedding.content.rsvpAttendYes || 'Joyfully Accept' }}</span>
                        </label>
                        <label class="option-card" :class="{ 'option-card-active': state.attending === 'No' }">
                          <input v-model="state.attending" type="radio" value="No" class="sr-only">
                          <UIcon name="i-heroicons-x-circle" class="w-6 h-6 mb-2 opacity-80" />
                          <span class="font-medium">{{ wedding.content.rsvpAttendNo || 'Regretfully Decline' }}</span>
                        </label>
                      </div>
                      <p v-if="errors.attending" class="mt-2 text-sm text-red-400 font-medium animate-in fade-in">{{ errors.attending }}</p>
                    </div>
                  </div>
                </template>

                <template v-else-if="currentStep === 1">
                  <template v-if="state.attending === 'No'">
                    <div class="flex flex-col items-center justify-center h-full text-center space-y-4 pt-10">
                      <UIcon name="i-heroicons-envelope-open" class="w-12 h-12 text-[color-mix(in_srgb,var(--card-text)_30%,transparent)]" />
                      <p class="text-[color-mix(in_srgb,var(--card-text)_80%,transparent)] italic text-lg">
                        {{ fillNameToken(wedding.content.rsvpDeclineMessage || "We'll miss you, {name}! Feel free to leave us a wish on the next step.", state.name) }}
                      </p>
                    </div>
                  </template>
                  
                  <template v-else>
                    <div class="space-y-8 pt-2">
                      <UFormField :label="wedding.content.rsvpGuestLabel || 'Number of guests attending'" name="guestCount" :error="errors.guestCount">
                        <div class="flex justify-start">
                          <UInputNumber v-model="state.guestCount" :min="1" :max="10" size="lg" class="w-32 shadow-inner" />
                        </div>
                      </UFormField>

                      <div class="h-px w-full bg-[color-mix(in_srgb,var(--card-text)_5%,transparent)]"></div>

                      <div>
                        <p class="text-sm text-[color-mix(in_srgb,var(--card-text)_80%,transparent)] mb-3 font-medium">{{ wedding.content.rsvpSeatingLabel || 'Do you require special seating? (e.g., wheelchair access)' }}</p>
                        <div class="grid grid-cols-2 gap-4">
                          <label class="option-card-small" :class="{ 'option-card-active': state.specialSeating === true }">
                            <input v-model="state.specialSeating" type="radio" :value="true" class="sr-only"> {{ wedding.content.rsvpSeatingYesLabel || 'Yes' }}
                          </label>
                          <label class="option-card-small" :class="{ 'option-card-active': state.specialSeating === false }">
                            <input v-model="state.specialSeating" type="radio" :value="false" class="sr-only"> {{ wedding.content.rsvpSeatingNoLabel || 'No' }}
                          </label>
                        </div>
                        <p v-if="errors.specialSeating" class="mt-2 text-sm text-red-400 animate-in fade-in">{{ errors.specialSeating }}</p>
                      </div>

                      <UFormField :label="wedding.content.rsvpDietaryLabel || 'Dietary restrictions (if any)'" name="dietary">
                        <UInput v-model="state.dietary" :placeholder="wedding.content.rsvpDietaryPlaceholder || 'e.g. Vegetarian, No Seafood'" size="lg" class="w-full" />
                      </UFormField>
                    </div>
                  </template>
                </template>

                <template v-else-if="currentStep === 2">
                  <div class="space-y-6">
                    <UFormField :label="wedding.content.rsvpWishesLabel || 'Wishes & Blessings'" name="doa" :error="errors.doa">
                      <p class="italic text-xs mb-2 opacity-70" :style="{ color: 'var(--theme-accent)' }">{{ wedding.content.rsvpWishesSubtitle || 'Write your well wishes for the couple' }}</p>
                      <UTextarea v-model="state.doa" :placeholder="wedding.content.rsvpWishesPlaceholder || 'May your marriage be blessed...'" :rows="4" class="w-full resize-none custom-scrollbar shadow-inner text-base" />
                    </UFormField>

                    <div class="rounded-xl border border-[color-mix(in_srgb,var(--card-text)_10%,transparent)] bg-[color-mix(in_srgb,var(--card-text)_5%,transparent)] p-5 text-sm space-y-2 backdrop-blur-md shadow-inner">
                      <h4 class="font-semibold text-[var(--card-text)] mb-3 border-b border-[color-mix(in_srgb,var(--card-text)_10%,transparent)] pb-2">{{ wedding.content.rsvpSummaryTitle || 'RSVP Summary' }}</h4>
                      <div class="grid grid-cols-3 gap-2 text-[var(--card-text)]">
                        <span class="text-[color-mix(in_srgb,var(--card-text)_50%,transparent)]">{{ wedding.content.rsvpSummaryNameLabel || 'Name:' }}</span> <span class="col-span-2 font-medium">{{ state.name }}</span>
                        <span class="text-[color-mix(in_srgb,var(--card-text)_50%,transparent)]">{{ wedding.content.rsvpSummaryStatusLabel || 'Status:' }}</span> <span class="col-span-2 font-medium" :class="state.attending === 'Yes' ? 'text-emerald-400' : 'text-red-400'">{{ state.attending === 'Yes' ? (wedding.content.rsvpAttendingText || 'Attending') : (wedding.content.rsvpNotAttendingText || 'Not Attending') }}</span>
                        <template v-if="state.attending === 'Yes'">
                          <span class="text-[color-mix(in_srgb,var(--card-text)_50%,transparent)]">{{ wedding.content.rsvpSummaryGuestsLabel || 'Guests:' }}</span> <span class="col-span-2">{{ state.guestCount }}</span>
                          <span class="text-[color-mix(in_srgb,var(--card-text)_50%,transparent)]">{{ wedding.content.rsvpSummarySpecialLabel || 'Special:' }}</span> <span class="col-span-2">{{ state.specialSeating ? 'Yes' : 'No' }}</span>
                          <span v-if="state.dietary" class="text-[color-mix(in_srgb,var(--card-text)_50%,transparent)]">{{ wedding.content.rsvpSummaryDietaryLabel || 'Dietary:' }}</span> <span v-if="state.dietary" class="col-span-2">{{ state.dietary }}</span>
                        </template>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </Transition>
          </div>

          <div class="flex items-center justify-between mt-12 pt-6 border-t border-[color-mix(in_srgb,var(--card-text)_10%,transparent)] relative z-20">
            <UButton v-if="currentStep > 0" variant="ghost" color="neutral" icon="i-heroicons-arrow-left" class="text-[var(--card-text)] hover:bg-[color-mix(in_srgb,var(--card-text)_10%,transparent)]! active:bg-[color-mix(in_srgb,var(--card-text)_10%,transparent)]! rounded-full px-4" @click="goBack">{{ wedding.content.rsvpBackButton || 'Back' }}</UButton>
            <div v-else></div>
            
            <UButton v-if="currentStep < steps.length - 1" trailing-icon="i-heroicons-arrow-right" class="rounded-full px-8 shadow-md accent-btn" size="lg" @click="goNext">{{ wedding.content.rsvpContinueButton || 'Continue' }}</UButton>
            <UButton v-else size="lg" icon="i-heroicons-paper-airplane" :loading="submitting" class="rounded-full px-8 shadow-[0_0_20px_-5px_var(--theme-accent)] animate-glow accent-btn" @click="submitForm">{{ wedding.content.rsvpConfirmButton || 'Confirm RSVP' }}</UButton>
          </div>
        </template>

        <template v-else>
          <div class="text-center space-y-6 animate-in zoom-in duration-500 py-10">
            <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[color-mix(in_srgb,var(--card-text)_5%,transparent)] border-2 mb-2" :style="{ borderColor: 'var(--theme-accent)' }">
              <UIcon name="i-heroicons-check" class="w-12 h-12" :style="{ color: 'var(--theme-accent)' }" />
            </div>

            <!-- var(--card-text), not a literal white or var(--theme-ink) -
                 this sits inside the card, which can be either a fixed dark
                 card (Matcha Strawberry by default) or tinted with the
                 theme's own colors (every other theme by default) - see the
                 cardStyleResolved/cardTextColorResolved computeds above and
                 the --card-text custom property set on the card element. -->
            <div>
              <h2 class="text-4xl font-display mb-2 drop-shadow-md" :style="{ color: 'var(--card-text)' }">{{ fillNameToken(wedding.content.rsvpThankYouTitle || 'Thank you, {name}!', lastSubmittedName) }}</h2>
              <p class="text-[color-mix(in_srgb,var(--card-text)_80%,transparent)] text-lg font-light max-w-md mx-auto leading-relaxed">
                {{ wedding.content.rsvpThankYouIntro || 'Your RSVP has been securely received.' }} {{ lastAttending === 'Yes' ? (wedding.content.rsvpSuccessYes || 'We are absolutely thrilled to celebrate with you.') : (wedding.content.rsvpSuccessNo || 'You will be dearly missed.') }}
              </p>
            </div>

            <div class="pt-6">
              <UButton variant="soft" color="neutral" class="text-[var(--card-text)] rounded-full px-6 hover:bg-[color-mix(in_srgb,var(--card-text)_10%,transparent)] transition-colors" @click="resetForm">{{ wedding.content.rsvpSubmitAnotherButton || 'Submit another response' }}</UButton>
            </div>
          </div>

          <div class="mt-12 pt-10 border-t border-[color-mix(in_srgb,var(--card-text)_10%,transparent)] animate-fade-up delay-2">
            <WishesWall
              :wedding-id="wedding.id"
              :title="wedding.content.rsvpWishesWallTitle || 'Wishes & Blessings'"
              :empty-text="wedding.content.rsvpWishesEmptyText || 'Be the first to leave a wish 💛'"
            />
          </div>
        </template>
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
import confetti from 'canvas-confetti'
import { z } from 'zod'

const route = useRoute()
const slug = route.params.slug as string

const { wedding, loading, notFound } = useWeddingBySlug(slug)
const { themeStyleVars, resolveCardStyle } = useThemes()
const { db, isConfigured } = useFirebase()
const toast = useToast()

// Which look the RSVP card panel uses - 'dark' (fixed dark card, light
// text, only Matcha Strawberry defaults to this) or 'theme' (the card tints
// itself with the wedding's own theme colors and keeps that theme's own ink
// for text - self-consistent for every theme, since a theme's ink is always
// chosen to contrast with its own background). A couple's own cardStyle
// choice always wins over the theme's default - see useThemes.ts.
const cardStyleResolved = computed(() => {
  if (wedding.value?.content.cardStyle === 'glass') return 'glass'
  return resolveCardStyle(wedding.value?.themeId, wedding.value?.content.cardStyle)
})

// The single color every piece of text/border/overlay inside the card
// derives from (via the --card-text custom property set on the card
// element below) - a manual override wins, otherwise white for a dark
// card or the theme's own ink for a theme-tinted card.
const cardTextColorResolved = computed(() =>
  wedding.value?.content.cardTextColor || (cardStyleResolved.value === 'dark' ? '#ffffff' : 'var(--theme-ink)')
)

// Nuxt UI's own form fields (UInput/UInputNumber/UTextarea below) don't
// read --card-text at all - they read Nuxt UI's own semantic tokens
// (--ui-bg, --ui-border*, --ui-text-highlighted/dimmed, --ui-primary),
// which are fixed globally in app.config.ts (a dark "ink" background,
// gold primary) so every field rendered the exact same fixed dark pill
// regardless of the wedding's theme - visible as a mismatched dark box on
// any light theme like Matcha Strawberry. Since those are plain CSS custom
// properties, redefining them here on the card cascades to every Nuxt UI
// component nested inside it, with no need to touch each input
// individually or the app's global (admin-wide) color config.
const cardUiVars = computed(() => ({
  '--ui-bg': 'color-mix(in srgb, var(--card-text) 6%, transparent)',
  '--ui-bg-elevated': 'color-mix(in srgb, var(--card-text) 10%, transparent)',
  '--ui-bg-accented': 'color-mix(in srgb, var(--card-text) 14%, transparent)',
  '--ui-border': 'color-mix(in srgb, var(--card-text) 20%, transparent)',
  '--ui-border-accented': 'color-mix(in srgb, var(--card-text) 35%, transparent)',
  '--ui-border-muted': 'color-mix(in srgb, var(--card-text) 12%, transparent)',
  '--ui-text-highlighted': 'var(--card-text)',
  '--ui-text-dimmed': 'color-mix(in srgb, var(--card-text) 45%, transparent)',
  '--ui-text': 'color-mix(in srgb, var(--card-text) 80%, transparent)',
  '--ui-primary': 'var(--theme-accent)'
}))

// Whether this wedding is on the VIP Cinematic tier - drives both the
// visual skin below (.vip-rsvp-surface/.vip-rsvp-card) and where "Return to
// Invitation" sends the guest. Without this, VIP guests who tap RSVP get
// dropped onto the plain classic page with no way back into the cinematic
// one - see the bug report this fixes.
const isVip = computed(() => !!wedding.value?.vipEnabled)
const isPreviewRecording = computed(() => route.query.preview === '1')
// Present only on a link generated after the "two guests" duplicate-guest
// fix (see useGuests.ts's personalizedLink()) - identifies the existing
// guest doc this submission belongs to, so submitForm() below can update
// it in place instead of creating a second guest. Older links shared
// before this fix carry no gid and fall back to the original create-new
// behavior.
const guestId = computed(() => (typeof route.query.gid === 'string' && route.query.gid ? route.query.gid : ''))
const backHref = computed(() => {
  const params = new URLSearchParams()
  if (typeof route.query.to === 'string' && route.query.to) params.set('to', route.query.to)
  if (isPreviewRecording.value) params.set('preview', '1')
  const qs = params.toString()
  const suffix = qs ? `?${qs}` : ''
  return isVip.value ? `/w/${slug}/vip${suffix}` : `/w/${slug}${suffix}`
})

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

useHead({
  link: computed(() => {
    if (wedding.value?.content.customFontUrl && !wedding.value.content.customFontUrl.includes('fonts.google.com/specimen/')) {
      return [{ rel: 'stylesheet', href: wedding.value.content.customFontUrl }]
    }
    return []
  })
})

const steps = computed(() => [
  wedding.value?.content.rsvpStepAboutYou || 'About You',
  wedding.value?.content.rsvpStepDetails || 'Details',
  wedding.value?.content.rsvpStepWishes || 'Wishes'
])
const currentStep = ref(0)
const transitionName = ref('slide-left')
const submitting = ref(false)
const submitted = ref(false)
const lastSubmittedName = ref('')
const lastAttending = ref<'Yes' | 'No'>('Yes')

const state = reactive({
  name: (route.query.to as string) || '',
  attending: '' as 'Yes' | 'No' | '',
  guestCount: 1,
  specialSeating: null as boolean | null,
  dietary: '',
  doa: ''
})

const errors = reactive<Record<string, string>>({})

const nameSchema = z.string().trim().min(2, 'Please enter your name(s)')
const doaSchema = z.string().trim().min(3, 'A short wish means a lot \u{1F49B}').max(500, 'Keep it under 500 characters')

function clearErrors() {
  for (const key of Object.keys(errors)) delete errors[key]
}

function validateStep(step: number): boolean {
  clearErrors()
  if (step === 0) {
    const result = nameSchema.safeParse(state.name)
    if (!result.success) errors.name = result.error.issues[0]?.message ?? 'Please enter your name(s)'
    if (!state.attending) errors.attending = 'Please choose whether you can attend'
    return Object.keys(errors).length === 0
  }
  if (step === 1) {
    if (state.attending === 'No') return true
    if (!state.guestCount || state.guestCount < 1) {
      errors.guestCount = 'At least 1 guest'
    } else if (state.guestCount > 10) {
      errors.guestCount = 'For groups larger than 10, please contact us directly'
    }
    if (state.specialSeating === null) errors.specialSeating = 'Please choose an option'
    return Object.keys(errors).length === 0
  }
  if (step === 2) {
    const result = doaSchema.safeParse(state.doa)
    if (!result.success) errors.doa = result.error.issues[0]?.message ?? 'Please share a short wish'
    return Object.keys(errors).length === 0
  }
  return true
}

function goNext() {
  if (!validateStep(currentStep.value)) return
  transitionName.value = 'slide-left'
  currentStep.value = Math.min(currentStep.value + 1, steps.value.length - 1)
}

function goBack() {
  clearErrors()
  transitionName.value = 'slide-right'
  currentStep.value = Math.max(currentStep.value - 1, 0)
}

function fireConfetti() {
  if (!import.meta.client) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const accentColor = styleVars.value['--theme-accent'] || '#d4a017'
  confetti({ 
    particleCount: 150, 
    spread: 100, 
    origin: { y: 0.5 }, 
    colors: [accentColor, '#ffffff', '#f3ddaa'],
    disableForReducedMotion: true
  })
}

function resetForm() {
  state.name = ''
  state.attending = ''
  state.guestCount = 1
  state.specialSeating = null
  state.dietary = ''
  state.doa = ''
  clearErrors()
  transitionName.value = 'slide-right'
  currentStep.value = 0
  submitted.value = false
}

async function submitForm() {
  if (!validateStep(2) || !wedding.value) return

  if (!isConfigured || !db) {
    toast.add({ title: 'Firebase not configured', color: 'warning' })
    return
  }

  submitting.value = true
  try {
    if (isPreviewRecording.value) {
      // Marketing dry-run (see admin/wedding/[id]/record.vue) - skip every
      // real write so recording a demo can never plant a fake guest/wish,
      // but still fall through to the normal success UI below so the
      // "thank you" screen looks identical in the recorded video.
    } else {
      // Routed through a server endpoint (server/api/guests/rsvp.post.ts)
      // instead of writing straight to Firestore from here, because this
      // page can't read the guest list to check "does this guest already
      // exist?" (guests/{guestId}: allow read: if isOwner(...) - see
      // firestore.rules) - which is exactly what's needed to fix an
      // OLDER personalized link that only carries ?to=name with no
      // ?gid=: the server side uses the Admin SDK to look the guest up by
      // exact name and update that existing record instead of creating a
      // duplicate (the "two Jay" bug - manually adding a guest, then
      // opening their WhatsApp link and submitting, used to always create
      // a second, separate guest+wish pair). A newer link's ?gid= (see
      // useGuests.ts's personalizedLink()) skips the name lookup and
      // updates that exact guest doc directly.
      await $fetch('/api/guests/rsvp', {
        method: 'POST',
        body: {
          weddingId: wedding.value.id,
          gid: guestId.value || undefined,
          name: state.name.trim(),
          attending: state.attending,
          // specialSeating starts out `null` (unanswered) until step 2 is
          // reached, and validateStep() never requires an answer at all
          // when attending is 'No' - coerced to a plain boolean here since
          // the server's schema (server/api/guests/rsvp.post.ts) expects
          // one, not null.
          guestCount: state.attending === 'Yes' ? state.guestCount : 0,
          specialSeating: state.attending === 'Yes' ? !!state.specialSeating : false,
          dietary: state.attending === 'Yes' ? state.dietary.trim() : '',
          doa: state.doa.trim()
        }
      })

      // Fire-and-forget: push the fresh guest list into any connected Google
      // Drive folders (this couple's own, plus the admin's shared "RSVP
      // Lists" folder - see server/utils/guest-sync.ts) right away, so they
      // auto-update whenever a guest RSVPs instead of needing a manual
      // "Save to Drive" click. Deliberately not awaited and errors are
      // swallowed - a Drive hiccup must never affect this guest's own
      // already-successful submission.
      $fetch('/api/drive/sync', { method: 'POST', body: { weddingId: wedding.value.id } }).catch(() => {})
    }

    lastSubmittedName.value = state.name.trim()
    lastAttending.value = state.attending as 'Yes' | 'No'
    submitted.value = true
    fireConfetti()
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Submission failed', description: 'Please check your connection and try again.', color: 'error' })
  } finally {
    submitting.value = false
  }
}

watch(
  wedding,
  (value) => {
    if (!value) return
    useSeoMeta({ title: `RSVP — ${value.content.brideName} & ${value.content.groomName}` })
  },
  { immediate: true }
)
</script>

<style scoped>
/* The Continue / Confirm RSVP buttons previously used UButton's
   color="primary", which is a fixed brand color (gold, from
   app.config.ts) - so a couple using any theme other than the gold one
   (e.g. Lavender Dusk) saw a mismatched gold/orange button instead of
   their own theme's accent color. Forcing the theme accent here via
   !important makes these buttons match the couple's chosen theme exactly,
   same as every other accent-colored element on this page. */
.accent-btn {
  background-color: var(--theme-accent, #d4a017) !important;
  color: var(--theme-on-accent, #1f1400) !important;
}
.accent-btn:hover {
  filter: brightness(1.08);
}

/* .step-dot, .option-card etc below all derive their border/background
   tints from var(--card-text) - the one color the card element itself
   resolves to (white for a dark card, the theme's own ink for a
   theme-tinted card, or a couple's manual override) via the --card-text
   custom property set on .classic-rsvp-card/.classic-rsvp-card-theme/
   .vip-rsvp-card below. That keeps every one of these translucent overlays
   correctly readable no matter which of those three the card resolves to,
   without needing a separate light/dark copy of each rule. */
.step-dot {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid color-mix(in srgb, var(--card-text, #fff) 20%, transparent);
  color: color-mix(in srgb, var(--card-text, #fff) 50%, transparent);
  background: color-mix(in srgb, var(--card-text, #fff) 5%, transparent);
}

.step-dot-active {
  border-color: var(--theme-accent, #e3b04a);
  color: var(--card-text, #fff);
  background: var(--theme-accent-soft, rgba(212, 160, 23, 0.2));
}

.option-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1.5rem 1rem;
  border-radius: 1rem;
  border: 1px solid color-mix(in srgb, var(--card-text, #fff) 15%, transparent);
  background: color-mix(in srgb, var(--card-text, #fff) 3%, transparent);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.option-card:hover {
  border-color: color-mix(in srgb, var(--card-text, #fff) 30%, transparent);
  background: color-mix(in srgb, var(--card-text, #fff) 6%, transparent);
  transform: translateY(-2px);
}

.option-card-small {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem;
  border-radius: 0.75rem;
  border: 1px solid color-mix(in srgb, var(--card-text, #fff) 15%, transparent);
  background: color-mix(in srgb, var(--card-text, #fff) 3%, transparent);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}
.option-card-small:hover {
  border-color: color-mix(in srgb, var(--card-text, #fff) 30%, transparent);
  background: color-mix(in srgb, var(--card-text, #fff) 6%, transparent);
}

.option-card-active, .option-card-small.option-card-active {
  border-color: var(--theme-accent, #e3b04a);
  background: var(--theme-accent-soft, rgba(212, 160, 23, 0.15));
  color: var(--card-text, #fff);
  box-shadow: 0 4px 12px -2px rgba(212, 160, 23, 0.2);
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: absolute;
  width: 100%;
}

.slide-left-enter-from { opacity: 0; transform: translateX(40px); }
.slide-left-leave-to { opacity: 0; transform: translateX(-40px); }
.slide-right-enter-from { opacity: 0; transform: translateX(-40px); }
.slide-right-leave-to { opacity: 0; transform: translateX(40px); }

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: color-mix(in srgb, var(--card-text, #fff) 10%, transparent);
  border-radius: 10px;
}

/* VIP Cinematic skin - deliberately matches VipCinematicInvite.vue's own
   .cine-bg (same gradient recipe) and .cine-bordered-card (same double-ring
   frame) so this page reads as the same designed object as the invitation
   the guest just came from, not a hand-off to a generic form page. */
.vip-rsvp-surface {
  background:
    radial-gradient(600px 500px at 30% 4%, rgba(227, 176, 74, .14), transparent 60%),
    radial-gradient(700px 600px at 70% 22%, rgba(201, 120, 150, .10), transparent 60%),
    radial-gradient(700px 600px at 30% 45%, rgba(120, 140, 180, .08), transparent 60%),
    linear-gradient(175deg, var(--theme-bg-from, #2a1245), var(--theme-bg-via, #1c0f2e) 45%, var(--theme-bg-to, #150a20) 100%) !important;
}

.vip-rsvp-eyebrow {
  font-size: .66rem;
  letter-spacing: .32em;
  text-transform: uppercase;
  color: var(--theme-accent);
  margin-bottom: 2px;
}

.vip-rsvp-title {
  font-family: var(--theme-heading-font, 'Great Vibes', cursive) !important;
  font-weight: 500 !important;
  font-size: 3.25rem !important;
  letter-spacing: normal !important;
}

.vip-rsvp-card {
  background: linear-gradient(165deg, color-mix(in srgb, var(--theme-accent) 12%, var(--theme-bg-via, #1c0f2e)) 0%, var(--theme-bg-via, #1c0f2e) 55%, var(--theme-bg-to, #150a20) 100%);
  border-color: transparent;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--theme-accent) 70%, transparent),
    0 0 0 7px var(--theme-bg-to, #150a20),
    0 0 0 8px color-mix(in srgb, var(--theme-accent) 45%, transparent),
    0 25px 55px -20px rgba(0, 0, 0, .7);
  /* --card-text is set inline (see the card element's :style binding
     above) - always #fff for VIP, so this is just the fallback. */
  color: var(--card-text, #fff);
}

/* Three looks for the classic (non-VIP) card, chosen per-wedding by
   cardStyleResolved (see the script setup computed above, backed by
   useThemes.ts's resolveCardStyle):
     - .classic-rsvp-card: a fixed dark card, used when cardStyleResolved
       is 'dark' (Matcha Strawberry's default, or any couple's manual
       override). Guarantees enough darkness for light --card-text to read
       clearly regardless of the theme's own (possibly light) palette.
     - .classic-rsvp-card-theme: tints the card with the wedding's OWN
       theme colors and keeps that theme's own ink for text - the default
       for every other theme. This is what "follow the theme's colors,
       don't force a dark card" (as requested) means in practice: since a
       theme's ink is always chosen by its designer to contrast with that
       theme's own background, pairing them on the card is self-consistent
       for every theme without hardcoding a light/dark list anywhere.
     - .classic-rsvp-card-glass: forces a highly transparent, blurry glass 
       effect over the existing background.
   Every descendant in here (labels, option cards, step dots, the summary
   box, buttons) reads its color/border/background from --card-text via
   color-mix(), so both looks - and any couple's custom cardTextColor
   override - apply everywhere at once instead of needing a second copy of
   every rule. */
.classic-rsvp-card {
  background: linear-gradient(
    165deg,
    color-mix(in srgb, var(--theme-bg-via, #0b1c30) 30%, #0a1420) 0%,
    color-mix(in srgb, var(--theme-bg-to, #142a45) 25%, #050b14) 100%
  );
  color: var(--card-text, #fff);
}

.classic-rsvp-card-theme {
  background: linear-gradient(
    165deg,
    color-mix(in srgb, var(--theme-bg-via, #0b1c30) 92%, var(--theme-ink, #000) 8%) 0%,
    color-mix(in srgb, var(--theme-bg-to, #142a45) 88%, var(--theme-ink, #000) 12%) 100%
  );
  color: var(--card-text, var(--theme-ink, #fff));
}

.classic-rsvp-card-glass {
  background: rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(16px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.3) !important;
  color: var(--card-text, #ffffff) !important;
}
</style>