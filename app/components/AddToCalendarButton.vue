<template>
  <!-- accent-soft-btn: was color="primary" (fixed brand gold) - now tints
       with the couple's own theme accent instead, same fix already applied
       to the RSVP/Google Maps buttons elsewhere on these pages. -->
  <UButton
    icon="i-heroicons-calendar-days"
    color="neutral"
    variant="soft"
    class="accent-soft-btn"
    @click="downloadIcs"
  >
    {{ label || 'Add to Calendar' }}
  </UButton>
</template>

<script setup lang="ts">
const props = defineProps<{
  brideName: string
  groomName: string
  dateIso: string
  venueName: string
  venueAddress: string
  rsvpDeadlineLabel?: string
  label?: string
}>()

function toIcsDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function downloadIcs() {
  if (!props.dateIso) return
  const start = new Date(props.dateIso)
  const end = new Date(start.getTime() + 5 * 60 * 60 * 1000) // default 5 hour block

  const description = `Wedding of ${props.brideName} & ${props.groomName}.${props.rsvpDeadlineLabel ? ` RSVP by ${props.rsvpDeadlineLabel}.` : ''}`

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Invite//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@weddingcard`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${props.brideName} & ${props.groomName}\u2019s Wedding`,
    `DESCRIPTION:${description}`,
    `LOCATION:${props.venueName}, ${props.venueAddress}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${props.brideName}-${props.groomName}-wedding.ics`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.accent-soft-btn {
  background-color: color-mix(in srgb, var(--theme-accent, #d4a017) 15%, transparent) !important;
  color: var(--theme-accent, #d4a017) !important;
}
.accent-soft-btn:hover {
  background-color: color-mix(in srgb, var(--theme-accent, #d4a017) 25%, transparent) !important;
}
</style>
