/**
 * Lets a couple use a YouTube or YouTube Music link (e.g. one they copy
 * straight out of the app - no downloading) as their invitation's background
 * music, by playing it through YouTube's own official embedded player
 * instead of trying to extract/rehost the audio file, which YouTube doesn't
 * allow and we don't do. MusicToggle.vue uses this to detect a YouTube link
 * and switch from a plain <audio> element to a hidden YouTube iframe player.
 */

declare global {
  interface Window {
    YT?: any
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiPromise: Promise<void> | null = null

// Loads the YouTube IFrame Player API script exactly once per page load,
// even if called from several MusicToggle instances at once, and resolves
// once window.YT.Player is actually usable.
export function loadYoutubeIframeApi(): Promise<void> {
  if (!import.meta.client) return Promise.resolve()
  if (window.YT && window.YT.Player) return Promise.resolve()
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve) => {
    const previousReady = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.()
      resolve()
    }
    // Script may already be on the page (a previous instance started
    // loading it) - don't add it twice.
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }
  })
  return apiPromise
}

const YOUTUBE_HOSTS = new Set(['youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com'])

// Recognizes youtube.com, youtu.be, m.youtube.com and music.youtube.com
// links - watch/shorts/embed URL shapes, with or without extra tracking
// params (e.g. "&si=..." from a shared link) - and pulls out the video ID.
// Returns null for anything else, so callers can fall back to treating the
// value as a normal direct audio file URL.
export function extractYoutubeVideoId(url: string | undefined | null): string | null {
  if (!url) return null
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  const host = parsed.hostname.replace(/^www\./, '')

  if (host === 'youtu.be') {
    return parsed.pathname.slice(1).split('/')[0] || null
  }
  if (YOUTUBE_HOSTS.has(host)) {
    if (parsed.pathname === '/watch') return parsed.searchParams.get('v')
    if (parsed.pathname.startsWith('/embed/')) return parsed.pathname.split('/embed/')[1]?.split('/')[0] || null
    if (parsed.pathname.startsWith('/shorts/')) return parsed.pathname.split('/shorts/')[1]?.split('/')[0] || null
  }
  return null
}
