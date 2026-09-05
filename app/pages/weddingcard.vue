<template>
  <div class="relative min-h-screen invite-backdrop text-white selection:bg-gold-400 selection:text-ink-950 overflow-x-hidden">
    <!-- Same viewport-scaling glow as the personal hub (app/pages/index.vue)
         - .invite-backdrop's own radial glow is quite faint on its own on a
         big monitor, this gives it real presence beyond the petals. -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute -top-[15vw] -left-[10vw] w-[50vw] h-[50vw] max-w-[46rem] max-h-[46rem] bg-gold-400/15 blur-[100px] rounded-full" />
      <div class="absolute top-[40vh] -right-[15vw] w-[45vw] h-[45vw] max-w-[42rem] max-h-[42rem] bg-indigo-400/10 blur-[100px] rounded-full" />
      <div class="absolute bottom-[-15vh] left-[10vw] w-[40vw] h-[40vw] max-w-[38rem] max-h-[38rem] bg-gold-400/10 blur-[100px] rounded-full" />
    </div>
    <PetalsBackground :count="18" />

    <!-- Sticky Glass Navbar -->
    <header class="fixed top-0 inset-x-0 z-50 transition-all duration-300" :class="{ 'bg-ink-950/70 backdrop-blur-md border-b border-white/10 shadow-lg py-3': scrolled, 'py-5': !scrolled }">
      <div class="max-w-[1600px] mx-auto px-6 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <SiteLogoLink label="Back to Idayu Ismail" class="w-9 h-9" />
          <div class="w-px h-6 bg-white/10" />
          <div class="flex items-center gap-2 group cursor-pointer" @click="scrollToTop">
            <div class="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-gold-400/50 transition-colors">
              <UIcon name="i-heroicons-heart" class="w-5 h-5 text-gold-300 group-hover:scale-110 transition-transform" />
            </div>
            <span class="font-display font-bold text-xl tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-gold-100 to-gold-400">WeddingCard</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <UButton to="/login" color="primary" class="font-semibold shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40 transition-shadow rounded-full px-6 py-2">
            Log In
          </UButton>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="relative z-10 pt-40 pb-20 px-6 max-w-[1400px] mx-auto text-center flex flex-col items-center">
      <div class="animate-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-400/30 bg-gold-400/10 text-gold-200 text-xs font-medium tracking-wider uppercase mb-8 backdrop-blur-sm">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
        </span>
        Create digital & printable invites
      </div>
      
      <h1 class="animate-fade-up delay-1 font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
        Design your perfect day, <br class="hidden md:block" />
        <span class="italic font-light text-gold-200 drop-shadow-md">beautifully shared.</span>
      </h1>
      
      <p class="animate-fade-up delay-2 text-lg sm:text-xl text-white/60 max-w-2xl font-light leading-relaxed mb-10">
        A premium studio to build your wedding invitation, manage VIP RSVPs, and plan your timeline. Start with our elegant themes and customize every detail.
      </p>
      
      <div class="animate-fade-up delay-3 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <UButton to="/login" size="xl" color="primary" class="w-full sm:w-auto font-semibold text-base px-8 py-4 rounded-full shadow-[0_0_40px_-10px_rgba(212,160,23,0.5)] hover:scale-105 transition-transform duration-300">
          Log In
        </UButton>
      </div>
    </section>

    <!-- Bento Grid Features -->
    <section class="relative z-10 max-w-[1600px] mx-auto px-6 py-24">
      <ScrollReveal>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
        
        <!-- Large Feature -->
        <div class="md:col-span-2 bento-card group">
          <div class="absolute inset-0 bg-gradient-to-br from-gold-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <UIcon name="i-heroicons-swatch" class="w-10 h-10 text-gold-300 mb-5 relative z-10 transition-transform group-hover:scale-110 duration-300" />
          <h3 class="text-2xl font-display font-bold text-white mb-2 relative z-10">Themeable Design Studio</h3>
          <p class="text-white/60 text-lg max-w-md relative z-10">Customize your layout, typography, and palette. Override default presets to match your exact wedding motif flawlessly.</p>
          <!-- Decorative abstract UI element -->
          <div class="absolute right-0 bottom-0 p-6 opacity-20 group-hover:opacity-100 transition-all duration-700 transform translate-x-8 translate-y-8 group-hover:translate-x-0 group-hover:translate-y-0">
            <div class="w-48 h-32 rounded-tl-2xl bg-white/10 border-t border-l border-white/20 backdrop-blur-md shadow-2xl"></div>
          </div>
        </div>

        <!-- Square Feature -->
        <div class="bento-card group">
          <UIcon name="i-heroicons-printer" class="w-8 h-8 text-gold-300 mb-4 transition-transform group-hover:scale-110 duration-300" />
          <h3 class="text-xl font-bold text-white mb-2">Print & Digital</h3>
          <p class="text-white/60 text-sm leading-relaxed">Share a live web link with responsive design, or generate a high-res PDF for physical printing.</p>
        </div>

        <!-- Square Feature -->
        <div class="bento-card group">
          <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <UIcon name="i-heroicons-users" class="w-8 h-8 text-emerald-400 mb-4 transition-transform group-hover:scale-110 duration-300 relative z-10" />
          <h3 class="text-xl font-bold text-white mb-2 relative z-10">Smart RSVP System</h3>
          <p class="text-white/60 text-sm leading-relaxed relative z-10">Manage general and VIP guests, collect dietary needs, and export your final headcount to CSV instantly.</p>
        </div>

        <!-- Large Feature -->
        <div class="md:col-span-2 bento-card group overflow-hidden">
           <div class="absolute inset-0 bg-gradient-to-tl from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <UIcon name="i-heroicons-clock" class="w-10 h-10 text-gold-300 mb-5 relative z-10 transition-transform group-hover:scale-110 duration-300" />
          <h3 class="text-2xl font-display font-bold text-white mb-2 relative z-10">Wedding Day Flow</h3>
          <p class="text-white/60 text-lg max-w-md relative z-10">Keep guests informed with a beautifully styled chronological timeline of your ceremony and reception events.</p>
          <div class="absolute right-8 bottom-0 flex flex-col gap-2 opacity-20 group-hover:opacity-50 transition-all duration-700 transform translate-y-12 group-hover:translate-y-4">
             <div class="w-40 h-8 rounded-full bg-white/20 blur-[1px]"></div>
             <div class="w-32 h-8 rounded-full bg-white/20 blur-[1px] ml-4"></div>
          </div>
        </div>
      </div>
      </ScrollReveal>
    </section>

    <!-- Themes Showcase -->
    <section class="relative z-10 py-24 bg-ink-900/40 border-y border-white/5 backdrop-blur-sm">
      <div class="max-w-[1600px] mx-auto px-6">
        <ScrollReveal :delay="80">
        <div class="text-center mb-16">
          <h2 class="font-display text-4xl font-bold text-white mb-4">Curated Aesthetics</h2>
          <p class="text-white/60 text-lg max-w-2xl mx-auto">From minimalist modern to rich traditional styles, pick a foundation and make it yours.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="theme in allThemes.slice(0, 3)" :key="theme.id" class="theme-showcase-card group cursor-pointer">
            <div class="aspect-[4/3] w-full rounded-t-2xl relative overflow-hidden bg-black/20">
              <div class="absolute inset-0 transition-transform duration-700 group-hover:scale-110" :style="{ background: `linear-gradient(135deg, ${theme.palette.bgFrom}, ${theme.palette.bgTo})` }"></div>
              <!-- Abstract Mockup -->
              <div class="absolute inset-x-12 inset-y-8 rounded-xl border border-white/20 backdrop-blur-md flex flex-col items-center justify-center p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:-translate-y-3">
                <div class="w-12 h-12 rounded-full border border-white/30 mb-4 shadow-inner" :style="{ background: theme.palette.accent }"></div>
                <div class="w-3/4 h-2 rounded-full bg-white/30 mb-3"></div>
                <div class="w-1/2 h-2 rounded-full bg-white/20"></div>
              </div>
            </div>
            <div class="p-6 bg-white/[0.02] border border-white/10 border-t-0 rounded-b-2xl transition-colors group-hover:bg-white/[0.04]">
              <div class="flex justify-between items-start mb-2">
                <h3 class="text-lg font-bold text-white tracking-wide">{{ theme.name }}</h3>
                <UBadge :color="theme.price === 0 ? 'neutral' : 'primary'" variant="subtle" size="sm" class="shadow-sm">
                  {{ theme.price === 0 ? 'Free' : `${theme.currency} ${theme.price}` }}
                </UBadge>
              </div>
              <p class="text-sm text-white/50 leading-relaxed">{{ theme.tagline }}</p>
            </div>
          </div>
        </div>
        </ScrollReveal>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="relative z-10 max-w-4xl mx-auto px-6 py-32 text-center">
      <ScrollReveal :delay="120">
      <div class="p-12 sm:p-16 rounded-3xl border border-gold-400/20 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-50"></div>
        <h2 class="font-display text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">Begin your forever,<br/> beautifully.</h2>
        <p class="text-white/60 text-lg mb-10 max-w-xl mx-auto">Join couples who have transformed how they invite and manage their guests. Set up your card in minutes.</p>
        <UButton to="/login" size="xl" color="primary" class="font-semibold text-base px-10 py-5 rounded-full shadow-[0_0_40px_-10px_rgba(212,160,23,0.5)] hover:scale-105 transition-transform duration-300">
          Log In
        </UButton>
      </div>
      </ScrollReveal>
    </section>
    
    <!-- Footer -->
    <footer class="relative z-10 border-t border-white/10 bg-ink-950/80 backdrop-blur-lg">
      <div class="max-w-[1600px] mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-heart" class="w-5 h-5 text-gold-300" />
          <span class="font-display font-semibold text-white/80">WeddingCard</span>
        </div>
        <p class="text-sm text-white/40">© {{ new Date().getFullYear() }} WeddingCard. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'

const { allThemes } = useThemes()
const { y } = useWindowScroll()
const scrolled = computed(() => y.value > 20)

function scrollToTop() {
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

useSeoMeta({
  title: 'WeddingCard — Design your wedding invitation & manage RSVPs',
  description: 'Build a beautiful digital and printable wedding invitation, manage VIP and general guest lists, plan your wedding-day flow, and track RSVPs live.'
})
</script>

<style scoped>
.bento-card {
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.5rem;
  padding: 2.5rem;
  overflow: hidden;
  backdrop-filter: blur(12px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05);
}

.bento-card:hover {
  border-color: rgba(212, 160, 23, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
}

.theme-showcase-card {
  border-radius: 1.5rem;
  transition: transform 0.4s ease;
}
</style>
