<template>
  <DashboardBillingPanel />
</template>

<script setup lang="ts">
// The actual Billing content lives in
// app/components/DashboardBillingPanel.vue, shared with the superadmin
// editing view at /admin/wedding/[id]/billing.vue, so there's only ever
// one implementation.
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
</script>
