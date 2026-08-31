<template>
  <DashboardOpeningPanel :override-wedding-id="weddingId" />
</template>

<script setup lang="ts">
// See app/pages/admin/wedding/[id]/editor.vue for the full explanation: this
// renders the shared DashboardOpeningPanel component (also used by the real
// couple-facing dashboard at /dashboard/opening) instead of a separately
// maintained copy, via a plain component in app/components/ rather than
// importing one page file into another (which broke production routing).
//
// This used to be its own hand-duplicated copy of the Opening Design form,
// which drifted out of sync with DashboardOpeningPanel.vue over time and was
// missing several fields that only ever got added to the real component -
// Background Music (upload/YouTube link), Guest Name Style picker, and Guest
// Name Animation - so they silently never showed up here in the admin view.
// Delegating to the shared component fixes that gap and prevents it from
// recurring the next time a field is added.
definePageMeta({ layout: 'admin-wedding', middleware: 'superadmin' })

const route = useRoute()
const weddingId = computed(() => route.params.id as string)
</script>
