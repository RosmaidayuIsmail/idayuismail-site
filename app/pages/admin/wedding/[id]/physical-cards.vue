<template>
  <DashboardPhysicalCardsPanel :override-wedding-id="weddingId" />
</template>

<script setup lang="ts">
// See app/pages/admin/wedding/[id]/editor.vue for the full explanation:
// this renders the shared DashboardPhysicalCardsPanel component (also used
// by the real couple-facing page) instead of a separately maintained copy.
definePageMeta({ layout: 'admin-wedding', middleware: 'superadmin' })

const route = useRoute()
const weddingId = computed(() => route.params.id as string)
</script>
