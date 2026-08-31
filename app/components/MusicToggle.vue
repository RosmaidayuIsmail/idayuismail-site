<template>
  <UButton
    :icon="playing ? 'i-heroicons-speaker-wave' : 'i-heroicons-speaker-x-mark'"
    color="neutral"
    variant="soft"
    size="sm"
    class="rounded-full backdrop-blur bg-white/10 hover:bg-white/20 ring-1 ring-gold-300/40"
    :aria-pressed="playing"
    :aria-label="playing ? 'Pause background music' : 'Play background music'"
    @click="toggle"
  />
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ src?: string; autoplay?: boolean }>(), {
  src: '/audio/bgm.mp3',
  autoplay: false
})

// The actual <audio>/YouTube player lives in a page-independent singleton
// (useBackgroundMusic.ts), not in this component - so it keeps playing
// uninterrupted as the guest navigates Opening -> Details -> RSVP instead
// of being destroyed and restarted on every page. This component is just a
// thin remote control: mounting it makes sure the singleton is set up for
// this wedding's track (a no-op if it already is, so playback in progress
// is never restarted), and the button reflects/toggles whatever's playing.
const { playing, ensurePlaying, toggle } = useBackgroundMusic()

onMounted(() => ensurePlaying(props.src, props.autoplay))

// The Design Studio / Opening Design editors bind :src to a live form
// field, so a couple pasting a new link should swap the track.
watch(
  () => props.src,
  (src) => ensurePlaying(src, props.autoplay)
)

function play() {
  if (!playing.value) toggle()
}

defineExpose({ play })
</script>
