<template>
  <div v-if="loading" class="min-h-screen invite-backdrop flex flex-col items-center justify-center text-white/60 space-y-4">
    <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gold-400" />
    <p class="animate-pulse tracking-widest uppercase text-xs">Loading Invitation...</p>
  </div>

  <div v-else-if="notFound || !wedding" class="min-h-screen invite-backdrop flex items-center justify-center text-white text-center px-6">
    <div class="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
      <UIcon name="i-heroicons-document-magnifying-glass" class="w-12 h-12 text-gold-300/50 mb-4 mx-auto" />
      <p class="text-xl font-display mb-6">We couldn't find that invitation.</p>
      <UButton to="/" variant="soft" color="neutral" size="lg" class="rounded-full px-8">Return Home</UButton>
    </div>
  </div>

  <div v-else-if="wedding.content.layoutStyle !== 'story'" class="theme-surface text-white relative overflow-hidden" :style="styleVars">
    <CustomCodeBlock v-if="customCode.position === 'top'" class="relative z-20" />

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
      <!-- Conditionally disable the dark gradient over the top using the toggle switch! -->
      <div v-if="!wedding.content.hideSystemText && !wedding.content.openingRemoveOverlay" class="absolute inset-0" :style="{ backgroundColor: `rgba(0, 0, 0, var(--overlay-tint, 0.4))` }"></div>
      
      <!-- BUT always preserve the gentle bottom fade so the timer stays readable -->
      <div v-if="!wedding.content.hideSystemText" class="absolute inset-0" :style="{ background: `linear-gradient(to bottom, transparent 0%, var(--theme-bg-to) 90%)` }" />
    </div>
    <PetalsBackground v-if="wedding.content.enablePetals !== false" :style-name="wedding.content.petalStyle" :color="wedding.content.petalColor || ''" />
    <CardOrnament v-if="opened" :style="wedding.content.ornamentStyle" :color="wedding.content.ornamentColor || 'var(--theme-accent)'" />

    <div class="relative overflow-hidden" :style="{ minHeight: 'max(100vh, 700px)' }">
      <EnvelopeIntro v-model:opened="opened" :guest-name="guestName" :content="wedding.content" />

      <div v-if="opened" class="absolute top-6 right-6 z-30">
        <MusicToggle v-if="wedding.content.audioSrc" :src="wedding.content.audioSrc" autoplay />
      </div>

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
          <p v-if="wedding.content.iconSubtitle" class="mt-3 text-xs sm:text-sm text-[color-mix(in_srgb,var(--theme-ink)_60%,transparent)] italic" :class="{ 'overlay-text-shadow': !wedding.content.openingRemoveOverlay }">{{ wedding.content.iconSubtitle }}</p>
        </div>

        <div
          class="absolute w-full max-w-3xl text-center px-4 flex flex-col items-center transition-all duration-700 animate-in fade-in zoom-in delay-150"
          :style="{ left: `${wedding.content.greetingX ?? 50}%`, top: `${wedding.content.greetingY ?? 25}%`, transform: 'translate(-50%, -50%)' }"
        >
          <h1 class="text-sm sm:text-base tracking-[0.35em] uppercase" :class="{ 'overlay-text-shadow': !wedding.content.openingRemoveOverlay }" :style="{ color: 'var(--theme-accent)', fontWeight: 'var(--theme-text-weight)' }">
            {{ wedding.content.innerGreeting || "You're Invited" }}
          </h1>
        </div>

        <div
          class="absolute w-full max-w-3xl text-center px-4 flex flex-col items-center transition-all duration-700 animate-in fade-in zoom-in delay-300"
          :style="{ left: `${wedding.content.introX ?? 50}%`, top: `${wedding.content.introY ?? 32}%`, transform: 'translate(-50%, -50%)' }"
        >
          <p class="text-base sm:text-lg text-[color-mix(in_srgb,var(--theme-ink)_80%,transparent)] italic" :class="{ 'overlay-text-shadow': !wedding.content.openingRemoveOverlay }" :style="{ fontWeight: 'var(--theme-text-weight)' }">
            {{ wedding.content.innerIntro || "To the wedding celebration of" }}
          </p>
        </div>

        <div
          class="absolute w-full max-w-3xl text-center px-4 flex flex-col items-center transition-all duration-700 animate-in fade-in zoom-in delay-300"
          :style="{ left: `${wedding.content.namesX ?? 50}%`, top: `${wedding.content.namesY ?? 50}%`, transform: 'translate(-50%, -50%)' }"
        >
          <div v-if="wedding.content.namesLayout === 'vertical'" class="flex flex-col items-center gap-0 font-heading drop-shadow-2xl" :style="{ color: wedding.content.nameColor || 'var(--theme-ink)', fontFamily: 'var(--theme-heading-font)', fontSize: `clamp(${2 * ((wedding.content.nameSize ?? 100) / 100)}rem, ${4.2 * ((wedding.content.nameSize ?? 100) / 100)}vw, ${3 * ((wedding.content.nameSize ?? 100) / 100)}rem)`, lineHeight: '1.15' }">
            <span>{{ wedding.content.brideName }}</span>
            <span class="text-[0.4em] opacity-80 leading-none" style="color: var(--theme-accent);">&amp;</span>
            <span>{{ wedding.content.groomName }}</span>
          </div>
          
          <div v-else-if="wedding.content.namesLayout === 'diagonal'" class="flex flex-col font-heading drop-shadow-2xl w-full max-w-xs mx-auto" :style="{ color: wedding.content.nameColor || 'var(--theme-ink)', fontFamily: 'var(--theme-heading-font)', fontSize: `clamp(${2.5 * ((wedding.content.nameSize ?? 100) / 100)}rem, ${5 * ((wedding.content.nameSize ?? 100) / 100)}vw, ${3.5 * ((wedding.content.nameSize ?? 100) / 100)}rem)`, lineHeight: '1.1' }">
            <span class="self-start text-left ml-4 sm:-ml-8">{{ wedding.content.brideName }}</span>
            <span class="text-[0.5em] opacity-80 leading-none self-center my-2" style="color: var(--theme-accent);">&amp;</span>
            <span class="self-end text-right mr-4 sm:-mr-8">{{ wedding.content.groomName }}</span>
          </div>

          <h2 v-else class="drop-shadow-2xl leading-tight" :style="{ color: wedding.content.nameColor || 'var(--theme-ink)', fontFamily: 'var(--theme-heading-font)', fontSize: `clamp(${3.5 * ((wedding.content.nameSize ?? 100) / 100)}rem, ${8 * ((wedding.content.nameSize ?? 100) / 100)}vw, ${6 * ((wedding.content.nameSize ?? 100) / 100)}rem)` }">
            {{ wedding.content.brideName }} <span class="text-[0.7em] mx-2 opacity-80" style="color: var(--theme-accent);">&amp;</span> {{ wedding.content.groomName }}
          </h2>
        </div>

        <div
          class="absolute w-full max-w-3xl text-center px-4 flex flex-col items-center transition-all duration-700 animate-in fade-in zoom-in delay-500"
          :style="{ left: `${wedding.content.dateX ?? 50}%`, top: `${wedding.content.dateY ?? 70}%`, transform: 'translate(-50%, -50%)' }"
        >
          <p class="text-sm sm:text-base font-medium text-[color-mix(in_srgb,var(--theme-ink)_90%,transparent)]" :class="{ 'overlay-text-shadow': !wedding.content.openingRemoveOverlay }">
            {{ wedding.content.dateLabel }}
          </p>
        </div>

        <div
          class="absolute w-full max-w-md text-center px-4 flex flex-col items-center transition-all duration-700 animate-in fade-in zoom-in delay-500"
          :style="{ left: `${wedding.content.venueX ?? 50}%`, top: `${wedding.content.venueY ?? 78}%`, transform: 'translate(-50%, -50%)' }"
        >
          <p v-if="wedding.content.venueAddress" class="text-xs sm:text-sm text-[color-mix(in_srgb,var(--theme-ink)_80%,transparent)] italic" :class="{ 'overlay-text-shadow': !wedding.content.openingRemoveOverlay }" :style="{ fontWeight: 'var(--theme-text-weight)' }">
            {{ wedding.content.venueAddress }}
          </p>
        </div>
      </div>

      <div v-if="opened" class="absolute bottom-4 inset-x-0 flex justify-center z-10 pointer-events-none animate-bounce opacity-60">
        <UIcon name="i-heroicons-chevron-down" class="w-6 h-6" :style="{ color: 'var(--theme-accent)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }" />
      </div>
    </div>

    <!-- Ensure footer gradient is restored for readability -->
    <div v-if="opened" class="relative z-20 flex flex-col items-center pb-16 pt-12 px-6 bg-gradient-to-b from-transparent to-[color-mix(in_srgb,var(--theme-bg-to)_65%,transparent)] animate-in fade-in duration-700">
      <div v-if="wedding.content.dateISO" class="mb-8">
        <CountdownTimer :target="wedding.content.dateISO" />
      </div>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-lg mx-auto">
        <UButton
          :to="detailsLink"
          size="xl"
          color="neutral"
          :variant="wedding.content.rsvpEnabled === false ? 'solid' : 'soft'"
          class="w-full sm:w-auto font-medium rounded-full px-8 transition-colors"
          :class="wedding.content.rsvpEnabled === false
            ? 'accent-btn shadow-[0_0_30px_-5px_var(--theme-accent)] animate-glow'
            : 'text-[color-mix(in_srgb,var(--theme-ink)_90%,transparent)] bg-[color-mix(in_srgb,var(--theme-ink)_5%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-ink)_10%,transparent)] border border-[color-mix(in_srgb,var(--theme-ink)_12%,transparent)]'"
        >
          {{ wedding.content.btnDetails || 'View Details' }}
        </UButton>
        <UButton v-if="wedding.content.rsvpEnabled !== false" :to="rsvpLink" size="xl" color="neutral" class="accent-btn w-full sm:w-auto font-semibold rounded-full px-10 shadow-[0_0_30px_-5px_var(--theme-accent)] hover:scale-105 transition-transform animate-glow">
          {{ wedding.content.btnRsvp || 'RSVP Now' }}
        </UButton>
      </div>
      <div class="mt-6 opacity-80 hover:opacity-100 transition-opacity">
        <ShareButtons :bride-name="wedding.content.brideName" :groom-name="wedding.content.groomName" :date-label="wedding.content.dateLabel" :share-message="wedding.content.shareMessage" />
      </div>

      <CustomCodeBlock v-if="customCode.position !== 'top'" class="mt-10 w-full max-w-lg mx-auto" />
    </div>
  </div>

  <StoryInvite v-else :wedding="wedding" :guest-name="guestName" :rsvp-link="rsvpLink" />
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { wedding, loading, notFound } = useWeddingBySlug(slug)
const { themeStyleVars, customCode } = useThemes()

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

const optimizedCoverPhotoUrl = computed(() => optimizedImageUrl(wedding.value?.content.coverPhotoUrl, 1600))
const coverPhotoLoaded = ref(false)

useHead({
  link: computed(() => {
    const links: Array<Record<string, string>> = []
    if (wedding.value?.content.customFontUrl && !wedding.value.content.customFontUrl.includes('fonts.google.com/specimen/')) {
      links.push({ rel: 'stylesheet', href: wedding.value.content.customFontUrl })
    }
    if (optimizedCoverPhotoUrl.value) {
      links.push({ rel: 'preload', as: 'image', href: optimizedCoverPhotoUrl.value, fetchpriority: 'high' })
    }
    return links
  })
})

const guestName = computed(() => {
  const raw = route.query.to
  return typeof raw === 'string' ? raw : ''
})
// Carried over from the promo-video recording tool (admin/wedding/[id]/record.vue)
// so it survives cover -> details -> rsvp navigation, not just the first
// load - see rsvp.vue's submitForm() for what it actually guards.
const isPreviewRecording = computed(() => route.query.preview === '1')
function withQuery(path: string) {
  const params = new URLSearchParams()
  if (guestName.value) params.set('to', guestName.value)
  if (isPreviewRecording.value) params.set('preview', '1')
  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}

const detailsLink = computed(() => withQuery(`/w/${slug}/details`))
const rsvpLink = computed(() => withQuery(`/w/${slug}/rsvp`))

const opened = ref(false)

watch(
  wedding,
  (value) => {
    if (!value) return
    useSeoMeta({
      title: `${value.content.openingTitle || "You're Invited"} \u2014 ${value.content.brideName} & ${value.content.groomName}'s Wedding`,
      description: value.content.dateLabel
        ? `Join us on ${value.content.dateLabel} as we celebrate our wedding. View the details and RSVP online.`
        : 'View the wedding details and RSVP online.'
    })
  },
  { immediate: true }
)

const { preparePlayer } = useBackgroundMusic()
watch(
  () => wedding.value?.content.audioSrc,
  (src) => {
    if (src) preparePlayer(src)
  },
  { immediate: true }
)
</script>

<style scoped>
.overlay-text-shadow {
  text-shadow: 
  var(
    --overlay-shadow, 
    0 2px 12px rgba(0, 0, 0, 0.6), 
    0 2px 5px rgba(0, 0, 0, 0.75), 
    0 1px 2px rgba(0, 0, 0, 0.9))
  ;
}

.accent-btn {
  background-color: var(--theme-accent, #d4a017) !important;
  color: var(--theme-on-accent, #1f1400) !important;
}

.accent-btn:hover {
  filter: brightness(1.08);
}
</style>