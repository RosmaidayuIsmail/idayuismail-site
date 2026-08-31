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
// force 'dark' via app/plugins/route-color-mode.ts. Favicon stays the
// wedding ring globally; the hub overrides it with its own.
useHead({
  link: [
    {
      key: 'favicon',
      rel: 'icon',
      type: 'image/svg+xml',
      href: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💍</text></svg>'
    }
  ]
})
</script>