<template>
  <!-- One "slide" of the /w/[slug]/details page's content - extracted out of
       details.vue so both layout styles (the classic auto-advancing
       slideshow and the newer tabbed Menu-style layout) can render the exact
       same markup for a given slideKey instead of maintaining two copies. -->
  <template v-if="slideKey === 'story'">
    <div v-if="content.detailsTopIcon && content.detailsTopIcon !== 'none'" class="flex justify-center mb-4 w-full px-2">
      <p
        v-if="content.detailsTopIcon === 'bismillah'"
        class="leading-relaxed"
        dir="rtl"
        :style="{
          color: 'var(--theme-accent)',
          fontFamily: `'Amiri', 'Traditional Arabic', serif`,
          fontSize: `clamp(1rem, ${3 * ((content.detailsIconSize ?? 100) / 100)}vw, ${1.6 * ((content.detailsIconSize ?? 100) / 100)}rem)`
        }"
      >بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
      <UIcon v-else-if="content.detailsTopIcon === 'rings'" name="i-heroicons-lifebuoy" :style="{ color: 'var(--theme-accent)', width: `${2.5 * ((content.detailsIconSize ?? 100) / 100)}rem`, height: `${2.5 * ((content.detailsIconSize ?? 100) / 100)}rem` }" />
      <UIcon v-else-if="content.detailsTopIcon === 'heart'" name="i-heroicons-heart" :style="{ color: 'var(--theme-accent)', width: `${2.5 * ((content.detailsIconSize ?? 100) / 100)}rem`, height: `${2.5 * ((content.detailsIconSize ?? 100) / 100)}rem` }" />
      <img v-else-if="content.detailsTopIcon === 'custom' && content.customIconUrl" :src="content.customIconUrl" alt="" class="object-contain drop-shadow" :style="{ width: `${7 * ((content.detailsIconSize ?? 100) / 100)}rem`, height: 'auto', maxWidth: '85%', maxHeight: `${7 * ((content.detailsIconSize ?? 100) / 100)}rem` }">
    </div>
    <p v-if="!content.hideSystemText" class="text-[color-mix(in_srgb,var(--card-text)_90%,transparent)] text-lg leading-relaxed whitespace-pre-line" :style="{ fontWeight: 'var(--theme-text-weight)' }">{{ content.story }}</p>
  </template>

  <template v-else-if="slideKey === 'couple'">
    <div v-if="!content.hideSystemText">
      <h2 class="text-5xl leading-tight drop-shadow-lg" :style="{ color: content.nameColor || 'var(--card-text)', fontFamily: 'var(--theme-heading-font)' }">
        {{ content.brideName }} <br/>
        <span class="text-[0.6em] opacity-80" :style="{ color: 'var(--theme-accent)' }">&amp;</span> <br/>
        {{ content.groomName }}
      </h2>
      <div class="h-px w-16 mx-auto my-4" :style="{ background: 'var(--theme-accent)' }"></div>
      <p class="text-sm uppercase tracking-widest text-[color-mix(in_srgb,var(--card-text)_60%,transparent)]">{{ content.coupleDividerLabel || 'Bride & Groom' }}</p>
      <div v-if="content.monogramEnabled" class="mt-5 flex justify-center">
        <img v-if="content.monogramType === 'upload' && content.monogramImageUrl" :src="content.monogramImageUrl" alt="Monogram" class="w-12 h-12 object-contain opacity-90">
        <span v-else class="text-2xl" :style="{ fontFamily: monogramFontFamily, color: 'var(--theme-accent)' }">{{ monogramDisplayText }}</span>
      </div>
    </div>
  </template>

  <template v-else-if="slideKey === 'family'">
    <div v-if="!content.hideSystemText">
      <UIcon v-if="!content.bridePhotoUrl && !content.groomPhotoUrl" name="i-heroicons-users" class="w-8 h-8 mx-auto mb-4 opacity-50" :style="{ color: 'var(--theme-accent)' }" />
      <div v-if="content.brideFullName || content.brideParents" class="space-y-1">
        <img v-if="content.bridePhotoUrl" :src="content.bridePhotoUrl" alt="" class="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2" :style="{ borderColor: 'var(--theme-accent)' }">
        <p class="text-xs uppercase tracking-widest font-semibold mb-2" :style="{ color: 'var(--theme-accent)' }">{{ content.familyBrideLabel || 'Bride' }}</p>
        <p class="font-bold text-lg text-[color-mix(in_srgb,var(--card-text)_90%,transparent)]">{{ content.brideFullName }}</p>
        <p class="text-sm text-[color-mix(in_srgb,var(--card-text)_70%,transparent)]" :style="{ fontWeight: 'var(--theme-text-weight)' }">{{ content.childOfLabel || 'Child of' }} <br/>{{ content.brideParents }}</p>
      </div>
      <div class="h-px bg-[color-mix(in_srgb,var(--card-text)_10%,transparent)] w-24 mx-auto my-6" />
      <div v-if="content.groomFullName || content.groomParents" class="space-y-1">
        <img v-if="content.groomPhotoUrl" :src="content.groomPhotoUrl" alt="" class="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2" :style="{ borderColor: 'var(--theme-accent)' }">
        <p class="text-xs uppercase tracking-widest font-semibold mb-2" :style="{ color: 'var(--theme-accent)' }">{{ content.familyGroomLabel || 'Groom' }}</p>
        <p class="font-bold text-lg text-[color-mix(in_srgb,var(--card-text)_90%,transparent)]">{{ content.groomFullName }}</p>
        <p class="text-sm text-[color-mix(in_srgb,var(--card-text)_70%,transparent)]" :style="{ fontWeight: 'var(--theme-text-weight)' }">{{ content.childOfLabel || 'Child of' }} <br/>{{ content.groomParents }}</p>
      </div>
    </div>
  </template>

  <template v-else-if="slideKey === 'event'">
    <div v-if="!content.hideSystemText">
      <h2 class="font-display font-semibold text-2xl mb-6" :style="{ color: 'var(--theme-accent)' }">{{ content.detailsHeading || 'The Details' }}</h2>
      <div class="space-y-4 text-[color-mix(in_srgb,var(--card-text)_90%,transparent)]">
        <div v-if="content.dateLabel" class="flex flex-col items-center">
          <UIcon name="i-heroicons-calendar" class="w-5 h-5 mb-1 opacity-70" />
          <p class="font-medium text-lg">{{ content.dateLabel }}</p>
        </div>
        <div v-if="content.timeLabel" class="flex flex-col items-center">
          <UIcon name="i-heroicons-clock" class="w-5 h-5 mb-1 opacity-70" />
          <p class="font-medium text-lg">{{ content.timeLabel }}</p>
        </div>
        <div v-if="content.venueName" class="flex flex-col items-center pt-2">
          <UIcon name="i-heroicons-building-office-2" class="w-5 h-5 mb-1 opacity-70" />
          <p class="font-semibold text-lg">{{ content.venueName }}</p>
          <p class="text-sm text-[color-mix(in_srgb,var(--card-text)_60%,transparent)] mt-1 max-w-[250px] mx-auto">{{ content.venueAddress }}</p>
        </div>
      </div>
    </div>
    <div class="flex justify-center pt-6" :class="{ 'pt-12': content.hideSystemText }">
      <AddToCalendarButton
        :bride-name="content.brideName"
        :groom-name="content.groomName"
        :date-iso="content.dateISO"
        :venue-name="content.venueName"
        :venue-address="content.venueAddress"
        :rsvp-deadline-label="content.rsvpDeadlineLabel"
        :label="content.calendarButtonLabel"
        class="rounded-full shadow-lg"
      />
    </div>
  </template>

  <template v-else-if="slideKey === 'location'">
    <h2 class="font-display font-semibold text-2xl mb-2" :style="{ color: 'var(--theme-accent)' }">{{ content.locationHeading || 'Location' }}</h2>
    <p class="text-sm text-[color-mix(in_srgb,var(--card-text)_60%,transparent)] mb-6">{{ content.locationSubtitle || 'Scan or tap to open in Maps' }}</p>
    <div class="flex flex-col items-center gap-6">
      <div class="p-3 bg-white rounded-2xl shadow-xl">
        <img :src="qrCodeUrl" :alt="`QR code linking to the venue on ${content.locationMapsButtonLabel || 'Google Maps'}`" class="w-36 h-36" loading="lazy">
      </div>
      <UButton :to="content.mapUrl" target="_blank" external icon="i-heroicons-map-pin" color="neutral" class="accent-btn font-semibold rounded-full px-6 shadow-md">
        {{ content.locationMapsButtonLabel || 'Google Maps' }}
      </UButton>
    </div>
  </template>

  <template v-else-if="slideKey === 'gift'">
    <h2 class="font-display font-semibold text-2xl mb-4" :style="{ color: 'var(--theme-accent)' }">A Gift of Love</h2>
    <GiftCard :banks="[content.bank, content.bank2]" />
  </template>

  <template v-else-if="slideKey === 'flow'">
    <h2 class="font-display font-semibold text-2xl mb-6" :style="{ color: 'var(--theme-accent)' }">{{ content.eventFlowHeading || 'Event Flow' }}</h2>
    <FlowTimeline :items="flow" />
  </template>

  <template v-else-if="slideKey === 'menu'">
    <h2 class="font-display font-semibold text-2xl mb-1" :style="{ color: 'var(--theme-accent)' }">{{ content.menuHeading || 'Our Wedding Menu' }}</h2>
    <p v-if="content.menuSubtitle" class="text-sm text-[color-mix(in_srgb,var(--card-text)_60%,transparent)] mb-5">{{ content.menuSubtitle }}</p>
    <div :class="content.menuSubtitle ? '' : 'mb-1'" />
    <MenuList :items="menu" />
  </template>
</template>

<script setup lang="ts">
import type { FlowItem, MenuItem, WeddingContent } from '~/composables/useWeddingTypes'

defineProps<{
  slideKey: string
  content: WeddingContent
  flow: FlowItem[]
  menu: MenuItem[]
  qrCodeUrl: string
  monogramDisplayText: string
  monogramFontFamily: string
}>()
</script>
