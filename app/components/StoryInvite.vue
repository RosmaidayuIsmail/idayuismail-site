<template>
  <!-- Desktop pass: see index.vue's identical wrapper - below lg this outer
       div is a no-op (its only child is w-full), at lg+ it centers a
       capped-width card on the theme's gradient backdrop instead of
       stretching the cover photo and hero text across the whole browser
       width. -->
  <div class="theme-surface flex justify-center" :style="styleVars">
    <div class="text-white relative overflow-hidden w-full max-w-[480px] lg:my-10 lg:rounded-[2rem] lg:shadow-[0_30px_90px_-20px_rgba(0,0,0,0.7)]">
    <CustomCodeBlock v-if="customCode.position === 'top'" class="relative z-20" />

    <!-- Same full-bleed cover-photo background layer as the classic layout,
         continuing behind the whole scroll (not just the cover scene) so the
         page reads as one continuous piece instead of a hero photo that
         abruptly stops. -->
    <div v-if="wedding.content.coverPhotoUrl" class="absolute inset-0 z-0 transition-opacity duration-700" :class="opened && coverPhotoLoaded ? 'opacity-100' : 'opacity-0'">
      <img
        :src="optimizedCoverPhotoUrl"
        alt="Background"
        loading="eager"
        fetchpriority="high"
        class="w-full h-full animate-[pulse_20s_ease-in-out_infinite_alternate]"
        :class="wedding.content.hideSystemText ? 'object-contain' : 'object-cover scale-105'"
        @load="coverPhotoLoaded = true"
      >
      <div v-if="!wedding.content.hideSystemText" class="absolute inset-0 bg-black/40"></div>
      <div class="absolute inset-0" :style="{ background: `linear-gradient(to bottom, transparent 0%, var(--theme-bg-to) 90%)` }" />
    </div>
    <PetalsBackground v-if="wedding.content.enablePetals !== false" :style-name="wedding.content.petalStyle" />
    <CardOrnament v-if="opened" :style="wedding.content.ornamentStyle" color="var(--theme-accent)" />

    <!-- Fixed (not absolute) since this page scrolls, same reasoning as
         details.vue's music toggle. -->
    <div v-if="opened && wedding.content.audioSrc" class="fixed top-4 right-4 z-30">
      <MusicToggle :src="wedding.content.audioSrc" autoplay />
    </div>

    <!-- SCENE: Cover. Identical hero canvas/positioning to the classic
         layout's opening screen (same EnvelopeIntro + the same admin-tuned
         icon/greeting/intro/names/date/venue placement fields) so switching
         a wedding into Story mode doesn't require re-tuning the cover. -->
    <div class="relative overflow-hidden" :style="{ minHeight: 'max(100vh, 700px)' }">
      <EnvelopeIntro v-model:opened="opened" :guest-name="guestName" :content="wedding.content" />

      <div v-if="opened && !wedding.content.hideSystemText" class="absolute inset-0 z-10">
        <div
          v-if="wedding.content.innerTopIcon && wedding.content.innerTopIcon !== 'none'"
          class="absolute flex flex-col items-center justify-center text-center w-full max-w-[92vw] px-4 animate-in fade-in zoom-in delay-100"
          :style="{ left: `${wedding.content.iconX ?? 50}%`, top: `${wedding.content.iconY ?? 15}%`, transform: 'translate(-50%, -50%)' }"
        >
          <p
            v-if="wedding.content.innerTopIcon === 'bismillah'"
            class="leading-relaxed"
            dir="rtl"
            :style="{
              color: 'var(--theme-accent)',
              fontFamily: `'Amiri', 'Traditional Arabic', serif`,
              fontSize: `clamp(1.25rem, ${3.2 * ((wedding.content.iconSize ?? 100) / 100)}vw, ${1.9 * ((wedding.content.iconSize ?? 100) / 100)}rem)`
            }"
          >بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
          <UIcon v-else-if="wedding.content.innerTopIcon === 'rings'" name="i-heroicons-lifebuoy" :style="{ color: 'var(--theme-accent)', width: `${2 * ((wedding.content.iconSize ?? 100) / 100)}rem`, height: `${2 * ((wedding.content.iconSize ?? 100) / 100)}rem` }" />
          <UIcon v-else-if="wedding.content.innerTopIcon === 'heart'" name="i-heroicons-heart" :style="{ color: 'var(--theme-accent)', width: `${2 * ((wedding.content.iconSize ?? 100) / 100)}rem`, height: `${2 * ((wedding.content.iconSize ?? 100) / 100)}rem` }" />
          <img v-else-if="wedding.content.innerTopIcon === 'custom' && wedding.content.customIconUrl" :src="wedding.content.customIconUrl" alt="" class="object-contain drop-shadow" :style="{ width: `${7 * ((wedding.content.iconSize ?? 100) / 100)}rem`, height: 'auto', maxWidth: '90vw', maxHeight: `${7 * ((wedding.content.iconSize ?? 100) / 100)}rem` }">
          <p v-if="wedding.content.iconSubtitle" class="mt-3 text-xs sm:text-sm text-white/60 italic">{{ wedding.content.iconSubtitle }}</p>
        </div>

        <div
          class="absolute w-full max-w-3xl text-center px-4 flex flex-col items-center transition-all duration-700 animate-in fade-in zoom-in delay-150"
          :style="{ left: `${wedding.content.greetingX ?? 50}%`, top: `${wedding.content.greetingY ?? 25}%`, transform: 'translate(-50%, -50%)' }"
        >
          <h1 class="text-sm sm:text-base tracking-[0.35em] uppercase drop-shadow-md" :style="{ color: 'var(--theme-accent)', fontWeight: 'var(--theme-text-weight)' }">
            {{ wedding.content.innerGreeting || "You're Invited" }}
          </h1>
        </div>

        <div
          class="absolute w-full max-w-3xl text-center px-4 flex flex-col items-center transition-all duration-700 animate-in fade-in zoom-in delay-300"
          :style="{ left: `${wedding.content.introX ?? 50}%`, top: `${wedding.content.introY ?? 32}%`, transform: 'translate(-50%, -50%)' }"
        >
          <p class="text-base sm:text-lg text-white/80 italic drop-shadow-md" :style="{ fontWeight: 'var(--theme-text-weight)' }">
            {{ wedding.content.innerIntro || "To the wedding celebration of" }}
          </p>
        </div>

        <div
          class="absolute w-full max-w-3xl text-center px-4 flex flex-col items-center transition-all duration-700 animate-in fade-in zoom-in delay-300"
          :style="{ left: `${wedding.content.namesX ?? 50}%`, top: `${wedding.content.namesY ?? 50}%`, transform: 'translate(-50%, -50%)' }"
        >
          <div v-if="wedding.content.namesLayout === 'vertical'" class="flex flex-col items-center gap-0 font-heading drop-shadow-2xl" :style="{ color: wedding.content.nameColor || 'var(--theme-ink)', fontFamily: 'var(--theme-heading-font)', fontSize: `clamp(${2 * ((wedding.content.nameSize ?? 100) / 100)}rem, ${4.2 * ((wedding.content.nameSize ?? 100) / 100)}vw, ${3 * ((wedding.content.nameSize ?? 100) / 100)}rem)`, lineHeight: '1.15' }">
            <span>{{ wedding.content.brideName }}</span>
            <span class="text-[0.4em] opacity-80 leading-none" style="color: #e3b04a;">&amp;</span>
            <span>{{ wedding.content.groomName }}</span>
          </div>
          <div v-else-if="wedding.content.namesLayout === 'diagonal'" class="flex flex-col font-heading drop-shadow-2xl w-full max-w-xs mx-auto" :style="{ color: wedding.content.nameColor || 'var(--theme-ink)', fontFamily: 'var(--theme-heading-font)', fontSize: `clamp(${2.5 * ((wedding.content.nameSize ?? 100) / 100)}rem, ${5 * ((wedding.content.nameSize ?? 100) / 100)}vw, ${3.5 * ((wedding.content.nameSize ?? 100) / 100)}rem)`, lineHeight: '1.1' }">
            <span class="self-start text-left ml-4 sm:-ml-8">{{ wedding.content.brideName }}</span>
            <span class="text-[0.5em] opacity-80 leading-none self-center my-2" style="color: #e3b04a;">&amp;</span>
            <span class="self-end text-right mr-4 sm:-mr-8">{{ wedding.content.groomName }}</span>
          </div>
          <h2 v-else class="drop-shadow-2xl leading-tight" :style="{ color: wedding.content.nameColor || 'var(--theme-ink)', fontFamily: 'var(--theme-heading-font)', fontSize: `clamp(${3.5 * ((wedding.content.nameSize ?? 100) / 100)}rem, ${8 * ((wedding.content.nameSize ?? 100) / 100)}vw, ${6 * ((wedding.content.nameSize ?? 100) / 100)}rem)` }">
            {{ wedding.content.brideName }} <span class="text-[0.7em] mx-2 opacity-80" style="color: #e3b04a;">&amp;</span> {{ wedding.content.groomName }}
          </h2>
        </div>

        <div
          class="absolute w-full max-w-3xl text-center px-4 flex flex-col items-center transition-all duration-700 animate-in fade-in zoom-in delay-500"
          :style="{ left: `${wedding.content.dateX ?? 50}%`, top: `${wedding.content.dateY ?? 70}%`, transform: 'translate(-50%, -50%)' }"
        >
          <p class="text-sm sm:text-base font-medium text-white/90 drop-shadow-md">{{ wedding.content.dateLabel }}</p>
        </div>

        <div
          class="absolute w-full max-w-md text-center px-4 flex flex-col items-center transition-all duration-700 animate-in fade-in zoom-in delay-500"
          :style="{ left: `${wedding.content.venueX ?? 50}%`, top: `${wedding.content.venueY ?? 78}%`, transform: 'translate(-50%, -50%)' }"
        >
          <p v-if="wedding.content.venueAddress" class="text-xs sm:text-sm text-white/80 italic drop-shadow-md" :style="{ fontWeight: 'var(--theme-text-weight)' }">{{ wedding.content.venueAddress }}</p>
        </div>
      </div>

      <!-- "Scroll for more" cue replaces the classic layout's two footer
           buttons here - in Story mode scrolling itself is the way forward,
           there's nothing to tap. -->
      <div v-if="opened" class="absolute bottom-4 inset-x-0 flex justify-center z-10 pointer-events-none animate-bounce opacity-60">
        <UIcon name="i-heroicons-chevron-down" class="w-6 h-6" :style="{ color: 'var(--theme-accent)' }" />
      </div>
    </div>

    <!-- Scroll-revealed scenes below the cover. Each one only ever enters
         once (ScrollReveal is reveal-once), the same "each scene animates in
         as you scroll to it" feel as the reference invitation, built entirely
         from fields the classic Details carousel already uses. -->
    <div v-if="opened" class="relative z-20 max-w-lg w-full mx-auto px-6 pb-20 pt-16 space-y-24">

      <!-- SCENE: Couple - names + monogram, plus bride/groom photos when set
           (the "couple photo" moment from the reference video). -->
      <ScrollReveal v-if="!wedding.content.hideSystemText" class="text-center">
        <div v-if="wedding.content.bridePhotoUrl || wedding.content.groomPhotoUrl" class="flex items-center justify-center gap-4 mb-6">
          <img v-if="wedding.content.bridePhotoUrl" :src="wedding.content.bridePhotoUrl" alt="" class="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-2" :style="{ borderColor: 'var(--theme-accent)' }">
          <UIcon name="i-heroicons-heart" class="w-5 h-5 opacity-70 flex-shrink-0" :style="{ color: 'var(--theme-accent)' }" />
          <img v-if="wedding.content.groomPhotoUrl" :src="wedding.content.groomPhotoUrl" alt="" class="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-2" :style="{ borderColor: 'var(--theme-accent)' }">
        </div>
        <h2 class="text-4xl sm:text-5xl leading-tight drop-shadow-lg" :style="{ color: 'var(--theme-ink)', fontFamily: 'var(--theme-heading-font)' }">
          {{ wedding.content.brideName }} <br>
          <span class="text-[0.6em] opacity-80" :style="{ color: 'var(--theme-accent)' }">&amp;</span> <br>
          {{ wedding.content.groomName }}
        </h2>
        <div class="h-px w-16 mx-auto my-4" :style="{ background: 'var(--theme-accent)' }"></div>
        <p class="text-sm uppercase tracking-widest text-white/60">{{ wedding.content.coupleDividerLabel || 'Bride & Groom' }}</p>
        <div v-if="wedding.content.monogramEnabled" class="mt-5 flex justify-center">
          <img v-if="wedding.content.monogramType === 'upload' && wedding.content.monogramImageUrl" :src="wedding.content.monogramImageUrl" alt="Monogram" class="w-12 h-12 object-contain opacity-90">
          <span v-else class="text-2xl" :style="{ fontFamily: monogramFontFamily, color: 'var(--theme-accent)' }">{{ monogramDisplayText }}</span>
        </div>
      </ScrollReveal>

      <!-- SCENE: Greeting/story message -->
      <ScrollReveal v-if="!wedding.content.hideSystemText && wedding.content.story" class="text-center">
        <div v-if="wedding.content.detailsTopIcon && wedding.content.detailsTopIcon !== 'none'" class="flex justify-center mb-4 w-full px-2">
          <p
            v-if="wedding.content.detailsTopIcon === 'bismillah'"
            class="leading-relaxed"
            dir="rtl"
            :style="{
              color: 'var(--theme-accent)',
              fontFamily: `'Amiri', 'Traditional Arabic', serif`,
              fontSize: `clamp(1rem, ${3 * ((wedding.content.detailsIconSize ?? 100) / 100)}vw, ${1.6 * ((wedding.content.detailsIconSize ?? 100) / 100)}rem)`
            }"
          >بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
          <UIcon v-else-if="wedding.content.detailsTopIcon === 'rings'" name="i-heroicons-lifebuoy" :style="{ color: 'var(--theme-accent)', width: `${2.5 * ((wedding.content.detailsIconSize ?? 100) / 100)}rem`, height: `${2.5 * ((wedding.content.detailsIconSize ?? 100) / 100)}rem` }" />
          <UIcon v-else-if="wedding.content.detailsTopIcon === 'heart'" name="i-heroicons-heart" :style="{ color: 'var(--theme-accent)', width: `${2.5 * ((wedding.content.detailsIconSize ?? 100) / 100)}rem`, height: `${2.5 * ((wedding.content.detailsIconSize ?? 100) / 100)}rem` }" />
          <img v-else-if="wedding.content.detailsTopIcon === 'custom' && wedding.content.customIconUrl" :src="wedding.content.customIconUrl" alt="" class="object-contain drop-shadow" :style="{ width: `${7 * ((wedding.content.detailsIconSize ?? 100) / 100)}rem`, height: 'auto', maxWidth: '85%', maxHeight: `${7 * ((wedding.content.detailsIconSize ?? 100) / 100)}rem` }">
        </div>
        <p class="text-white/90 text-lg leading-relaxed whitespace-pre-line" :style="{ fontWeight: 'var(--theme-text-weight)' }">{{ wedding.content.story }}</p>
      </ScrollReveal>

      <!-- SCENE: Family / parents, only when that data has been filled in -->
      <ScrollReveal v-if="!wedding.content.hideSystemText && (wedding.content.brideFullName || wedding.content.groomFullName)" class="text-center">
        <div v-if="wedding.content.brideFullName || wedding.content.brideParents" class="space-y-1">
          <p class="text-xs uppercase tracking-widest font-semibold mb-2" :style="{ color: 'var(--theme-accent)' }">{{ wedding.content.familyBrideLabel || 'Bride' }}</p>
          <p class="font-bold text-lg text-white/90">{{ wedding.content.brideFullName }}</p>
          <p class="text-sm text-white/70" :style="{ fontWeight: 'var(--theme-text-weight)' }">{{ wedding.content.childOfLabel || 'Child of' }} <br>{{ wedding.content.brideParents }}</p>
        </div>
        <div class="h-px bg-white/10 w-24 mx-auto my-6" />
        <div v-if="wedding.content.groomFullName || wedding.content.groomParents" class="space-y-1">
          <p class="text-xs uppercase tracking-widest font-semibold mb-2" :style="{ color: 'var(--theme-accent)' }">{{ wedding.content.familyGroomLabel || 'Groom' }}</p>
          <p class="font-bold text-lg text-white/90">{{ wedding.content.groomFullName }}</p>
          <p class="text-sm text-white/70" :style="{ fontWeight: 'var(--theme-text-weight)' }">{{ wedding.content.childOfLabel || 'Child of' }} <br>{{ wedding.content.groomParents }}</p>
        </div>
      </ScrollReveal>

      <!-- SCENE: Event details + add-to-calendar -->
      <ScrollReveal class="text-center">
        <div v-if="!wedding.content.hideSystemText">
          <h2 class="font-display font-semibold text-2xl mb-6" :style="{ color: 'var(--theme-accent)' }">{{ wedding.content.detailsHeading || 'The Details' }}</h2>
          <div class="space-y-4 text-white/90">
            <div v-if="wedding.content.dateLabel" class="flex flex-col items-center">
              <UIcon name="i-heroicons-calendar" class="w-5 h-5 mb-1 opacity-70" />
              <p class="font-medium text-lg">{{ wedding.content.dateLabel }}</p>
            </div>
            <div v-if="wedding.content.timeLabel" class="flex flex-col items-center">
              <UIcon name="i-heroicons-clock" class="w-5 h-5 mb-1 opacity-70" />
              <p class="font-medium text-lg">{{ wedding.content.timeLabel }}</p>
            </div>
            <div v-if="wedding.content.venueName" class="flex flex-col items-center pt-2">
              <UIcon name="i-heroicons-building-office-2" class="w-5 h-5 mb-1 opacity-70" />
              <p class="font-semibold text-lg">{{ wedding.content.venueName }}</p>
              <p class="text-sm text-white/60 mt-1 max-w-[250px] mx-auto">{{ wedding.content.venueAddress }}</p>
            </div>
          </div>
        </div>
        <div class="flex justify-center pt-6" :class="{ 'pt-12': wedding.content.hideSystemText }">
          <AddToCalendarButton
            :bride-name="wedding.content.brideName"
            :groom-name="wedding.content.groomName"
            :date-iso="wedding.content.dateISO"
            :venue-name="wedding.content.venueName"
            :venue-address="wedding.content.venueAddress"
            :rsvp-deadline-label="wedding.content.rsvpDeadlineLabel"
            :label="wedding.content.calendarButtonLabel"
            class="rounded-full shadow-lg"
          />
        </div>
      </ScrollReveal>

      <!-- SCENE: Location + QR, only when a map link is set -->
      <ScrollReveal v-if="wedding.content.mapUrl" class="text-center">
        <h2 class="font-display font-semibold text-2xl mb-2" :style="{ color: 'var(--theme-accent)' }">{{ wedding.content.locationHeading || 'Location' }}</h2>
        <p class="text-sm text-white/60 mb-6">{{ wedding.content.locationSubtitle || 'Scan or tap to open in Maps' }}</p>
        <div class="flex flex-col items-center gap-6">
          <div class="qr-card p-3 rounded-2xl shadow-xl">
            <img :src="qrCodeUrl" :alt="`QR code linking to the venue on ${wedding.content.locationMapsButtonLabel || 'Google Maps'}`" class="w-36 h-36" loading="lazy">
          </div>
          <UButton :to="wedding.content.mapUrl" target="_blank" external icon="i-heroicons-map-pin" color="neutral" class="accent-btn font-semibold rounded-full px-6 shadow-md">
            {{ wedding.content.locationMapsButtonLabel || 'Google Maps' }}
          </UButton>
        </div>
      </ScrollReveal>

      <!-- SCENE: Gift, only when enabled and a bank/QR has been filled in -->
      <ScrollReveal v-if="hasGift" class="text-center">
        <h2 class="font-display font-semibold text-2xl mb-4" :style="{ color: 'var(--theme-accent)' }">A Gift of Love</h2>
        <GiftCard :banks="[wedding.content.bank, wedding.content.bank2]" />
      </ScrollReveal>

      <!-- SCENE: Event flow / itinerary -->
      <ScrollReveal v-if="wedding.flow?.length" class="text-center">
        <h2 class="font-display font-semibold text-2xl mb-6" :style="{ color: 'var(--theme-accent)' }">{{ wedding.content.eventFlowHeading || 'Event Flow' }}</h2>
        <FlowTimeline :items="wedding.flow" />
      </ScrollReveal>

      <!-- SCENE: Closing - countdown + RSVP call to action, the last beat in
           the reference invitation's scroll. -->
      <ScrollReveal class="flex flex-col items-center text-center">
        <div v-if="wedding.content.dateISO" class="mb-8 w-full">
          <CountdownTimer :target="wedding.content.dateISO" />
        </div>
        <UButton
          v-if="wedding.content.rsvpEnabled !== false"
          :to="rsvpLink"
          size="xl"
          color="primary"
          class="w-full sm:w-auto font-semibold rounded-full px-10 shadow-[0_0_30px_-5px_var(--theme-accent)] hover:scale-105 transition-transform animate-glow"
        >
          {{ wedding.content.btnRsvp || 'RSVP Now' }}
        </UButton>
        <div class="mt-6 opacity-80 hover:opacity-100 transition-opacity">
          <ShareButtons :bride-name="wedding.content.brideName" :groom-name="wedding.content.groomName" :date-label="wedding.content.dateLabel" :share-message="wedding.content.shareMessage" />
        </div>
      </ScrollReveal>

      <CustomCodeBlock v-if="customCode.position !== 'top'" class="w-full" />
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// The "Story" layout: everything the classic Opening -> Details -> RSVP
// three-page flow shows, presented instead as one continuously-scrolling
// page with scroll-triggered scene reveals (see ScrollReveal.vue) - built
// to match the feel of a reference invitation the client shared. Reuses the
// exact wedding.content/wedding.flow fields the classic Details carousel
// (details.vue) already reads, so there is no new content to fill in when a
// couple switches into this layout.
import type { WeddingDoc } from '~/composables/useWeddingTypes'
import { autoMonogramText } from '~/composables/useWeddingTypes'

const props = withDefaults(defineProps<{
  wedding: WeddingDoc
  guestName?: string
  rsvpLink: string
}>(), {
  guestName: ''
})

const { themeStyleVars, customCode } = useThemes()

const styleVars = computed(() =>
  themeStyleVars(
    props.wedding.themeId,
    {
      bgFrom: props.wedding.content.customBgFrom,
      bgTo: props.wedding.content.customBgTo,
      accent: props.wedding.content.customAccent
    },
    props.wedding.content.customFontFamily || props.wedding.content.fontFamily,
    props.wedding.content.textWeight
  )
)

const optimizedCoverPhotoUrl = computed(() => optimizedImageUrl(props.wedding.content.coverPhotoUrl, 1600))
const coverPhotoLoaded = ref(false)

const opened = ref(false)

const qrCodeUrl = computed(
  () => `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(props.wedding.content.mapUrl ?? '')}&size=200x200`
)

const hasGift = computed(() => {
  const content = props.wedding.content
  return !!(content.enableGift && (
    content.bank?.accountNumber || content.bank?.qrCodeUrl ||
    content.bank2?.accountNumber || content.bank2?.qrCodeUrl
  ))
})

const monogramDisplayText = computed(() => {
  const content = props.wedding.content
  if (content.monogramType === 'custom-text' && content.monogramText) return content.monogramText
  return autoMonogramText(content.brideName, content.groomName) || `${content.brideName?.charAt(0) || ''} & ${content.groomName?.charAt(0) || ''}`
})

const monogramFontFamily = computed(() => {
  const content = props.wedding.content
  if (content.monogramFontFamily) return content.monogramFontFamily
  return `'${content.monogramFont || 'Cormorant Garamond'}', serif`
})
</script>

<style scoped>
/* Nuxt UI's "primary"/"neutral" colors are fixed, not per-wedding theme
   colors, so the Maps button needs its own copy of the theme-following
   button style (same fix as DetailsSlideContent.vue). */
.accent-btn {
  background-color: var(--theme-accent, #d4a017) !important;
  color: var(--theme-on-accent, #1f1400) !important;
}
.accent-btn:hover {
  filter: brightness(1.08);
}
/* Light accent tint keeps the QR scannable while matching the theme. */
.qr-card {
  background: color-mix(in srgb, var(--theme-accent, #d4a017) 10%, #fff);
  border: 1px solid color-mix(in srgb, var(--theme-accent, #d4a017) 25%, transparent);
}
</style>
