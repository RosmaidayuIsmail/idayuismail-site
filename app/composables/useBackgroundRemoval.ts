/**
 * Client-side background removal via @imgly/background-removal.
 *
 * IMPORTANT LICENSING NOTE: this library is AGPL-licensed. For a commercial
 * product, AGPL can require you to open-source your own service's code
 * unless you purchase a commercial license from IMG.LY. This is a real
 * business decision, not just a technical one - see
 * https://img.ly/background-removal for licensing options before shipping
 * this to production.
 *
 * The model/WASM files are fetched from IMG.LY's CDN the first time it
 * runs (a few MB), then cached by the browser. Dynamically imported so it
 * never loads on pages that don't use it, and never touches the SSR bundle.
 */
export function useBackgroundRemoval() {
    const processing = ref(false)
    const error = ref<string | null>(null)
  
    async function removeBackground(source: Blob | string): Promise<Blob> {
      if (!import.meta.client) {
        throw new Error('Background removal only runs in the browser')
      }
  
      processing.value = true
      error.value = null
      try {
        const mod = await import('@imgly/background-removal')
        const imglyRemoveBackground = mod.default
        const resultBlob = await imglyRemoveBackground(source)
        return resultBlob
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Background removal failed'
        throw err
      } finally {
        processing.value = false
      }
    }
  
    return { removeBackground, processing, error }
  }