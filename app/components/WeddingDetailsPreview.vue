<template>
  <div class="relative w-full h-full flex flex-col p-4 overflow-hidden bg-ink-950" :style="styleVars">
    <div class="absolute inset-0 z-0 bg-gradient-to-b" :style="{ background: `linear-gradient(160deg, var(--theme-bg-from), var(--theme-bg-via), var(--theme-bg-to))` }"></div>
    
    <div v-if="content.coverPhotoUrl" class="absolute inset-0 z-0 opacity-40 transition-opacity duration-1000">
      <img :src="content.coverPhotoUrl" alt="Background" class="w-full h-full object-cover" />
      <div class="absolute inset-0" :style="{ background: `linear-gradient(to bottom, transparent, var(--theme-bg-to))` }"></div>
    </div>

    <CardOrnament :style="content.ornamentStyle" color="var(--theme-accent)" class="z-0" />
    <PetalsBackground v-if="content.enablePetals !== false" :style-name="content.petalStyle" :count="12" class="z-0 pointer-events-none" />

    <div class="relative z-10 flex-1 flex flex-col mt-2">
      <div class="flex gap-1 mb-4 w-full px-2 shrink-0">
        <div v-for="(_, index) in slideKeys.length" :key="index" class="h-1 flex-1 rounded-full bg-white/20 overflow-hidden">
           <div class="h-full transition-all duration-300" :class="{'w-full': index <= currentSlide, 'w-0': index > currentSlide}" :style="{ background: 'var(--theme-accent)' }"></div>
        </div>
      </div>

      <div
        class="relative flex-1 backdrop-blur-xl border rounded-[1.5rem] shadow-xl p-5 flex flex-col justify-center transition-all duration-300 overflow-y-auto hide-scrollbar"
        :class="cardStyleResolved === 'dark' ? 'classic-inner-card' : (cardStyleResolved === 'glass' ? 'classic-inner-card-glass' : 'classic-inner-card-theme')"
        :style="{ borderColor: cardStyleResolved === 'glass' ? 'transparent' : 'var(--theme-accent-soft)', '--card-text': cardTextColorResolved }"
      >
         <Transition :name="direction" mode="out-in">
           <div :key="currentSlide" class="space-y-3 text-center w-full px-1 py-2">
              
              <!-- Story -->
              <template v-if="currentKey === 'story'">
                <div v-if="content.detailsTopIcon && content.detailsTopIcon !== 'none'" class="flex justify-center mb-4 w-full px-2">
                  <p
                    v-if="content.detailsTopIcon === 'bismillah'"
                    class="leading-relaxed"
                    dir="rtl"
                    :style="{
                      color: 'var(--theme-accent)',
                      fontFamily: `'Amiri', 'Traditional Arabic', serif`,
                      fontSize: `clamp(0.75rem, ${8 * ((content.detailsIconSize ?? 100) / 100)}vw, ${1.1 * ((content.detailsIconSize ?? 100) / 100)}rem)`
                    }"
                  >بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                  <UIcon v-else-if="content.detailsTopIcon === 'rings'" name="i-heroicons-lifebuoy" :style="{ color: 'var(--theme-accent)', width: `${1.5 * ((content.detailsIconSize ?? 100) / 100)}rem`, height: `${1.5 * ((content.detailsIconSize ?? 100) / 100)}rem` }" />
                  <UIcon v-else-if="content.detailsTopIcon === 'heart'" name="i-heroicons-heart" :style="{ color: 'var(--theme-accent)', width: `${1.5 * ((content.detailsIconSize ?? 100) / 100)}rem`, height: `${1.5 * ((content.detailsIconSize ?? 100) / 100)}rem` }" />
                  <img v-else-if="content.detailsTopIcon === 'custom' && content.customIconUrl" :src="content.customIconUrl" alt="" class="object-contain drop-shadow" :style="{ width: `${3 * ((content.detailsIconSize ?? 100) / 100)}rem`, height: `${3 * ((content.detailsIconSize ?? 100) / 100)}rem` }">
                </div>
                <p v-if="!content.hideSystemText" class="text-[color-mix(in_srgb,var(--card-text)_90%,transparent)] text-sm leading-relaxed whitespace-pre-line font-light">{{ content.story || 'Welcome message...' }}</p>
              </template>

              <!-- Couple -->
              <template v-else-if="currentKey === 'couple'">
                <div v-if="!content.hideSystemText">
                  <!-- var(--card-text), not a literal white or
                       var(--theme-ink) - see cardStyleResolved/
                       cardTextColorResolved above. content.nameColor (the
                       "Name Color" picker on the Theme tab, also used for
                       the cover page's names) still overrides it when a
                       couple sets one explicitly. -->
                  <h2 class="text-4xl leading-tight drop-shadow-md" :style="{ color: content.nameColor || 'var(--card-text)', fontFamily: 'var(--theme-heading-font)' }">
                    {{ content.brideName || 'Bride' }} <br/>
                    <span class="text-[0.5em] opacity-80" :style="{ color: 'var(--theme-accent)' }">&amp;</span> <br/>
                    {{ content.groomName || 'Groom' }}
                  </h2>
                  <div class="h-px w-12 mx-auto my-3" :style="{ background: 'var(--theme-accent)' }"></div>
                  <p class="text-[0.65rem] uppercase tracking-widest text-[color-mix(in_srgb,var(--card-text)_60%,transparent)]">{{ content.coupleDividerLabel || 'Bride & Groom' }}</p>
                </div>
              </template>

              <!-- Family -->
              <template v-else-if="currentKey === 'family'">
                <div v-if="!content.hideSystemText">
                  <UIcon v-if="!content.bridePhotoUrl && !content.groomPhotoUrl" name="i-heroicons-users" class="w-6 h-6 mx-auto mb-3 opacity-50" :style="{ color: 'var(--theme-accent)' }" />
                  <div v-if="content.brideFullName || content.brideParents" class="space-y-1">
                    <img v-if="content.bridePhotoUrl" :src="content.bridePhotoUrl" alt="" class="w-14 h-14 rounded-full object-cover mx-auto mb-2 border-2" :style="{ borderColor: 'var(--theme-accent)' }">
                    <p class="text-[0.6rem] uppercase tracking-widest font-semibold mb-1" :style="{ color: 'var(--theme-accent)' }">{{ content.familyBrideLabel || 'Bride' }}</p>
                    <p class="font-bold text-sm text-[color-mix(in_srgb,var(--card-text)_90%,transparent)]">{{ content.brideFullName || 'Bride Full Name' }}</p>
                    <p class="text-xs text-[color-mix(in_srgb,var(--card-text)_60%,transparent)] font-light line-clamp-2">{{ content.childOfLabel || 'Child of' }} <br/>{{ content.brideParents || 'Parents' }}</p>
                  </div>
                  <div class="h-px bg-[color-mix(in_srgb,var(--card-text)_10%,transparent)] w-16 mx-auto my-4" />
                  <div v-if="content.groomFullName || content.groomParents" class="space-y-1">
                    <img v-if="content.groomPhotoUrl" :src="content.groomPhotoUrl" alt="" class="w-14 h-14 rounded-full object-cover mx-auto mb-2 border-2" :style="{ borderColor: 'var(--theme-accent)' }">
                    <p class="text-[0.6rem] uppercase tracking-widest font-semibold mb-1" :style="{ color: 'var(--theme-accent)' }">{{ content.familyGroomLabel || 'Groom' }}</p>
                    <p class="font-bold text-sm text-[color-mix(in_srgb,var(--card-text)_90%,transparent)]">{{ content.groomFullName || 'Groom Full Name' }}</p>
                    <p class="text-xs text-[color-mix(in_srgb,var(--card-text)_60%,transparent)] font-light line-clamp-2">{{ content.childOfLabel || 'Child of' }} <br/>{{ content.groomParents || 'Parents' }}</p>
                  </div>
                </div>
              </template>

              <!-- Event Logistics -->
              <template v-else-if="currentKey === 'event'">
                <div v-if="!content.hideSystemText">
                  <h2 class="font-display font-semibold text-xl mb-4" :style="{ color: 'var(--theme-accent)' }">{{ content.detailsHeading || 'The Details' }}</h2>
                  <div class="space-y-3 text-[color-mix(in_srgb,var(--card-text)_90%,transparent)]">
                    <div v-if="content.dateLabel" class="flex flex-col items-center">
                      <UIcon name="i-heroicons-calendar" class="w-4 h-4 mb-1 opacity-70" />
                      <p class="font-medium text-sm">{{ content.dateLabel }}</p>
                    </div>
                    <div v-if="content.timeLabel" class="flex flex-col items-center">
                      <UIcon name="i-heroicons-clock" class="w-4 h-4 mb-1 opacity-70" />
                      <p class="font-medium text-sm">{{ content.timeLabel }}</p>
                    </div>
                    <div v-if="content.venueName" class="flex flex-col items-center pt-1">
                      <UIcon name="i-heroicons-building-office-2" class="w-4 h-4 mb-1 opacity-70" />
                      <p class="font-semibold text-sm line-clamp-1">{{ content.venueName }}</p>
                      <p class="text-[0.7rem] text-[color-mix(in_srgb,var(--card-text)_60%,transparent)] mt-0.5 max-w-[200px] mx-auto line-clamp-2">{{ content.venueAddress }}</p>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Location Maps -->
              <template v-else-if="currentKey === 'location'">
                <h2 class="font-display font-semibold text-xl mb-1" :style="{ color: 'var(--theme-accent)' }">{{ content.locationHeading || 'Location' }}</h2>
                <p class="text-[0.65rem] text-[color-mix(in_srgb,var(--card-text)_60%,transparent)] mb-4">{{ content.locationSubtitle || 'Scan or tap to open in Maps' }}</p>
                <div class="flex flex-col items-center gap-4">
                  <div class="p-2 bg-white rounded-xl shadow-lg">
                    <img :src="qrCodeUrl" alt="QR code" class="w-24 h-24">
                  </div>
                  <UButton size="xs" color="primary" class="font-semibold rounded-full px-4 pointer-events-none">
                    {{ content.locationMapsButtonLabel || 'Google Maps' }}
                  </UButton>
                </div>
              </template>

              <!-- Gifts -->
              <template v-else-if="currentKey === 'gift'">
                <h2 class="font-display font-semibold text-xl mb-3" :style="{ color: 'var(--theme-accent)' }">A Gift of Love</h2>
                <div class="scale-90 origin-top flex justify-center">
                   <GiftCard :banks="[content.bank, content.bank2]" />
                </div>
              </template>

              <!-- Flow -->
              <template v-else-if="currentKey === 'flow'">
                <h2 class="font-display font-semibold text-xl mb-3" :style="{ color: 'var(--theme-accent)' }">{{ content.eventFlowHeading || 'Event Flow' }}</h2>
                <div class="scale-[0.85] origin-top max-h-[300px] overflow-y-auto hide-scrollbar text-left">
                   <FlowTimeline :items="flow" />
                </div>
              </template>

           </div>
         </Transition>
      </div>

      <!-- Controls -->
      <div class="flex justify-center gap-8 mt-4 pb-2 shrink-0">
         <button @click="prev" class="p-2 text-white/40 hover:text-white transition-colors"><UIcon name="i-heroicons-chevron-left" class="w-6 h-6"/></button>
         <button @click="next" class="p-2 text-white/40 hover:text-white transition-colors"><UIcon name="i-heroicons-chevron-right" class="w-6 h-6"/></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WeddingContent, FlowItem } from '~/composables/useWeddingTypes'

const props = defineProps<{ content: WeddingContent; themeId: string; flow: FlowItem[] }>()
const { themeStyleVars, resolveCardStyle } = useThemes()

const styleVars = computed(() =>
  themeStyleVars(
    props.themeId,
    { bgFrom: props.content.customBgFrom, bgTo: props.content.customBgTo, accent: props.content.customAccent },
    props.content.customFontFamily || props.content.fontFamily
  )
)

// Same cardStyle resolution as the real Inner Card page
// (app/pages/w/[slug]/details.vue) and the RSVP page - see
// useThemes.ts's resolveCardStyle for the full reasoning.
const cardStyleResolved = computed(() => {
  if (props.content.cardStyle === 'glass') return 'glass'
  return resolveCardStyle(props.themeId, props.content.cardStyle)
})

const cardTextColorResolved = computed(() =>
  props.content.cardTextColor || (cardStyleResolved.value === 'dark' || cardStyleResolved.value === 'glass' ? '#ffffff' : 'var(--theme-ink)')
)

const qrCodeUrl = computed(
  () => `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(props.content.mapUrl ?? '')}&size=200x200`
)

const slideKeys = computed(() => {
  const keys = ['story', 'couple']
  if (props.content.brideFullName || props.content.groomFullName) keys.push('family')
  keys.push('event')
  if (props.content.mapUrl) keys.push('location')
  if (props.content.enableGift && (
    props.content.bank?.accountNumber || props.content.bank?.qrCodeUrl ||
    props.content.bank2?.accountNumber || props.content.bank2?.qrCodeUrl
  )) {
    keys.push('gift')
  }
  if (props.flow?.length) keys.push('flow')
  return keys
})

const currentSlide = ref(0)
const currentKey = computed(() => slideKeys.value[currentSlide.value] ?? 'story')
const direction = ref<'slide-next' | 'slide-prev'>('slide-next')

function next() {
  direction.value = 'slide-next'
  currentSlide.value = (currentSlide.value + 1) % slideKeys.value.length
}

function prev() {
  direction.value = 'slide-prev'
  currentSlide.value = (currentSlide.value - 1 + slideKeys.value.length) % slideKeys.value.length
}
</script>

<style scoped>
/* Three looks, mirroring the real Inner Card page's options in 
   app/pages/w/[slug]/details.vue and the RSVP card's pattern in 
   app/pages/w/[slug]/rsvp.vue. Every descendant above reads
   its color from --card-text via color-mix(), set inline via
   cardTextColorResolved in the script setup. */
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

.classic-inner-card-glass {
  background: rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(16px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.3) !important;
  color: var(--card-text, #ffffff) !important;
}

.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-next-enter-from { opacity: 0; transform: scale(0.95) translateX(20px); }
.slide-next-leave-to { opacity: 0; transform: scale(0.95) translateX(-20px); }
.slide-prev-enter-from { opacity: 0; transform: scale(0.95) translateX(-20px); }
.slide-prev-leave-to { opacity: 0; transform: scale(0.95) translateX(20px); }

.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>