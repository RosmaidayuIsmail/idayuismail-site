<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup>
// Dark mode is preference-driven now (Nuxt UI color-mode): the hub and
// Home Studio default to light with a toggle, wedding-platform routes
// force 'dark' via app/plugins/route-color-mode.ts.
//
// Favicon used to be overridden here (the wedding ring, previously the
// site-wide default) - removed now that nuxt.config.ts's app.head.link is
// the single source of truth for the favicon (the actual logo). This
// useHead() call ran on every page with the same 'favicon' key as the one
// nuxt.config.ts declares, so depending on render order the browser could
// end up seeing either tag - that's what made the favicon look "stuck" on
// the old ring even after nuxt.config.ts was updated to the new logo.
</script>