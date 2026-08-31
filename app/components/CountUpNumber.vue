<template>
  <span>{{ displayValue }}</span>
</template>

<script setup lang="ts">
const props = defineProps<{ value: number }>()

const displayValue = ref(0)
let frame: number | null = null

function animateTo(target: number) {
  if (frame) cancelAnimationFrame(frame)
  const start = displayValue.value
  const startTime = performance.now()
  const duration = 500

  const step = (now: number) => {
    const progress = Math.min((now - startTime) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    displayValue.value = Math.round(start + (target - start) * eased)
    if (progress < 1) {
      frame = requestAnimationFrame(step)
    }
  }

  frame = requestAnimationFrame(step)
}

watch(
  () => props.value,
  (newValue) => {
    if (import.meta.client) {
      animateTo(newValue)
    } else {
      displayValue.value = newValue
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (frame) cancelAnimationFrame(frame)
})
</script>
