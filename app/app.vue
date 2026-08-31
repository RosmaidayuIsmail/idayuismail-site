<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup>
// Force Nuxt UI into Dark Mode so all inputs, dropdowns, and calendars
// perfectly match the premium dark background. Also sets the custom favicon.
useHead({
  htmlAttrs: {
    class: 'dark'
  },
  link: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💍</text></svg>'
    }
  ]
})
</script>