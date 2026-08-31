<template>
  <DashboardRsvpEditorPanel />
</template>

<script setup lang="ts">
// The actual RSVP editor content lives in
// app/components/DashboardRsvpEditorPanel.vue, shared with the superadmin
// editing view at /admin/wedding/[id]/rsvp-editor.vue, so there's only
// ever one implementation.
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
</script>
