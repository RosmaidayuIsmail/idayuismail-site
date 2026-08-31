<template>
  <div v-if="code.enabled && (code.html.trim() || code.css.trim())" class="custom-code-block">
    <iframe
      ref="frame"
      :srcdoc="srcdoc"
      sandbox="allow-scripts allow-popups"
      referrerpolicy="no-referrer"
      loading="lazy"
      title="Custom content"
      class="custom-code-frame"
      :style="{ height: frameHeight + 'px' }"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * Renders whatever admin has pasted into Platform Admin > Custom Code.
 *
 * SAFETY: the iframe below is sandboxed with `allow-scripts` but explicitly
 * WITHOUT `allow-same-origin`. That combination forces the browser to treat
 * the iframe's content as coming from a unique, opaque origin - separate
 * from this site's real origin. Concretely, any JS admin pastes here:
 *  - cannot read this site's cookies, localStorage, or Firebase auth session
 *  - cannot call this site's Firestore/API with a visitor's credentials
 *  - cannot reach into the parent page's DOM (can't deface the rest of the
 *    card, steal form input, or redirect the parent page's URL)
 * It CAN still render markup, run CSS animations, and fetch its own public
 * resources - full creative freedom, with the blast radius of a bad or
 * malicious paste contained to the sandboxed box itself.
 */
const { customCode } = useThemes()
const code = computed(() => customCode.value)

const frame = ref<HTMLIFrameElement | null>(null)
const frameHeight = ref(80)

const srcdoc = computed(() => `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; background: transparent; color: inherit; font-family: system-ui, sans-serif; }
  * { box-sizing: border-box; }
  ${code.value.css}
</style>
</head>
<body>
${code.value.html}
<script>
  function reportHeight() {
    var h = document.documentElement.scrollHeight;
    parent.postMessage({ __customCodeHeight: h }, '*');
  }
  window.addEventListener('load', reportHeight);
  window.addEventListener('resize', reportHeight);
  if (window.ResizeObserver) {
    new ResizeObserver(reportHeight).observe(document.body);
  }
  setTimeout(reportHeight, 50);
  setTimeout(reportHeight, 400);
<\/script>
</body>
</html>`)

function onMessage(event: MessageEvent) {
  if (!frame.value || event.source !== frame.value.contentWindow) return
  const data = event.data as { __customCodeHeight?: number } | undefined
  if (data && typeof data.__customCodeHeight === 'number' && data.__customCodeHeight > 0) {
    frameHeight.value = Math.min(Math.max(data.__customCodeHeight, 40), 4000)
  }
}

onMounted(() => { if (import.meta.client) window.addEventListener('message', onMessage) })
onBeforeUnmount(() => { if (import.meta.client) window.removeEventListener('message', onMessage) })
</script>

<style scoped>
.custom-code-block {
  width: 100%;
  position: relative;
  z-index: 15;
}
.custom-code-frame {
  width: 100%;
  border: 0;
  display: block;
  transition: height 0.2s ease;
}
</style>
