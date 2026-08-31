/**
 * Client helper for the /api/translate assist. Used by admin language editors
 * to auto-fill a field (or a whole preset) from Google/Papago.
 */
export function useTranslation() {
  async function translate(text: string, targetLang: string, provider?: 'google' | 'papago'): Promise<string> {
    const result = await $fetch<{ translatedText: string }>('/api/translate', {
      method: 'POST',
      body: { text, targetLang, provider }
    })
    return result.translatedText
  }

  return { translate }
}
