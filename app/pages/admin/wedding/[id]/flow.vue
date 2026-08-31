<template>
  <DashboardFlowPanel :override-wedding-id="weddingId" />
</template>

<script setup lang="ts">
// See app/pages/admin/wedding/[id]/editor.vue for the full explanation:
// this renders the shared DashboardFlowPanel component (also used by the
// real couple-facing page) instead of a separately maintained copy, via a
// plain component in app/components/ rather than importing one page file
// into another (which broke production routing).
definePageMeta({ layout: 'admin-wedding', middleware: 'superadmin' })

const route = useRoute()
const weddingId = computed(() => route.params.id as string)
</script>
