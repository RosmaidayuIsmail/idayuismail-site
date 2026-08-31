<template>
  <DashboardGuestsPanel />
</template>

<script setup lang="ts">
// The actual Guest List content lives in
// app/components/DashboardGuestsPanel.vue, shared with the superadmin
// editing view at /admin/wedding/[id]/guests.vue, so there's only ever one
// implementation.
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
</script>
