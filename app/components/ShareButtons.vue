<template>
  <!-- These sit directly on the page's own theme background, which can be
       a light palette (Ivory Minimalist, Sky Serenade, Matcha Strawberry).
       UButton's built-in success/neutral "soft" colors are tuned for a
       dark backdrop and washed out to near-invisible on a light one -
       theme-ink-based coloring instead keeps both legible on every theme,
       same fix already applied to the RSVP page's "Return to Invitation"
       pill and the "View Details" button. -->
  <div class="flex items-center justify-center gap-3">
    <UButton
      icon="i-heroicons-chat-bubble-left-right"
      variant="soft"
      color="neutral"
      :to="whatsappUrl"
      target="_blank"
      external
      class="border text-[color-mix(in_srgb,var(--theme-ink)_90%,transparent)] bg-[color-mix(in_srgb,var(--theme-ink)_5%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-ink)_10%,transparent)] border-[color-mix(in_srgb,var(--theme-ink)_12%,transparent)]"
    >
      Share on WhatsApp
    </UButton>

    <UButton
      icon="i-heroicons-link"
      variant="soft"
      color="neutral"
      @click="copyLink"
      class="border text-[color-mix(in_srgb,var(--theme-ink)_90%,transparent)] bg-[color-mix(in_srgb,var(--theme-ink)_5%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-ink)_10%,transparent)] border-[color-mix(in_srgb,var(--theme-ink)_12%,transparent)]"
    >
      {{ copied ? 'Copied!' : 'Copy Link' }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { buildShareMessage } from '~/composables/useWeddingTypes'

const props = defineProps<{ brideName: string; groomName: string; dateLabel?: string; shareMessage?: string }>()
const toast = useToast()
const copied = ref(false)

const currentUrl = computed(() => {
  if (import.meta.client) return window.location.href
  return ''
})

const DEFAULT_TEMPLATE = "You're invited to {brideName} & {groomName}'s wedding! {date}. RSVP here: {link}"

const whatsappUrl = computed(() => {
  const text = buildShareMessage(props.shareMessage || DEFAULT_TEMPLATE, {
    brideName: props.brideName,
    groomName: props.groomName,
    date: props.dateLabel,
    link: currentUrl.value
  })
  return `https://wa.me/?text=${encodeURIComponent(text)}`
})

async function copyLink() {
  try {
    await navigator.clipboard.writeText(currentUrl.value)
    copied.value = true
    toast.add({ title: 'Link copied', description: 'Share it with your guests.', color: 'success' })
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    toast.add({ title: 'Could not copy link', color: 'error' })
  }
}
</script>