<template>
  <div class="min-h-screen text-ink-900 dark:text-gold-50 selection:bg-gold-400 selection:text-ink-950">
    <!-- Header -->
    <header class="max-w-6xl mx-auto px-6 pt-8 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-white flex items-center justify-center font-display font-bold text-lg shadow-md shadow-gold-500/20">
          I
        </div>
        <span class="font-display font-semibold text-lg tracking-wide text-ink-950 dark:text-gold-100">Idayu Ismail</span>
      </div>
      <ThemeToggle />
    </header>

    <!-- Hero -->
    <section class="max-w-3xl mx-auto px-6 pt-20 sm:pt-28 pb-16 sm:pb-20 text-center">
      <p class="animate-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-500/30 bg-gold-400/10 text-gold-700 dark:text-gold-200 text-xs font-medium tracking-wider uppercase mb-8">
        <UIcon name="i-heroicons-sparkles" class="w-3.5 h-3.5" />
        Welcome to my corner of the internet
      </p>

      <h1 class="animate-fade-up delay-1 font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight text-ink-950 dark:text-white">
        Hi, I'm <span class="italic font-light text-gold-600 dark:text-gold-300">Idayu</span>.
      </h1>

      <p class="animate-fade-up delay-2 mt-6 text-lg sm:text-xl text-ink-900/60 dark:text-white/60 font-light leading-relaxed">
        Designer, creator, and planner of beautiful things — from wedding
        invitations to the house of my dreams. Pick a door and come on in.
      </p>
    </section>

    <!-- Doors -->
    <section class="max-w-6xl mx-auto px-6 pb-24 sm:pb-28">
      <ScrollReveal>
        <h2 class="font-display text-2xl sm:text-3xl font-bold text-center text-ink-950 dark:text-white mb-3">Where would you like to go?</h2>
        <p class="text-center text-ink-900/55 dark:text-white/50 mb-10">Each one is a little world of its own.</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <HubDoorCard
            to="/weddingcard"
            title="WeddingCard"
            icon="i-heroicons-heart"
            description="The invitation platform — design wedding cards, manage guest lists and RSVPs, and share your big day beautifully."
            cta="Enter WeddingCard"
            icon-class="bg-gold-400/15 text-gold-600 dark:text-gold-300"
          />
          <HubDoorCard
            to="/portfolio"
            title="Portfolio"
            icon="i-heroicons-briefcase"
            description="My design work — projects, case studies, and the things I've made along the way."
            cta="View portfolio"
            icon-class="bg-indigo-400/15 text-indigo-600 dark:text-indigo-300"
          />
          <HubDoorCard
            to="/studio"
            title="Home Studio"
            icon="i-heroicons-home-modern"
            description="My house-designing playground — draw floor plans, arrange furniture, and walk through them in 3D."
            cta="Open the studio"
            icon-class="bg-emerald-400/15 text-emerald-600 dark:text-emerald-300"
          />
        </div>
      </ScrollReveal>
    </section>

    <!-- Hobbies -->
    <section class="border-y border-ink-900/5 dark:border-white/5 bg-white/60 dark:bg-white/[0.02] py-20 sm:py-24">
      <div class="max-w-6xl mx-auto px-6">
        <ScrollReveal :delay="80">
          <div class="text-center mb-12">
            <h2 class="font-display text-3xl sm:text-4xl font-bold text-ink-950 dark:text-white">Life beyond work</h2>
            <p class="mt-3 text-ink-900/60 dark:text-white/60 text-lg">The hobbies I'm slowly building a home for, right here.</p>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <HubHobbyCard
              to="/studio"
              icon="i-heroicons-home-modern"
              title="Home Studio"
              note="Designing and planning my dream house, one floor plan at a time."
              icon-class="bg-emerald-400/15 text-emerald-600 dark:text-emerald-300"
            />
            <HubHobbyCard
              icon="i-heroicons-paper-airplane"
              title="Travel"
              note="Collecting places, stories, and boarding passes."
              icon-class="bg-sky-400/15 text-sky-600 dark:text-sky-300"
            />
            <HubHobbyCard
              icon="i-heroicons-cake"
              title="Baking"
              note="Recipes, experiments, and the occasional perfect kuih."
              icon-class="bg-rose-400/15 text-rose-600 dark:text-rose-300"
            />
            <HubHobbyCard
              icon="i-heroicons-book-open"
              title="Reading"
              note="A slow-growing shelf of books on design, homes, and life."
              icon-class="bg-amber-400/15 text-amber-600 dark:text-amber-300"
            />
          </div>
        </ScrollReveal>
      </div>
    </section>

    <!-- Footer -->
    <footer class="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-ink-900/50 dark:text-white/40">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-heart" class="w-4 h-4 text-gold-500" />
        <span class="font-display">Idayu Ismail</span>
      </div>
      <p>© {{ new Date().getFullYear() }} — designed &amp; built with love.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Idayu Ismail — Designer & Creator',
  description: 'The personal home of Idayu Ismail: WeddingCard invitation platform, portfolio, and the Home Studio house designer.'
})

useHead({
  link: [
    {
      key: 'favicon',
      rel: 'icon',
      type: 'image/svg+xml',
      href: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🌸</text></svg>'
    }
  ]
})
</script>
