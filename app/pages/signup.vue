<template>
  <div class="min-h-screen invite-backdrop text-white flex items-center justify-center px-6 py-16 relative overflow-hidden">
    <PetalsBackground :count="10" />

    <div class="relative z-10 w-full max-w-sm animate-fade-up">
      <div class="text-center mb-6">
        <NuxtLink to="/" class="inline-flex items-center gap-2">
          <UIcon name="i-heroicons-heart" class="w-5 h-5 text-gold-300" />
          <span class="font-display font-semibold text-gold-100">WeddingCard</span>
        </NuxtLink>
      </div>

      <!-- Self-service sign-up is closed - WeddingCard is invitation-only
           now, every wedding is created by the admin (see firestore.rules:
           weddings/create requires isSuperAdmin()). This replaces the old
           account-creation form rather than deleting the route outright, so
           an old bookmark or shared link lands somewhere friendly instead
           of a dead form or a raw 404. -->
      <div class="rounded-2xl border border-gold-400/20 bg-ink-900/60 backdrop-blur p-6 shadow-xl text-center space-y-4">
        <UIcon name="i-heroicons-envelope-open" class="w-8 h-8 mx-auto text-gold-300" />
        <h1 class="text-xl font-display font-bold text-gold-100">By invitation only</h1>
        <p class="text-sm text-white/60 leading-relaxed">
          WeddingCard isn't self-service right now - every invitation is set up personally.
          Reach out and we'll get yours created for you.
        </p>
        <UButton to="/" block size="lg" variant="soft" color="neutral" class="font-medium">
          Back to home
        </UButton>
        <p class="text-center text-sm text-white/60 pt-2">
          Already have an account? <NuxtLink to="/login" class="text-gold-300 hover:underline">Log in</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'By invitation only \u2014 WeddingCard' })
</script>
