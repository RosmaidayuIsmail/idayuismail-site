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

      <div class="rounded-2xl border border-gold-400/20 bg-ink-900/60 backdrop-blur p-6 shadow-xl">
        <h1 class="text-xl font-display font-bold text-center text-gold-100 mb-5">Welcome back</h1>

        <UAlert
          v-if="!isConfigured"
          icon="i-heroicons-exclamation-triangle"
          color="warning"
          variant="soft"
          title="Firebase isn't configured yet"
          description="Add your Firebase credentials to .env to enable sign-in."
          class="mb-4"
        />

        <div class="space-y-4">
          <UFormField label="Email">
            <UInput v-model="email" type="email" placeholder="you@example.com" size="lg" class="w-full" @keydown.enter="handleLogin" />
          </UFormField>
          <UFormField label="Password">
            <UInput v-model="password" type="password" placeholder="••••••••" size="lg" class="w-full" @keydown.enter="handleLogin" />
          </UFormField>

          <p v-if="errorMessage" class="text-sm text-red-400">{{ errorMessage }}</p>

          <UButton block size="lg" color="primary" class="font-semibold" :loading="loading" @click="handleLogin">
            Log in
          </UButton>

          <div class="flex items-center gap-3 text-xs text-white/40">
            <div class="h-px flex-1 bg-white/10" /> or <div class="h-px flex-1 bg-white/10" />
          </div>

          <UButton block size="lg" variant="soft" color="neutral" :loading="googleLoading" @click="handleGoogle">
            Continue with Google
          </UButton>
        </div>


      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { signIn, signInWithGoogle, isConfigured, profile } = useAuth()
const route = useRoute()

const email = ref('')
const password = ref('')
const loading = ref(false)
const googleLoading = ref(false)
const errorMessage = ref('')

// If middleware bounced someone here from a protected page (e.g. /admin or
// /dashboard), send them back there - that page's own middleware will still
// have the final say (e.g. a couple account hitting redirect=/admin gets
// bounced onward to /dashboard by the superadmin middleware anyway). With no
// explicit target, default by role: admins land on /admin, couples on
// /dashboard, never the other one's area. This is the regular couple/admin
// login - a VIP account normally signs in at /vip/login instead, but if one
// ends up here anyway (e.g. an old bookmark), send them to their own
// dashboard rather than the couple one.
const redirectTo = computed(() => {
  const raw = route.query.redirect
  const isSafeInternalPath = typeof raw === 'string' && raw.startsWith('/') && !raw.startsWith('//')
  if (isSafeInternalPath) return raw
  if (profile.value?.role === 'superadmin') return '/admin'
  return '/dashboard'
})

async function handleLogin() {
  errorMessage.value = ''
  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter your email and password.'
    return
  }
  loading.value = true
  try {
    const user = await signIn(email.value, password.value)
    await navigateTo(user.emailVerified ? redirectTo.value : '/verify-email')
  } catch (error) {
    errorMessage.value = 'Could not sign in \u2014 check your email and password.'
    console.error(error)
  } finally {
    loading.value = false
  }
}

async function handleGoogle() {
  errorMessage.value = ''
  googleLoading.value = true
  try {
    const user = await signInWithGoogle()
    await navigateTo(user.emailVerified ? redirectTo.value : '/verify-email')
  } catch (error) {
    errorMessage.value = 'Google sign-in failed. Please try again.'
    console.error(error)
  } finally {
    googleLoading.value = false
  }
}

useSeoMeta({ title: 'Log in \u2014 WeddingCard' })
</script>
