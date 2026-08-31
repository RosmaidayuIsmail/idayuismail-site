<template>
  <DashboardOpeningPanel />
</template>

<script setup lang="ts">
// The actual Opening Design content lives in
// app/components/DashboardOpeningPanel.vue, shared with the superadmin
// editing view at /admin/wedding/[id]/opening.vue, so there's only ever
// one implementation.
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
</script>
