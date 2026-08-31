<template>
  <Transition :name="transitionName" :duration="transitionName === 'envelope-classic' ? 1500 : undefined">
    <div
      v-if="!opened"
      class="envelope-overlay"
      :class="overlayClass"
      role="button"
      tabindex="0"
      :aria-label="`Open the invitation for ${guestName ? guestName : 'you'}`"
      @click="open"
      @keydown.enter="open"
      @keydown.space.prevent="open"
    >
      <div v-if="adminConfig" class="absolute inset-0 z-0 overflow-hidden cfg-bg" :style="cfgVars">
        <div v-if="adminConfig.template === 'blob-background' || adminConfig.template === 'gradient-fade'" class="cfg-blob cfg-blob-1"></div>
        <div v-if="adminConfig.template === 'blob-background' || adminConfig.template === 'gradient-fade'" class="cfg-blob cfg-blob-2"></div>
        <div v-if="adminConfig.template === 'split-door'" class="absolute inset-0 flex">
          <div class="relative w-1/2 h-full border-r border-white/20 shadow-[5px_0_15px_rgba(0,0,0,0.4)] door-left"></div>
          <div class="relative w-1/2 h-full border-l border-white/20 shadow-[-5px_0_15px_rgba(0,0,0,0.4)] door-right"></div>
        </div>
        <div v-if="adminConfig.template === 'confetti-burst'" class="absolute inset-0">
          <span v-for="i in 24" :key="i" class="cfg-confetti" :style="{ left: `${(i * 41) % 100}%`, animationDelay: `${(i % 10) * 0.2}s`, background: i % 2 ? adminConfig.accent : '#ffffff' }"></span>
        </div>
        <div class="absolute inset-0" :style="{ backgroundColor: `rgba(0,0,0,${adminConfig.overlayTint})` }"></div>
      </div>

      <!-- Split Door FIX: Now cleanly respects the Remove Overlay toggle -->
      <div v-else-if="content.openingStyle === 'custom-split' && content.openingBgUrl" class="absolute inset-0 z-0 flex">
        <div class="relative w-1/2 h-full overflow-hidden door-left z-10">
          <img :src="optimizedImageUrl(content.openingBgUrl, 1400)" loading="eager" fetchpriority="high" class="absolute top-0 left-0 w-[200%] h-full max-w-none object-cover" />
          <div class="absolute inset-0 border-r border-white/20 shadow-[5px_0_15px_rgba(0,0,0,0.4)] transition-colors" :style="{ backgroundColor: content.openingRemoveOverlay ? 'transparent' : `rgba(0, 0, 0, var(--overlay-tint, 0.4))` }"></div>
        </div>
        <div class="relative w-1/2 h-full overflow-hidden door-right z-10">
          <img :src="optimizedImageUrl(content.openingBgUrl, 1400)" loading="eager" fetchpriority="high" class="absolute top-0 right-0 w-[200%] h-full max-w-none object-cover" />
          <div class="absolute inset-0 border-l border-white/20 shadow-[-5px_0_15px_rgba(0,0,0,0.4)] transition-colors" :style="{ backgroundColor: content.openingRemoveOverlay ? 'transparent' : `rgba(0, 0, 0, var(--overlay-tint, 0.4))` }"></div>
        </div>
      </div>

      <div
        v-else-if="content.openingStyle === 'custom' && content.openingBgUrl"
        class="absolute inset-0 z-0"
        :style="content.openingHideText ? { background: `linear-gradient(135deg, var(--theme-bg-from, #0d2a4a) 0%, var(--theme-bg-to, #04101f) 100%)` } : {}"
      >
        <img
          :src="optimizedImageUrl(content.openingBgUrl, 1400)"
          alt="Cover Background"
          loading="eager"
          fetchpriority="high"
          :class="content.openingHideText ? 'w-full h-full object-contain' : 'w-full h-full object-cover'"
        />
        <div v-if="!content.openingHideText && !content.openingRemoveOverlay" class="absolute inset-0" :style="{ backgroundColor: `rgba(0, 0, 0, var(--overlay-tint, 0.4))` }"></div>
      </div>

      <div v-else-if="content.openingStyle === 'modern-dark'" class="absolute inset-0 z-0 overflow-hidden modern-dark-bg" :style="modernDarkVars">
        <div class="md-blob md-blob-1"></div>
        <div class="md-blob md-blob-2"></div>
        <div class="md-blob md-blob-3"></div>
        <div class="md-grain"></div>
        <div class="md-frame"></div>
      </div>

      <div v-else-if="content.openingStyle === 'minimal-light'" class="absolute inset-0 z-0 overflow-hidden minimal-light-bg" :style="minimalLightVars">
        <div class="ml-blob ml-blob-1"></div>
        <div class="ml-blob ml-blob-2"></div>
        <div class="ml-dot-ring"></div>
      </div>

      <!-- Wax Seal FIX: Respects the Remove Overlay toggle -->
      <div v-else-if="content.openingStyle === 'wax-seal'" class="absolute inset-0 z-0 flex wax-seal-doors">
        <template v-if="content.openingBgUrl">
          <div class="relative w-1/2 h-full overflow-hidden door-left">
            <img :src="optimizedImageUrl(content.openingBgUrl, 1400)" loading="eager" fetchpriority="high" class="absolute top-0 left-0 w-[200%] h-full max-w-none object-cover" />
            <div class="absolute inset-0 transition-colors" :class="content.openingRemoveOverlay ? 'bg-transparent' : 'bg-black/45'"></div>
          </div>
          <div class="relative w-1/2 h-full overflow-hidden door-right">
            <img :src="optimizedImageUrl(content.openingBgUrl, 1400)" loading="eager" fetchpriority="high" class="absolute top-0 right-0 w-[200%] h-full max-w-none object-cover" />
            <div class="absolute inset-0 transition-colors" :class="content.openingRemoveOverlay ? 'bg-transparent' : 'bg-black/45'"></div>
          </div>
        </template>
        <template v-else>
          <div class="relative w-1/2 h-full door-left flex items-center justify-end pr-1" :style="{ background: `linear-gradient(160deg, var(--theme-bg-from, #0d2a4a), var(--theme-bg-via, #142a45) 60%, var(--theme-bg-to, #04101f))` }">
            <div class="w-full h-[68%] rounded-l-2xl border-y-2 border-l-2" :style="{ borderColor: 'var(--theme-accent, #e3b04a)' }"></div>
          </div>
          <div class="relative w-1/2 h-full door-right flex items-center justify-start pl-1" :style="{ background: `linear-gradient(200deg, var(--theme-bg-from, #0d2a4a), var(--theme-bg-via, #142a45) 60%, var(--theme-bg-to, #04101f))` }">
            <div class="w-full h-[68%] rounded-r-2xl border-y-2 border-r-2" :style="{ borderColor: 'var(--theme-accent, #e3b04a)' }"></div>
          </div>
        </template>
      </div>

      <div v-else-if="content.openingStyle === 'classic'" class="absolute inset-0 z-0 bg-gradient-to-br" :style="{ background: `linear-gradient(135deg, var(--theme-bg-from, #0d2a4a) 0%, var(--theme-bg-to, #04101f) 100%)` }"></div>

      <div
        v-else-if="isSlideStyle && content.openingBgUrl"
        class="absolute inset-0 z-0"
        :style="content.openingHideText ? { background: `linear-gradient(135deg, var(--theme-bg-from, #0d2a4a) 0%, var(--theme-bg-to, #04101f) 100%)` } : {}"
      >
        <img
          :src="optimizedImageUrl(content.openingBgUrl, 1400)"
          alt="Cover Background"
          loading="eager"
          fetchpriority="high"
          :class="content.openingHideText ? 'w-full h-full object-contain' : 'w-full h-full object-cover'"
        />
        <div v-if="!content.openingHideText && !content.openingRemoveOverlay" class="absolute inset-0" :style="{ backgroundColor: `rgba(0, 0, 0, var(--overlay-tint, 0.4))` }"></div>
      </div>

      <div v-else-if="content.openingStyle === 'confetti-burst'" class="absolute inset-0 z-0 confetti-burst-bg overflow-hidden" :style="{ background: `linear-gradient(135deg, var(--theme-bg-from, #0d2a4a) 0%, var(--theme-bg-to, #04101f) 100%)` }">
        <img v-if="content.openingBgUrl" :src="optimizedImageUrl(content.openingBgUrl, 1400)" alt="Cover Background" loading="eager" fetchpriority="high" class="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
          <div class="confetti-particle cd-1" style="background:#f472b6; left:6%;"></div>
          <div class="confetti-particle cd-2" style="background:#60a5fa; left:16%;"></div>
          <div class="confetti-particle cd-3" style="background:#facc15; left:26%;"></div>
          <div class="confetti-particle cd-4" style="background:#4ade80; left:36%;"></div>
          <div class="confetti-particle cd-5" style="background:#c084fc; left:46%;"></div>
          <div class="confetti-particle cd-6" style="background:#f87171; left:56%;"></div>
          <div class="confetti-particle cd-7" style="background:#f472b6; left:66%;"></div>
          <div class="confetti-particle cd-8" style="background:#60a5fa; left:76%;"></div>
          <div class="confetti-particle cd-9" style="background:#facc15; left:86%;"></div>
          <div class="confetti-particle cd-10" style="background:#4ade80; left:94%;"></div>
          <div class="confetti-particle cd-11" style="background:#c084fc; left:50%;"></div>
          <div class="confetti-particle cd-12" style="background:#f87171; left:10%;"></div>
        </div>
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
          <div class="confetti-burst-particle" style="background:#f472b6; --bx:-90px; --by:-190px; --brot:480deg; --del:0s;"></div>
          <div class="confetti-burst-particle" style="background:#60a5fa; --bx:-55px; --by:-230px; --brot:-420deg; --del:0.03s;"></div>
          <div class="confetti-burst-particle" style="background:#facc15; --bx:-20px; --by:-250px; --brot:540deg; --del:0.01s;"></div>
          <div class="confetti-burst-particle" style="background:#4ade80; --bx:15px; --by:-250px; --brot:-500deg; --del:0.04s;"></div>
          <div class="confetti-burst-particle" style="background:#c084fc; --bx:50px; --by:-230px; --brot:460deg; --del:0.02s;"></div>
          <div class="confetti-burst-particle" style="background:#f87171; --bx:90px; --by:-190px; --brot:-540deg; --del:0.05s;"></div>
          <div class="confetti-burst-particle" style="background:#f472b6; --bx:-70px; --by:-140px; --brot:400deg; --del:0.06s;"></div>
          <div class="confetti-burst-particle" style="background:#60a5fa; --bx:-30px; --by:-170px; --brot:-460deg; --del:0.02s;"></div>
          <div class="confetti-burst-particle" style="background:#facc15; --bx:10px; --by:-180px; --brot:520deg; --del:0.07s;"></div>
          <div class="confetti-burst-particle" style="background:#4ade80; --bx:40px; --by:-160px; --brot:-480deg; --del:0.03s;"></div>
          <div class="confetti-burst-particle" style="background:#c084fc; --bx:70px; --by:-150px; --brot:440deg; --del:0.05s;"></div>
          <div class="confetti-burst-particle" style="background:#f87171; --bx:100px; --by:-130px; --brot:-400deg; --del:0.01s;"></div>
        </div>
      </div>

      <div v-else class="absolute inset-0 z-0 bg-gradient-to-br" :style="{ background: `linear-gradient(135deg, var(--theme-bg-from, #0d2a4a) 0%, var(--theme-bg-to, #04101f) 100%)` }"></div>

      <div
        class="content-container relative z-20 w-full max-w-md mx-auto flex flex-col justify-center p-6 animate-fade-up"
        :class="contentAlignClass"
      >
        
        <div v-if="content.openingStyle === 'classic'" class="envelope-classic-wrap mb-8">
          <div class="envelope-inner-card">
            <UIcon name="i-heroicons-heart" class="envelope-letter-icon w-7 h-7" :style="textStyleAccent" />
            <div class="envelope-letter-lines"><span></span><span></span></div>
          </div>
          <svg viewBox="0 0 200 140" class="envelope-body-svg" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="18" width="188" height="112" rx="8" fill="var(--theme-bg-via, #0b2a4d)" stroke="var(--theme-accent, #e3b04a)" stroke-width="2" />
            <path d="M10 92 L100 40 L190 92" fill="none" stroke="var(--theme-accent, #e3b04a)" stroke-width="1.5" opacity="0.35" />
          </svg>
          <svg viewBox="0 0 200 140" class="envelope-flap-svg" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 18 L194 18 L100 92 Z" fill="var(--theme-bg-via, #0b2a4d)" stroke="var(--theme-accent, #e3b04a)" stroke-width="2" stroke-linejoin="round" />
            <circle cx="100" cy="72" r="14" fill="var(--theme-accent, #d4a017)" stroke="var(--theme-accent-soft, #f3ddaa)" stroke-width="1.5" />
            <path d="M100 65 L104 72 L100 79 L96 72 Z" fill="var(--theme-bg-to, #3a2705)" />
          </svg>
        </div>

        <div v-if="content.openingStyle === 'wax-seal'" class="wax-seal mb-6">
          <div class="wax-seal-piece wax-seal-piece-1">
            <div class="wax-seal-blob" :style="waxBlobStyle"></div>
            <div class="wax-seal-ring"></div>
          </div>
          <div class="wax-seal-piece wax-seal-piece-2">
            <div class="wax-seal-blob" :style="waxBlobStyle"></div>
            <div class="wax-seal-ring"></div>
          </div>
          <div class="wax-seal-piece wax-seal-piece-3">
            <div class="wax-seal-blob" :style="waxBlobStyle"></div>
            <div class="wax-seal-ring"></div>
          </div>
          <svg class="wax-seal-crack" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M50,50 L46,30 L52,8" />
            <path d="M50,50 L68,62 L88,78 L100,75" />
            <path d="M50,50 L30,64 L12,85 L10,95" />
          </svg>
          <span class="wax-seal-initials">{{ sealInitials }}</span>
          <div class="wax-crumb" style="--cx:14px; --cy:-30px; --delay:0.12s;"></div>
          <div class="wax-crumb" style="--cx:-20px; --cy:-18px; --delay:0.15s;"></div>
          <div class="wax-crumb" style="--cx:24px; --cy:20px; --delay:0.1s;"></div>
          <div class="wax-crumb" style="--cx:-10px; --cy:28px; --delay:0.17s;"></div>
        </div>

        <p v-if="!content.openingHideText" class="font-heading text-5xl sm:text-6xl leading-tight mb-4" :style="[textStyleAccent, titleShadow, titleStyle]">
          {{ content.openingTitle || "You're Invited" }}
        </p>

        <div
          v-if="guestName && !content.openingHideText"
          class="guest-name-box relative mt-4 mb-6 min-w-[200px] max-w-[300px] flex flex-col items-center gap-1.5"
          :class="[guestBoxClass, { 'guest-name-box-animated': content.openingGuestNameAnimate }]"
          :style="guestBoxStyle"
        >
          <div v-if="content.openingGuestNameBox === 'custom' && content.openingGuestNameBoxImageUrl" class="guest-name-box-custom-bg" :style="{ backgroundImage: `url(${content.openingGuestNameBoxImageUrl})` }"></div>
          <p v-if="greetingParts.before" class="relative text-sm sm:text-base uppercase tracking-[0.15em] opacity-90" :style="[textStyleBase, titleShadow, greetingStyle]">{{ greetingParts.before }}</p>
          <p
            class="relative font-display font-semibold text-2xl sm:text-3xl leading-tight"
            :style="[textStyleBase, titleShadow, guestNameStyle]"
          >{{ guestName }}</p>
          <p v-if="greetingParts.after" class="relative text-sm sm:text-base uppercase tracking-[0.15em] opacity-90" :style="[textStyleBase, titleShadow, greetingAfterStyle]">{{ greetingParts.after }}</p>
        </div>

        <button v-if="!content.openingHideText" class="mt-8 flex flex-col items-center gap-2 group focus:outline-none z-30 relative">
          <span class="text-sm tracking-[0.25em] uppercase font-bold transition-all group-hover:scale-105" :style="[textStyleBase, titleShadow, actionStyle]">
            {{ content.openingActionText || "Tap to open" }}
          </span>
          <UIcon name="i-heroicons-chevron-double-down" class="w-5 h-5 animate-bounce mt-1" :style="{ ...textStyleAccent, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.65))' }" />
        </button>

      </div>

      <div v-if="content.openingHideText" class="absolute inset-x-0 bottom-6 z-20 flex justify-center pointer-events-none">
        <span class="w-2 h-2 rounded-full bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.6)] animate-pulse"></span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { WeddingContent } from '~/composables/useWeddingTypes'

const props = withDefaults(defineProps<{ guestName?: string; content: WeddingContent }>(), { 
  guestName: '',
  content: () => ({} as WeddingContent)
})

const opened = defineModel<boolean>('opened', { default: false })
const emit = defineEmits<{ open: [] }>()

const { getOpeningStyleConfig } = useThemes()
const adminConfig = computed(() => getOpeningStyleConfig(props.content.openingStyle))
const cfgVars = computed(() => {
  const c = adminConfig.value
  if (!c) return {}
  return {
    '--cfg-from': c.bgFrom,
    '--cfg-via': c.bgVia,
    '--cfg-to': c.bgTo,
    '--cfg-accent': c.accent,
    '--cfg-duration': `${c.durationMs}ms`
  } as Record<string, string>
})

function open() {
  if (opened.value) return
  opened.value = true
  emit('open')
}

const transitionName = computed(() => {
  if (adminConfig.value) {
    const t = adminConfig.value.template
    if (t === 'split-door') return 'split-door'
    if (t === 'confetti-burst') return 'confetti-burst'
    return 'envelope-fade'
  }
  if (props.content.openingStyle === 'confetti-burst') return 'confetti-burst'
  if (props.content.openingStyle === 'custom-split' || props.content.openingStyle === 'wax-seal') return 'split-door'
  if (props.content.openingStyle === 'classic') return 'envelope-classic'
  if (props.content.openingStyle === 'slide-up') return 'slide-up-open'
  if (props.content.openingStyle === 'slide-down') return 'slide-down-open'
  if (props.content.openingStyle === 'slide-left') return 'slide-left-open'
  if (props.content.openingStyle === 'slide-right') return 'slide-right-open'
  
  return 'envelope-fade'
})

const overlayClass = computed(() => {
  const textColor = props.content.openingStyle === 'minimal-light' ? 'text-slate-800' : 'text-white'
  if (props.content.openingStyle === 'wax-seal') return `${textColor} style-wax-seal`
  return textColor
})

const isSlideStyle = computed(() =>
  ['slide-up', 'slide-down', 'slide-left', 'slide-right'].includes(props.content.openingStyle)
)

const contentAlignClass = computed(() => {
  if (props.content.openingTextAlign === 'left') return 'items-start text-left'
  if (props.content.openingTextAlign === 'right') return 'items-end text-right'
  return 'items-center text-center'
})

const textStyleAccent = computed(() => {
  if (props.content.openingStyle === 'minimal-light') return { color: props.content.customAccent || 'var(--theme-accent, #8a6d3b)' }
  return { color: props.content.customAccent || 'var(--theme-accent, #f3ddaa)' }
})

const textStyleBase = computed(() => {
  if (props.content.openingStyle === 'minimal-light') return { color: minimalLightPalette.value.ink || '#1e293b' }
  return { color: '#ffffff' }
})

// BUG FIX: Completely strips text shadows if openingRemoveOverlay is toggled ON
const titleShadow = computed(() => {
  if (props.content.openingRemoveOverlay) return { textShadow: 'none' }
  if (props.content.openingStyle === 'minimal-light') {
    return { textShadow: '0 2px 16px rgba(255,255,255,0.7), 0 2px 6px rgba(255,255,255,0.85)' }
  }
  return { textShadow: '0 2px 16px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.75), 0 1px 2px rgba(0,0,0,0.9)' }
})

function buildTextOverride(font: string, fontUrl: string, fontFamily: string, size: number, color: string, weight: string) {
  const style: Record<string, string> = {}
  if (fontFamily) style.fontFamily = fontFamily
  else if (font) style.fontFamily = `'${font}', cursive`
  if (color) style.color = color
  if (weight) style.fontWeight = weight
  if (size && size !== 100) style.fontSize = `calc(1em * ${size / 100})`
  return style
}

const titleStyle = computed(() => buildTextOverride(props.content.openingTitleFont, props.content.openingTitleFontUrl, props.content.openingTitleFontFamily, props.content.openingTitleSize, props.content.openingTitleColor, props.content.openingTitleWeight))
const greetingStyle = computed(() => buildTextOverride(props.content.openingGreetingFont, props.content.openingGreetingFontUrl, props.content.openingGreetingFontFamily, props.content.openingGreetingSize, props.content.openingGreetingColor, props.content.openingGreetingWeight))
const guestNameStyle = computed(() => buildTextOverride(props.content.openingGuestNameFont, props.content.openingGuestNameFontUrl, props.content.openingGuestNameFontFamily, props.content.openingGuestNameSize, props.content.openingGuestNameColor, props.content.openingGuestNameWeight))
const greetingAfterStyle = computed(() => buildTextOverride(props.content.openingGreetingAfterFont, props.content.openingGreetingAfterFontUrl, props.content.openingGreetingAfterFontFamily, props.content.openingGreetingAfterSize, props.content.openingGreetingAfterColor, props.content.openingGreetingAfterWeight))
const actionStyle = computed(() => buildTextOverride(props.content.openingActionFont, props.content.openingActionFontUrl, props.content.openingActionFontFamily, props.content.openingActionSize, props.content.openingActionColor, props.content.openingActionWeight))

useHead({
  link: computed(() => {
    const links: Array<Record<string, string>> = []
    const urls = [
      props.content.openingTitleFontUrl,
      props.content.openingGreetingFontUrl,
      props.content.openingGuestNameFontUrl,
      props.content.openingGreetingAfterFontUrl,
      props.content.openingActionFontUrl
    ]
    for (const url of urls) {
      if (url && !url.includes('fonts.google.com/specimen/')) {
        links.push({ rel: 'stylesheet', href: url })
      }
    }
    if (props.content.openingBgUrl) {
      links.push({ rel: 'preload', as: 'image', href: optimizedImageUrl(props.content.openingBgUrl, 1400), fetchpriority: 'high' })
    }
    return links
  })
})

const sealInitials = computed(() => {
  const b = (props.content.brideName || '').trim().charAt(0).toUpperCase()
  const g = (props.content.groomName || '').trim().charAt(0).toUpperCase()
  if (!b && !g) return '❤'
  return `${b}${g ? ' & ' + g : ''}`
})

const waxBlobStyle = computed(() => ({
  background: `radial-gradient(circle at 30% 26%, var(--theme-accent-soft, #f7e3ab) 0%, var(--theme-accent, #d4a017) 55%, var(--theme-accent, #d4a017) 78%, rgba(0,0,0,0.4) 100%)`
}))

const modernDarkPalette = computed(() => modernDarkPaletteCatalog.find((p) => p.id === props.content.openingModernDarkPalette) || modernDarkPaletteCatalog[0])
const minimalLightPalette = computed(() => minimalLightPaletteCatalog.find((p) => p.id === props.content.openingMinimalLightPalette) || minimalLightPaletteCatalog[0])

const modernDarkVars = computed(() => ({
  '--md-from': modernDarkPalette.value.bgFrom,
  '--md-via': modernDarkPalette.value.bgVia,
  '--md-to': modernDarkPalette.value.bgTo,
  '--md-blob1': modernDarkPalette.value.blobPrimary,
  '--md-blob2': modernDarkPalette.value.blobSecondary
}))

const minimalLightVars = computed(() => ({
  '--ml-from': minimalLightPalette.value.bgFrom,
  '--ml-via': minimalLightPalette.value.bgVia,
  '--ml-to': minimalLightPalette.value.bgTo,
  '--ml-blob1': minimalLightPalette.value.blobPrimary,
  '--ml-blob2': minimalLightPalette.value.blobSecondary
}))

const greetingParts = computed(() => {
  const raw = props.content.openingGreeting || 'Dear'
  if (raw.includes('{guestName}')) {
    const [before, after] = raw.split('{guestName}')
    return { before: before.trim(), after: after.trim() }
  }
  return { before: raw.trim(), after: '' }
})

const guestBoxClass = computed(() => {
  const style = props.content.openingGuestNameBox
  if (style === 'arch') return 'guest-name-shape-arch px-7 pt-8 pb-5'
  if (style === 'pill') return 'guest-name-shape-pill px-9 py-5'
  if (style === 'hexagon') return 'guest-name-shape-hexagon px-10 py-6'
  if (style === 'ribbon') return 'guest-name-shape-ribbon px-9 py-5'
  if (style === 'custom') return 'guest-name-box-custom p-6'
  return ''
})

const guestBoxStyle = computed(() => {
  const style = props.content.openingGuestNameBox
  const isLight = props.content.openingStyle === 'minimal-light'
  if (style === 'arch' || style === 'pill') {
    return isLight
      ? { backgroundColor: 'rgba(255, 255, 255, 0.6)', borderColor: 'rgba(0, 0, 0, 0.1)' }
      : { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.28)' }
  }
  if (style === 'hexagon') {
    return { backgroundColor: isLight ? 'rgba(255, 255, 255, 0.55)' : 'rgba(255, 255, 255, 0.1)' }
  }
  if (style === 'ribbon') {
    return { backgroundColor: props.content.customAccent || (isLight ? '#8a6d3b' : 'var(--theme-accent, #8a6d3b)') }
  }
  return {}
})
</script>

<style scoped>
.guest-name-shape-arch { 
  border-radius: 50% 50% 6px 6px / 62% 62% 6px 6px; 
  border: 1px solid transparent; 
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5); 
}

.guest-name-shape-pill { 
  border-radius: 999px; 
  border: 1px solid transparent; 
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5); 
}

.guest-name-shape-hexagon { 
  clip-path: polygon(22% 0%, 78% 0%, 100% 50%, 78% 100%, 22% 100%, 0% 50%); 
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5); 
}

.guest-name-shape-ribbon { 
  clip-path: polygon( 0% 0%, 100% 0%, 100% 36%, 90% 50%, 100% 64%, 100% 100%, 0% 100%, 0% 64%, 10% 50%, 0% 36% ); 
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5); 
}

.guest-name-box-animated { 
  animation: guest-name-unroll 1.1s cubic-bezier(0.65, 0, 0.35, 1) both; 
}

@keyframes guest-name-unroll { 
  0% { 
    clip-path: inset(0 50% 0 50%); 
    opacity: 0; 
  } 
  45% { 
    opacity: 1; 
  } 
  100% { 
    clip-path: inset(0 0% 0 0%); 
    opacity: 1; 
  } 
}

.guest-name-box-custom { 
  position: relative; 
  width: 260px; 
  aspect-ratio: 1.6; 
  justify-content: center; 
}

.guest-name-box-custom-bg { 
  position: absolute; 
  inset: 0; 
  background-size: contain; 
  background-position: center; 
  background-repeat: no-repeat; 
}

.envelope-overlay { 
  position: absolute; 
  inset: 0; 
  z-index: 50; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  cursor: pointer; 
  overflow: hidden; 
}

/* Classic Envelope */
.envelope-classic-wrap { 
  position: relative; 
  width: min(70vw, 260px); 
  aspect-ratio: 200 / 140; 
  filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.4)); 
  animation: envelope-bob 3.5s ease-in-out infinite; 
}

@keyframes envelope-bob { 
  0%, 
  100% { 
    transform: translateY(0); 
  } 
  50% { 
    transform: translateY(-10px); 
  } 
}

.envelope-inner-card { 
  position: absolute; 
  left: 50%; 
  top: 66%; 
  width: 58%; 
  height: 52%; 
  transform: translate(-50%, -35%) scale(0.5) rotate(-2deg); 
  border-radius: 0.4rem; 
  border: 2px solid var(--theme-accent, #e3b04a); 
  background: linear-gradient(165deg, #fffdf7, #f3ead9); 
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.35); 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  gap: 10%; 
  padding: 12% 14%; 
  opacity: 0; 
  z-index: 4; 
}

.envelope-letter-icon { 
  color: var(--theme-accent, #e3b04a); 
  opacity: 0.9; 
  flex-shrink: 0; 
}

.envelope-letter-lines { 
  display: flex; 
  flex-direction: column; 
  gap: 8px; width: 100%; 
}

.envelope-letter-lines span { 
  display: block; 
  height: 6px; 
  border-radius: 999px; 
  background: rgba(20, 30, 45, 0.18); 
}

.envelope-letter-lines span:nth-child(1) { 
  width: 90%; 
}

.envelope-letter-lines span:nth-child(2) { 
  width: 65%; 
}

.envelope-body-svg { 
  position: absolute; 
  inset: 0; 
  z-index: 2; 
  width: 100%; 
  height: 100%; 
}

.envelope-flap-svg { 
  position: absolute; 
  inset: 0; 
  z-index: 3; 
  width: 100%; 
  height: 100%; 
  transform-origin: 50% 13%; 
}

.envelope-classic-leave-active 
.envelope-classic-wrap { 
  animation: none; 
}

.envelope-classic-leave-active 
.envelope-flap-svg { 
  transform: perspective(700px) rotateX(-165deg); 
  transition: transform 0.65s cubic-bezier(0.65, 0, 0.35, 1); 
}

.envelope-classic-leave-active 
.envelope-inner-card { 
  animation: classic-letter-emerge 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both; 
}

@keyframes classic-letter-emerge { 
  0% { 
    transform: translate(-50%, -35%) scale(0.5) rotate(-2deg); 
    opacity: 0; 
  } 
  18% { 
    opacity: 1; 
  } 
  58% { 
    transform: translate(-50%, -122%) scale(1.18) rotate(3deg); 
    opacity: 1; 
  } 
  100% { 
    transform: translate(-50%, -158%) scale(1.32) rotate(-1deg); 
    opacity: 1; 
  } 
}

.envelope-classic-leave-active 
.envelope-body-svg { 
  opacity: 0; 
  transition: opacity 0.4s ease 0.55s; 
}

.envelope-classic-leave-active { 
  transition: opacity 0.6s ease 0.9s; 
}

.envelope-classic-leave-to { 
  opacity: 0; 
}

/* Wax Seal details */
.wax-seal { 
  position: relative; 
  width: 104px; 
  height: 104px; 
  transform: rotate(-3deg); 
  filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.5)); 
}

.wax-seal-piece { 
  position: absolute; 
  inset: 0; 
}

.wax-seal-piece-1 { 
  clip-path: polygon(50% 0%, 100% 0%, 100% 50%, 100% 75%, 88% 78%, 68% 62%, 50% 50%, 46% 30%, 52% 8%); 
}

.wax-seal-piece-2 { 
  clip-path: polygon(100% 75%, 100% 100%, 50% 100%, 10% 95%, 12% 85%, 30% 64%, 50% 50%, 68% 62%, 88% 78%); 
}

.wax-seal-piece-3 { 
  clip-path: polygon(10% 95%, 0% 100%, 0% 50%, 0% 0%, 50% 0%, 52% 8%, 46% 30%, 50% 50%, 30% 64%, 12% 85%); 
}

.wax-seal-blob { 
  position: absolute; 
  inset: 8%; 
  border-radius: 42% 58% 63% 37% / 47% 41% 59% 53%; 
  box-shadow: inset 0 3px 6px rgba(255, 255, 255, 0.35), inset 0 -8px 14px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3); 
  border: 1px solid rgba(0, 0, 0, 0.25); 
}

.wax-seal-ring { 
  position: absolute; 
  inset: 24%; 
  border-radius: 50%; 
  border: 1px dashed rgba(0, 0, 0, 0.25); 
  pointer-events: none; 
}

.wax-seal-crack { 
  position: absolute; 
  inset: 0; 
  width: 100%; 
  height: 100%; 
  opacity: 0; 
  stroke: rgba(0, 0, 0, 0.6); 
  stroke-width: 2.2; 
  fill: none; 
  stroke-linecap: round; 
  stroke-linejoin: round; 
}

.wax-seal-initials { 
  position: absolute; 
  inset: 0; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-family: 'Cormorant Garamond', serif; 
  font-weight: 700; 
  font-size: 1.5rem; 
  letter-spacing: 0.05em; 
  color: rgba(0, 0, 0, 0.55); 
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.25); 
}

.wax-crumb { 
  position: absolute; 
  width: 4px; 
  height: 4px; 
  border-radius: 50%; 
  background: var(--theme-accent, #d4a017); 
  opacity: 0; left: 50%; top: 50%; 
}

.split-door-leave-active .wax-seal { 
  animation: wax-seal-press-crack 0.36s ease; 
}

.split-door-leave-active .wax-seal-crack { 
  animation: wax-crack-flash 0.4s ease forwards; 
}

.split-door-leave-active .wax-seal-piece-1 { 
  transition: transform 0.46s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s, opacity 0.32s ease 0.3s; 
  transform: translate(20px, -22px) rotate(38deg); 
  opacity: 0; 
}

.split-door-leave-active .wax-seal-piece-2 { 
  transition: transform 0.46s cubic-bezier(0.34, 1.56, 0.64, 1) 0.14s, opacity 0.32s ease 0.34s; 
  transform: translate(-4px, 28px) rotate(-16deg); 
  opacity: 0; 
}

.split-door-leave-active .wax-seal-piece-3 { 
  transition: transform 0.46s cubic-bezier(0.34, 1.56, 0.64, 1) 0.18s, opacity 0.32s ease 0.38s; 
  transform: translate(-24px, -10px) rotate(-40deg); 
  opacity: 0; 
}

.split-door-leave-active .wax-seal-initials { 
  transition: opacity 0.22s ease 0.08s; 
  opacity: 0; 
}

.split-door-leave-active 
.wax-crumb { 
  animation: wax-crumb-fly 0.55s ease-out forwards; 
  animation-delay: var(--delay, 0s); 
}

.split-door-leave-active 
.wax-seal-doors 
.door-left, 
.split-door-leave-active 
.wax-seal-doors 
.door-right { 
  transition-delay: 0.55s; 
}

@keyframes wax-seal-press-crack { 
  0% { 
    transform: rotate(-3deg) scale(1); 
  } 
  30% { 
    transform: rotate(-3deg) scale(0.88); 
  } 
  55% { 
    transform: rotate(-7deg) scale(1.08); 
  } 
  80% { 
    transform: rotate(2deg) scale(0.98); 
  } 
  100% { 
    transform: rotate(-3deg) scale(1); 
  } 
}

@keyframes wax-crack-flash { 
  0% { 
    opacity: 0; 
  } 
  20% { 
    opacity: 1; 
  } 
  55% { 
    opacity: 0.8; 
  } 
  100% { 
    opacity: 0; 
  } 
}

@keyframes wax-crumb-fly { 
  0% { 
    opacity: 0; 
    transform: translate(0, 0) scale(1); 
  } 
  15% { 
    opacity: 1; 
  } 
  100% { 
    opacity: 0; 
    transform: translate(var(--cx), var(--cy)) scale(0.4); 
  } 
}

/* Fade & Slide Animations */
.envelope-fade-leave-active { 
  transition: opacity 0.7s ease, 
  transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1); 
}

.envelope-fade-leave-to { 
  opacity: 0; 
  transform: scale(1.1) translateY(-20px); 
}

.slide-up-open-leave-active, 
.slide-down-open-leave-active, 
.slide-left-open-leave-active, 
.slide-right-open-leave-active { 
  transition: transform 0.65s cubic-bezier(0.65, 0, 0.35, 1), 
  opacity 0.5s ease; 
}

.slide-up-open-leave-to { 
  transform: translateY(-100%); 
  opacity: 0.4; 
}

.slide-down-open-leave-to { 
  transform: translateY(100%); 
  opacity: 0.4; 
}

.slide-left-open-leave-to { 
  transform: translateX(-100%); 
  opacity: 0.4; 
}

.slide-right-open-leave-to { 
  transform: translateX(100%); 
  opacity: 0.4; 
}

/* Grand Split Door Animation (also used by Wax Seal) */
.split-door-leave-active { 
  transition: opacity 1.35s ease; 
}

.split-door-leave-active 
.door-left { 
  transform: translateX(-100%); 
  transition: transform 1.2s cubic-bezier(0.65, 0, 0.15, 1); 
}

.split-door-leave-active 
.door-right { 
  transform: translateX(100%); 
  transition: transform 1.2s cubic-bezier(0.65, 0, 0.15, 1); 
}

.split-door-leave-active 
.content-container { 
  opacity: 0; 
  transform: scale(1.08); 
  transition: opacity 0.4s ease 0.45s, transform 0.9s cubic-bezier(0.34, 1.56, 0.64, 1); 
}

.split-door-leave-to { 
  opacity: 0; 
}

.split-door-leave-active.style-wax-seal { 
  transition: opacity 1.2s ease 0.6s; 
}

.split-door-leave-active.style-wax-seal .content-container { 
  transition: opacity 0.25s ease 0.6s, transform 0.9s cubic-bezier(0.34, 1.56, 0.64, 1); 
}

/* Confetti Burst */
.confetti-burst-leave-active { 
  transition: opacity 0.7s ease 0.5s; 
}

.confetti-burst-leave-active 
.content-container { 
  animation: content-pop-away 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; 
}

.confetti-burst-leave-active 
.confetti-burst-bg { 
  animation: burst-flash-expand 0.8s ease forwards; 
}

.confetti-burst-leave-to { 
  opacity: 0; 
}

@keyframes content-pop-away { 
  0% { 
    transform: scale(1); 
    opacity: 1; 
  } 
  40% { 
    transform: scale(1.1); 
    opacity: 1; 
  } 
  100% { 
    transform: scale(0.85); 
    opacity: 0; 
  } 
}

@keyframes burst-flash-expand { 
  0% { 
    transform: scale(1); 
    filter: brightness(1); 
  } 
  30% { 
    transform: scale(1.05); 
    filter: brightness(1.4); 
  } 
  100% { 
    transform: scale(1.15); 
    filter: brightness(1); 
    opacity: 0; 
  } 
}

.confetti-particle { 
  position: absolute; 
  top: -8%; 
  width: 8px; 
  height: 14px; 
  border-radius: 2px; 
  opacity: 0; 
  animation: confetti-fall 3.6s linear infinite; 
}

.confetti-particle:nth-child(3n) { 
  border-radius: 50%; 
  width: 9px; 
  height: 9px; 
}

.confetti-particle:nth-child(4n) { 
  width: 6px; 
  height: 12px; 
}

@keyframes confetti-fall { 
  0% { 
    transform: translate3d(0, -10px, 0) rotate(0deg); 
    opacity: 0; 
  } 
  8% { 
    opacity: 0.95; 
  } 
  88% { 
    opacity: 0.85; 
  } 
  100% { 
    transform: translate3d(0, 560px, 0) rotate(480deg); 
    opacity: 0; 
  } 
}

.cd-1 { 
  animation-delay: 0s; 
} 

.cd-2 { 
  animation-delay: 0.4s; 
} 

.cd-3 { 
  animation-delay: 0.9s; 
}
.cd-4 { 
  animation-delay: 1.3s; 
}

.cd-5 { 
  animation-delay: 1.7s; 
} 

.cd-6 { 
  animation-delay: 2.1s; 
} 

.cd-7 { 
  animation-delay: 0.2s; 
} 

.cd-8 { 
  animation-delay: 0.6s; 
}

.cd-9 { 
  animation-delay: 1.1s; 
} 

.cd-10 { 
  animation-delay: 1.5s; 
} 

.cd-11 { 
  animation-delay: 1.9s; 
} 

.cd-12 { 
  animation-delay: 2.3s; 
}

.confetti-burst-particle { 
  position: absolute; 
  left: 50%; 
  top: 42%; 
  width: 7px; 
  height: 13px; 
  border-radius: 2px; 
  opacity: 0; 
  transform: translate(-50%, -50%) scale(0.6); 
}

.confetti-burst-particle:nth-child(3n) { 
  border-radius: 50%; 
  width: 8px; 
  height: 8px; 
}

.confetti-burst-leave-active 
.confetti-burst-particle { 
  animation: confetti-pop 0.9s cubic-bezier(0.16, 1, 0.3, 1) var(--del, 0s) forwards; 
}

@keyframes confetti-pop { 
  0% { 
    transform: translate(-50%, -50%) translate(0, 0) rotate(0deg) scale(0.6); 
    opacity: 0; 
  } 
  12% { 
    opacity: 1; 
  } 
  100% { 
    transform: translate(-50%, -50%) translate(var(--bx), var(--by)) rotate(var(--brot)) scale(1); 
    opacity: 0; 
  } 
}

.modern-dark-bg { 
  background: linear-gradient(160deg, var(--md-from), var(--md-via) 55%, var(--md-to)); 
}

.modern-dark-bg .md-blob { 
  position: absolute; 
  border-radius: 50%; 
  filter: blur(70px); 
  mix-blend-mode: screen; 
  animation: md-drift 9s ease-in-out infinite; 
}

.modern-dark-bg .md-blob-1 { 
  width: 260px; 
  height: 260px; 
  top: -60px; 
  left: -60px; 
  background: var(--md-blob1); 
}

.modern-dark-bg 
.md-blob-2 { 
  width: 320px; 
  height: 320px; 
  bottom: -100px; 
  right: -80px; 
  background: var(--md-blob2); 
  animation-delay: -3s; 
}

.modern-dark-bg .md-blob-3 { 
  width: 180px; 
  height: 180px; 
  top: 40%; 
  right: 10%; 
  background: var(--md-blob1); 
  opacity: 0.5; 
  animation-delay: -6s; 
}

@keyframes md-drift { 
  0%, 
  100% { 
    transform: translate(0, 0) scale(1); 
  } 
  50% { 
    transform: translate(18px, -14px) scale(1.08); 
  } 
}

.modern-dark-bg .md-frame { 
  position: absolute; 
  inset: 22px; 
  border: 1px solid rgba(227, 176, 74, 0.25); 
  border-radius: 4px; 
  pointer-events: none; 
}

.modern-dark-bg .md-grain { 
  position: absolute; 
  inset: 0; 
  opacity: 0.05; 
  background-image: radial-gradient(circle, #fff 1px, transparent 1px); 
  background-size: 3px 3px; 
}

.minimal-light-bg { 
  background: linear-gradient(160deg, var(--ml-from), var(--ml-via) 55%, var(--ml-to)); 
}

.minimal-light-bg .ml-blob { 
  position: absolute; 
  border-radius: 50%; 
  filter: blur(50px); 
  mix-blend-mode: multiply; 
  opacity: 0.5; 
  animation: ml-drift 10s ease-in-out infinite; 
}

.minimal-light-bg .ml-blob-1 { 
  width: 220px; 
  height: 220px; 
  top: 5%; 
  left: -40px; 
  background: var(--ml-blob1); 
}

.minimal-light-bg .ml-blob-2 { 
  width: 260px; 
  height: 260px; 
  bottom: -60px; 
  right: -60px; 
  background: var(--ml-blob2); 
  animation-delay: -5s; 
}

@keyframes ml-drift { 
  0%, 
  100% { 
    transform: translate(0, 0); 
  } 
  50% { 
    transform: translate(14px, 10px); 
  } 
}

.minimal-light-bg .ml-dot-ring { 
  position: absolute; 
  inset: 20px; 
  border-radius: 999px; 
  border: 1px dashed rgba(0, 0, 0, 0.08); 
  pointer-events: none; 
}

@media (prefers-reduced-motion: reduce) {
  .envelope-classic-wrap { 
    animation: none; 
  }
  .envelope-classic-leave-active .envelope-flap-svg,
  .envelope-classic-leave-active .envelope-inner-card,
  .envelope-classic-leave-active .envelope-body-svg,
  .envelope-classic-leave-active { 
    animation-duration: 0.2s; 
    animation-delay: 0s; 
    transition-duration: 0.2s; 
    transition-delay: 0s; 
  }

  .split-door-leave-active .wax-seal,
  .split-door-leave-active .wax-seal-crack { 
    animation: none; 
  }
  .split-door-leave-active .wax-seal-piece-1,
  .split-door-leave-active .wax-seal-piece-2,
  .split-door-leave-active .wax-seal-piece-3,
  .split-door-leave-active .wax-seal-initials,
  .split-door-leave-active .wax-crumb,
  .split-door-leave-active .content-container,
  .split-door-leave-active .door-left,
  .split-door-leave-active .door-right,
  .split-door-leave-active.style-wax-seal,
  .split-door-leave-active.style-wax-seal .content-container { 
    animation-duration: 0.2s; 
    animation-delay: 0s; 
    transition-duration: 0.2s; 
    transition-delay: 0s; 
  }

  .confetti-burst-leave-active .content-container,
  .confetti-burst-leave-active .confetti-burst-bg,
  .confetti-burst-leave-active .confetti-burst-particle { 
    animation: none; 
    transition-duration: 0.2s; 
    transition-delay: 0s; 
  }

  .confetti-burst-leave-active { 
    transition-duration: 0.2s; 
    transition-delay: 0s; 
  }

  .confetti-particle, 
  .modern-dark-bg .md-blob, 
  .minimal-light-bg .ml-blob { 
    animation: none; 
  }
  .guest-name-box-animated { 
    animation: none; 
    clip-path: none; 
    opacity: 1; 
  }
}

.cfg-bg { 
  background: linear-gradient(160deg, var(--cfg-from) 0%, var(--cfg-via) 55%, var(--cfg-to) 100%); 
}

.cfg-blob { 
  position: absolute; 
  width: 60%; 
  aspect-ratio: 1; 
  border-radius: 9999px; filter: blur(60px); 
  opacity: 0.5; 
  background: var(--cfg-accent); 
  animation: cfg-drift var(--cfg-duration, 900ms) ease-in-out infinite alternate; 
}

.cfg-blob-1 { 
  top: -15%; 
  left: -15%; 
}

.cfg-blob-2 { 
  bottom: -20%; 
  right: -15%; 
  background: color-mix(in srgb, var(--cfg-accent) 55%, #ffffff); 
  animation-delay: 0.4s; 
}

@keyframes cfg-drift { 
  from { 
    transform: translate(0, 0) scale(1); } 
    to { 
      transform: translate(8%, 10%) scale(1.15); 
    } 
  }

.cfg-confetti { 
  position: absolute; 
  top: -10%; 
  width: 8px; 
  height: 14px; 
  border-radius: 2px; 
  opacity: 0.85; 
  animation: cfg-fall 3s linear infinite; 
}

@keyframes cfg-fall { 
  to { 
    transform: translateY(120vh) rotate(360deg); 
  } 
}

@media (prefers-reduced-motion: reduce) { .cfg-blob, .cfg-confetti { animation: none; } }
</style>