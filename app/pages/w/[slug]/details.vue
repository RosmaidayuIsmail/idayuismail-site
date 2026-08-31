<template>
  <div v-if="loading" class="min-h-screen invite-backdrop flex flex-col items-center justify-center text-white/60 space-y-4">
    <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gold-400" />
  </div>

  <div v-else-if="notFound || !wedding" class="min-h-screen invite-backdrop flex items-center justify-center text-white text-center px-6">
    <div class="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
      <p class="text-xl font-display mb-4">We couldn't find that invitation.</p>
      <UButton to="/" variant="soft" color="neutral" class="rounded-full">Go home</UButton>
    </div>
  </div>

  <div v-else class="min-h-screen theme-surface text-white px-4 py-8 sm:p-10 flex items-center justify-center relative overflow-hidden bg-ink-950" :style="styleVars">
    <div class="absolute inset-0 z-0 bg-gradient-to-b" :style="{ background: `linear-gradient(160deg, var(--theme-bg-from), var(--theme-bg-via), var(--theme-bg-to))` }"></div>
    
    <div v-if="wedding.content.coverPhotoUrl" class="absolute inset-0 z-0 transition-opacity duration-1000 animate-in fade-in" :class="wedding.content.hideSystemText ? 'opacity-100' : 'opacity-40'">
      <img :src="optimizedImageUrl(wedding.content.coverPhotoUrl, 1600)" alt="Background" loading="eager" fetchpriority="high" class="w-full h-full" :class="wedding.content.hideSystemText ? 'object-contain' : 'object-cover'" />
      <!-- Matches index.vue's hero: this fade used to always render even
           with hideSystemText on, muddying the bottom of a fully custom
           image that's meant to show as-is. -->
      <div v-if="!wedding.content.hideSystemText" class="absolute inset-0" :style="{ background: `linear-gradient(to bottom, transparent, var(--theme-bg-to))` }"></div>
    </div>

    <PetalsBackground v-if="wedding.content.enablePetals !== false" :style-name="wedding.content.petalStyle" :color="wedding.content.petalColor || ''" class="z-0" />
    <CardOrnament :style="wedding.content.ornamentStyle" :color="wedding.content.ornamentColor || 'var(--theme-accent)'" class="z-0" />

    <!-- Same background-music track as the Opening page - MusicToggle just
         hooks into the already-running singleton player, so navigating here
         doesn't restart or interrupt it. Fixed (not absolute) since this
         page scrolls, unlike the Opening page's single hero screen. -->
    <div v-if="wedding.content.audioSrc" class="fixed top-4 right-4 z-30">
      <MusicToggle :src="wedding.content.audioSrc" autoplay />
    </div>

    <div class="max-w-lg w-full relative z-10 animate-fade-up">
      <div class="flex items-center justify-between mb-6 px-2">
        <!-- Page-level chrome, not inside the card - so it reads off
             --theme-ink (dark on light themes like Matcha Strawberry, white
             on the dark themes) rather than a hardcoded white, which used to
             go invisible on any light-background theme. -->
        <UButton
          :to="coverLink"
          variant="ghost"
          color="neutral"
          size="md"
          icon="i-heroicons-arrow-left"
          aria-label="Back to Cover"
          class="rounded-full backdrop-blur-sm text-[color-mix(in_srgb,var(--theme-ink)_75%,transparent)] hover:text-[var(--theme-ink)] bg-[color-mix(in_srgb,var(--theme-ink)_8%,transparent)] border border-[color-mix(in_srgb,var(--theme-ink)_15%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-ink)_12%,transparent)]! active:bg-[color-mix(in_srgb,var(--theme-ink)_12%,transparent)]! active:text-[var(--theme-ink)]!"
        />
        <!-- accent-btn: was color="primary" (fixed brand gold) - now follows
             the couple's own theme accent, same fix as rsvp.vue's
             Continue/Confirm buttons. -->
        <UButton v-if="wedding.content.rsvpEnabled !== false" :to="rsvpLink" color="neutral" size="sm" class="accent-btn rounded-full shadow-lg font-semibold px-5">RSVP</UButton>
        <div v-else class="w-10" aria-hidden="true" />
      </div>

      <!-- Classic layout: today's one-card-at-a-time auto-advancing
           slideshow, unchanged. -->
      <template v-if="layoutMode !== 'menu'">
      <div class="flex gap-1.5 w-full mb-4 px-2">
        <div v-for="(_, index) in slideKeys.length" :key="index" class="h-1.5 flex-1 rounded-full bg-[color-mix(in_srgb,var(--theme-ink)_18%,transparent)] overflow-hidden cursor-pointer" @click="goTo(index)">
          <div
            class="h-full transition-all duration-300"
            :class="{ 'progress-bar': currentSlide === index, 'progress-paused': paused, 'w-full': index < currentSlide, 'w-0': index > currentSlide }"
            :style="{ background: index <= currentSlide ? 'var(--theme-accent)' : '' }"
          />
        </div>
      </div>

      <div
        ref="cardRef"
        class="relative backdrop-blur-xl border rounded-[2rem] shadow-2xl p-8 sm:p-10 min-h-[600px] sm:min-h-[640px] flex flex-col justify-center touch-pan-y transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        :class="cardStyleResolved === 'dark' ? 'classic-inner-card' : (cardStyleResolved === 'glass' ? 'classic-inner-card-glass' : 'classic-inner-card-theme')"
        :style="{ borderColor: cardStyleResolved === 'glass' ? 'transparent' : 'var(--theme-accent-soft)', '--card-text': cardTextColorResolved }"
        @mouseenter="paused = true"
        @mouseleave="paused = false"
      >
        <Transition :name="direction" mode="out-in">
          <div :key="currentSlide" class="space-y-6 text-center w-full absolute left-0 px-8 sm:px-10">
            <DetailsSlideContent
              :slide-key="currentKey"
              :content="wedding.content"
              :flow="wedding.flow"
              :menu="wedding.menu || []"
              :qr-code-url="qrCodeUrl"
              :monogram-display-text="monogramDisplayText"
              :monogram-font-family="monogramFontFamily"
            />
          </div>
        </Transition>

        <div class="absolute inset-y-0 left-0 w-1/4 z-10 cursor-pointer" @click="manualPrev"></div>
        <div class="absolute inset-y-0 right-0 w-1/4 z-10 cursor-pointer" @click="manualNext"></div>
      </div>

      <div class="flex justify-center gap-12 mt-6 text-[color-mix(in_srgb,var(--theme-ink)_45%,transparent)]">
        <button type="button" aria-label="Previous slide" class="hover:text-[var(--theme-ink)] transition-colors p-2 rounded-full hover:bg-[color-mix(in_srgb,var(--theme-ink)_10%,transparent)]" @click="manualPrev">
          <UIcon name="i-heroicons-chevron-left" class="w-8 h-8" />
        </button>
        <button type="button" aria-label="Next slide" class="hover:text-[var(--theme-ink)] transition-colors p-2 rounded-full hover:bg-[color-mix(in_srgb,var(--theme-ink)_10%,transparent)]" @click="manualNext">
          <UIcon name="i-heroicons-chevron-right" class="w-8 h-8" />
        </button>
      </div>
      </template>

      <!-- Book-flip layout: a real animated page-turn book (like
           menate.com.my/our-menu/) instead of tab-click switching - a
           closed cover you tap, then a genuine page-turn/slide animation
           between sections. See DetailsBookFlip.vue. -->
      <template v-else>
        <DetailsBookFlip
          :pages="bookPages"
          :content="wedding.content"
          :flow="wedding.flow"
          :menu="wedding.menu || []"
          :qr-code-url="qrCodeUrl"
          :monogram-display-text="monogramDisplayText"
          :monogram-font-family="monogramFontFamily"
          :card-style-resolved="cardStyleResolved"
          :card-text-color="cardTextColorResolved"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { autoMonogramText } from '~/composables/useWeddingTypes'

const route = useRoute()
const slug = route.params.slug as string

const guestNameQuery = computed(() => {
  const raw = route.query.to
  return typeof raw === 'string' ? raw : ''
})
// See index.vue's isPreviewRecording / withQuery for why this exists.
const isPreviewRecording = computed(() => route.query.preview === '1')
function withQuery(path: string) {
  const params = new URLSearchParams()
  if (guestNameQuery.value) params.set('to', guestNameQuery.value)
  if (isPreviewRecording.value) params.set('preview', '1')
  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}

const coverLink = computed(() => withQuery(`/w/${slug}`))
const rsvpLink = computed(() => withQuery(`/w/${slug}/rsvp`))

const { wedding, loading, notFound } = useWeddingBySlug(slug)
const { themeStyleVars, resolveCardStyle } = useThemes()

// BUG FIX: Stopped forcing the Glass card to use White ('#ffffff'). 
// Now, if you choose Glass, it will use your lovely dark burgundy Text Color (var(--theme-ink)).
const cardStyleResolved = computed(() => {
  if (wedding.value?.content.cardStyle === 'glass') return 'glass'
  return resolveCardStyle(wedding.value?.themeId, wedding.value?.content.cardStyle)
})

// Resolved to a literal color (styleVars.value['--theme-ink'], e.g.
// '#5b3a29') rather than left as the CSS reference 'var(--theme-ink)'. The
// Classic Slideshow card can get away with the CSS reference because it
// never leaves this page's own DOM subtree, but DetailsBookFlip hands this
// same value to the page-flip library, which physically moves
// (loadFromHTML reparents, not clones) each .book-page element into its
// own wrapper - see DetailsBookFlip.vue's onMounted comment. Once moved,
// 'var(--theme-ink)' can no longer see the --theme-ink custom property
// declared on this page's outer themed <div> (line 13's :style="styleVars"),
// so it silently falls through .book-page-theme's own fallback chain
// (color: var(--card-text, var(--theme-ink, #fff))) all the way to the
// literal #fff - invisible white text on this wedding's light cream
// background. A literal color has no such dependency: it's baked into this
// element's own inline style, so it survives being moved anywhere.
const cardTextColorResolved = computed(() =>
  wedding.value?.content.cardTextColor || (cardStyleResolved.value === 'dark' ? '#ffffff' : (styleVars.value['--theme-ink'] as string) || '#2a2a2a')
)

const monogramDisplayText = computed(() => {
  const content = wedding.value?.content
  if (!content) return ''
  if (content.monogramType === 'custom-text' && content.monogramText) return content.monogramText
  return autoMonogramText(content.brideName, content.groomName) || `${content.brideName?.charAt(0) || ''} & ${content.groomName?.charAt(0) || ''}`
})

const monogramFontFamily = computed(() => {
  const content = wedding.value?.content
  if (!content) return 'serif'
  if (content.monogramFontFamily) return content.monogramFontFamily
  return `'${content.monogramFont || 'Cormorant Garamond'}', serif`
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
    const links: Array<{ rel: string; href: string }> = []
    if (wedding.value?.content.customFontUrl && !wedding.value.content.customFontUrl.includes('fonts.google.com/specimen/')) {
      links.push({ rel: 'stylesheet', href: wedding.value.content.customFontUrl })
    }
    if (wedding.value?.content.monogramFontUrl && !wedding.value.content.monogramFontUrl.includes('fonts.google.com/specimen/')) {
      links.push({ rel: 'stylesheet', href: wedding.value.content.monogramFontUrl })
    }
    return links
  })
})

const slideKeys = computed(() => {
  if (!wedding.value) return ['story']
  const keys = ['story', 'couple']
  if (wedding.value.content.brideFullName || wedding.value.content.groomFullName) keys.push('family')
  keys.push('event')
  if (wedding.value.content.mapUrl) keys.push('location')
  if (wedding.value.content.enableGift && (
    wedding.value.content.bank?.accountNumber || wedding.value.content.bank?.qrCodeUrl ||
    wedding.value.content.bank2?.accountNumber || wedding.value.content.bank2?.qrCodeUrl
  )) {
    keys.push('gift')
  }
  if (wedding.value.flow?.length) keys.push('flow')
  if (wedding.value.menu?.length) keys.push('menu')
  return keys
})

// 'classic' (default) is today's auto-advancing slideshow; 'menu' is the
// tabbed, restaurant-menu-style browsing layout - see WeddingContent.detailsLayoutStyle.
const layoutMode = computed(() => (wedding.value?.content.detailsLayoutStyle === 'menu' ? 'menu' : 'classic'))

// Friendly tab labels for the Menu-style layout, reusing the couple's own
// section headings where they've customized one so a tab never disagrees
// with the heading shown once you tap it.
function slideLabel(key: string): string {
  const content = wedding.value?.content
  switch (key) {
    case 'story': return 'Our Story'
    case 'couple': return content?.coupleDividerLabel || 'Bride & Groom'
    case 'family': return 'Family'
    case 'event': return content?.detailsHeading || 'The Details'
    case 'location': return content?.locationHeading || 'Location'
    case 'gift': return 'Gift'
    case 'flow': return content?.eventFlowHeading || 'Event Flow'
    case 'menu': return content?.menuHeading || 'Menu'
    default: return key
  }
}

// Flattened { key, label } list handed to DetailsBookFlip - one book page
// per section, in the same order the classic slideshow uses.
const bookPages = computed(() => slideKeys.value.map(key => ({ key, label: slideLabel(key) })))

const currentSlide = ref(0)
const currentKey = computed(() => slideKeys.value[currentSlide.value] ?? 'story')
const direction = ref<'slide-next' | 'slide-prev'>('slide-next')
const paused = ref(false)
const cardRef = ref<HTMLElement | null>(null)

const qrCodeUrl = computed(
  () => `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(wedding.value?.content.mapUrl ?? '')}&size=200x200`
)

function goTo(index: number) {
  if (index === currentSlide.value) return
  direction.value = index > currentSlide.value ? 'slide-next' : 'slide-prev'
  currentSlide.value = index
  restartAutoSlide()
}

function next() {
  direction.value = 'slide-next'
  currentSlide.value = (currentSlide.value + 1) % slideKeys.value.length
}

function prev() {
  direction.value = 'slide-prev'
  currentSlide.value = (currentSlide.value - 1 + slideKeys.value.length) % slideKeys.value.length
}

// Called by user-facing controls (arrow buttons, click zones, swipe) so a
// manual navigation always restarts the 7s auto-advance window - without
// this, the background timer could fire moments after a manual click,
// making it look like the slide "flashed" then jumped on its own.
function manualNext() {
  next()
  restartAutoSlide()
}

function manualPrev() {
  prev()
  restartAutoSlide()
}

let autoSlideInterval: ReturnType<typeof setInterval> | null = null

function startAutoSlide() {
  autoSlideInterval = setInterval(() => {
    // Menu-style layout is meant to be browsed by tapping tabs, not
    // auto-advanced through - a guest reading one dish list shouldn't get
    // yanked to the next tab mid-read.
    if (!paused.value && layoutMode.value !== 'menu') next()
  }, 7000)
}

function restartAutoSlide() {
  if (autoSlideInterval) clearInterval(autoSlideInterval)
  startAutoSlide()
}

onMounted(() => {
  startAutoSlide()
})

onBeforeUnmount(() => {
  if (autoSlideInterval) clearInterval(autoSlideInterval)
})

const { direction: swipeDirection, isSwiping } = useSwipe(cardRef, {
  threshold: 40,
  onSwipeEnd() {
    if (swipeDirection.value === 'left') manualNext()
    else if (swipeDirection.value === 'right') manualPrev()
  }
})

watch(isSwiping, (value) => {
  paused.value = value
})

// Book-flip layout owns its own ArrowRight/ArrowLeft handling (it flips
// pages, not slides) - these only drive the classic slideshow.
onKeyStroke('ArrowRight', () => { if (layoutMode.value !== 'menu') manualNext() })
onKeyStroke('ArrowLeft', () => { if (layoutMode.value !== 'menu') manualPrev() })

watch(
  wedding,
  (value) => {
    if (!value) return
    useSeoMeta({ title: `Wedding Details — ${value.content.brideName} & ${value.content.groomName}` })
  },
  { immediate: true }
)
</script>

<style scoped>
/* Same fix as rsvp.vue's .accent-btn: UButton's color="primary" is a fixed
   brand gold (app.config.ts), not the couple's own theme. !important beats
   Nuxt UI's own color classes. */
.accent-btn {
  background-color: var(--theme-accent, #d4a017) !important;
  color: var(--theme-on-accent, #1f1400) !important;
}
.accent-btn:hover {
  filter: brightness(1.08);
}

.classic-inner-card {
  background: linear-gradient(
    165deg,
    color-mix(in srgb, var(--theme-bg-via, #0b1c30) 30%, #0a1420) 0%,
    color-mix(in srgb, var(--theme-bg-to, #142a45) 25%, #050b14) 100%
  );
  color: var(--card-text, #fff);
}

.classic-inner-card-theme {
  background: linear-gradient(
    165deg,
    color-mix(in srgb, var(--theme-bg-via, #0b1c30) 92%, var(--theme-ink, #000) 8%) 0%,
    color-mix(in srgb, var(--theme-bg-to, #142a45) 88%, var(--theme-ink, #000) 12%) 100%
  );
  color: var(--card-text, var(--theme-ink, #fff));
}

/* BUG FIX: The glass card now dynamically tints itself using your lovely pink background colors 
   and dark text ink, instead of looking like plain white frosted glass! */
.classic-inner-card-glass {
  background: color-mix(in srgb, var(--theme-bg-from, #ffffff) 30%, transparent) !important;
  backdrop-filter: blur(16px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
  border: 1px solid color-mix(in srgb, var(--theme-ink, #000000) 12%, transparent) !important;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.15) !important;
  color: var(--card-text, var(--theme-ink)) !important;
}

.progress-bar {
  animation: progress 7s linear forwards;
  width: 0%;
}

.progress-paused {
  animation-play-state: paused;
}

@keyframes progress {
  from { width: 0%; }
  to { width: 100%; }
}

.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-next-enter-from { opacity: 0; transform: scale(0.95) translateX(30px); }
.slide-next-leave-to { opacity: 0; transform: scale(0.95) translateX(-30px); }
.slide-prev-enter-from { opacity: 0; transform: scale(0.95) translateX(-30px); }
.slide-prev-leave-to { opacity: 0; transform: scale(0.95) translateX(30px); }

@media (prefers-reduced-motion: reduce) {
  .progress-bar {
    animation: none;
    width: 100%;
  }
  .slide-next-enter-active,
  .slide-next-leave-active,
  .slide-prev-enter-active,
  .slide-prev-leave-active {
    transition: opacity 0.3s ease;
  }
  .slide-next-enter-from, .slide-next-leave-to,
  .slide-prev-enter-from, .slide-prev-leave-to {
    transform: none;
  }
}
</style>