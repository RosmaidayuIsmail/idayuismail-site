/**
 * A single, page-independent background-music player shared across an
 * entire wedding site visit (Opening -> Details -> RSVP).
 *
 * The actual <audio>/YouTube player lives here, at module scope, completely
 * outside any single component's lifecycle, so it keeps running as the
 * guest moves between pages instead of being destroyed and recreated on
 * every navigation. MusicToggle.vue (mounted fresh on every page) is just a
 * thin remote control.
 *
 * Setup ("prepare") is deliberately separate from actually starting
 * playback ("start"). preparePlayer() creates the underlying <audio>/YouTube
 * player and tells the browser to start buffering it as early as possible -
 * as soon as the wedding data loads, while the guest is still looking at
 * the closed envelope - without making any sound. The one-tap-late "lag"
 * guests were hearing was the player being created AND started at the same
 * instant the envelope was tapped, so the very first thing that happened
 * was kicking off a fresh network fetch. Priming it ahead of time means
 * that by the time the guest actually taps, there's little to nothing left
 * to wait for.
 *
 * This state is intentionally module-level (not inside the exported
 * function) so every component that calls useBackgroundMusic() shares the
 * exact same player and `playing` state for the lifetime of the browser
 * tab - a full page reload naturally resets it, which is correct (the
 * guest would see the envelope intro again from scratch anyway).
 */

const currentSrc = ref<string | null>(null)
const playing = ref(false)

let audio: HTMLAudioElement | null = null
let ytPlayer: any = null
let ytContainer: HTMLDivElement | null = null
let ytReady = false
let pendingAutoplay = false
// Whether the guest has explicitly hit pause/mute on the current track -
// the ONE thing that should ever stop a later autoplay="true" MusicToggle
// (Details page, RSVP page, or re-tapping the envelope after navigating
// back to it) from re-triggering playback. This used to be a one-shot
// "already attempted" flag instead, which is wrong: it correctly stopped a
// second page's autoplay from overriding a manual pause, but it also
// permanently blocked every later LEGITIMATE autoplay - most visibly, a
// guest who navigates away from the opened envelope and back (e.g. browser
// back button) gets a fresh "Tap to open" and taps it again, which is a
// perfectly good user gesture to start the music, but the one-shot flag
// had already been spent on the very first open and silently ate every tap
// after that. Gating on "did the guest ask for silence" instead of "has
// this been tried before" fixes that without reopening the original
// override-a-manual-pause problem.
let manuallyPaused = false
// Whether the music SHOULD currently be playing, as far as the guest's own
// choices are concerned (they haven't paused it) - independent of whether
// it's actually audible right now. See bindResumeListeners() below for why
// this exists separately from `playing`.
let shouldPlay = false
let resumeListenersBound = false

/**
 * Re-attempts playback whenever this tab/page becomes visible or active
 * again, as long as the guest hasn't paused the music themselves.
 *
 * Why this is needed: a guest who opens the link, taps the envelope (music
 * starts, `opened` becomes true), then backgrounds the browser - switching
 * apps, locking their phone, or dismissing an in-app browser sheet from
 * WhatsApp/Instagram - and later comes back to that same tab does NOT get a
 * fresh page load. Mobile browsers routinely auto-pause `<audio>`/embedded
 * video when a tab goes to the background, and do not resume it on their
 * own; some also restore the page from a frozen bfcache snapshot instead of
 * re-running the page's scripts. Either way, `opened` is already `true` on
 * return, so there's no fresh tap for ensurePlaying()'s gesture-gated start
 * to hook into - the track just stays silently paused forever after that
 * first backgrounding. This is exactly the "works the first time, not on
 * reopen" behavior reported. These listeners are the only remaining chance
 * to get the music going again on a guest's return, so every path that
 * marks something as playing calls bindResumeListeners() once.
 */
function bindResumeListeners() {
  if (resumeListenersBound || !import.meta.client) return
  resumeListenersBound = true

  const tryResume = () => {
    if (!shouldPlay || playing.value) return
    if (document.visibilityState !== 'visible') return
    startPlayback()
  }

  document.addEventListener('visibilitychange', tryResume)
  window.addEventListener('pageshow', tryResume)
  window.addEventListener('focus', tryResume)

  // Extra safety net for the very first autoplay attempt, specifically the
  // YouTube-link case: playVideo() there is a postMessage call into a
  // cross-origin iframe, not a direct HTMLMediaElement.play(), and it only
  // actually plays if the YouTube IFrame API finished loading in time -
  // which happens INSIDE the tap's user-activation window on a warm/cached
  // load, but can land after that window has expired on a cold one (slow
  // network on the very first visit). When that happens the deferred
  // playVideo() call is silently ignored and nothing ever retries it, which
  // is exactly the "doesn't autoplay the first time, works after a refresh"
  // report - a refresh just means the IFrame API script is now cached and
  // loads fast enough to land inside the window. Any further tap/scroll
  // anywhere on the page after that IS a fresh, genuine user gesture, so
  // retrying playback on it picks the music back up without needing a
  // reload. Capture phase so it fires even if the tapped element stops
  // propagation.
  document.addEventListener('click', tryResume, { capture: true })
  document.addEventListener('touchend', tryResume, { capture: true })
}

function teardownPlayer() {
  audio?.pause()
  audio = null
  ytPlayer?.destroy?.()
  ytPlayer = null
  ytContainer?.remove()
  ytContainer = null
  ytReady = false
  pendingAutoplay = false
  manuallyPaused = false
  shouldPlay = false
  playing.value = false
}

function prepareAudioElement(src: string) {
  audio = new Audio()
  audio.loop = true
  audio.volume = 0.35
  // Hints the browser to fetch/buffer the whole file ahead of time rather
  // than waiting for play() to be called.
  audio.preload = 'auto'
  audio.addEventListener('play', () => (playing.value = true))
  audio.addEventListener('pause', () => (playing.value = false))
  audio.src = src
  audio.load()
}

async function prepareYoutubePlayer(src: string, videoId: string) {
  await loadYoutubeIframeApi()
  if (!import.meta.client || !window.YT?.Player) return
  // Another prepare/teardown may have superseded this one while awaiting the API.
  if (currentSrc.value !== src) return

  // Hidden off-screen player - only the audio is meant to reach guests,
  // the video track itself is never shown.
  ytContainer = document.createElement('div')
  ytContainer.style.position = 'fixed'
  ytContainer.style.width = '1px'
  ytContainer.style.height = '1px'
  ytContainer.style.opacity = '0'
  ytContainer.style.pointerEvents = 'none'
  document.body.appendChild(ytContainer)

  ytPlayer = new window.YT.Player(ytContainer, {
    videoId,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      // "loop" only actually loops when paired with a playlist containing
      // just this one video - a known YouTube IFrame API quirk.
      loop: 1,
      playlist: videoId,
      playsinline: 1
    },
    events: {
      onReady: (event: any) => {
        ytReady = true
        event.target.setVolume(35)
        // Buffers the video without playing it, so playVideo() later has
        // as little left to load as possible.
        event.target.cueVideoById(videoId)
        if (pendingAutoplay) {
          pendingAutoplay = false
          event.target.playVideo()
        }
      },
      onStateChange: (event: any) => {
        // YT.PlayerState: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
        if (event.data === 1) playing.value = true
        else if (event.data === 2 || event.data === 0) playing.value = false
        if (event.data === 0) {
          // Fallback in case a browser doesn't honor the loop/playlist trick above.
          event.target.seekTo(0)
          event.target.playVideo()
        }
      },
      onError: () => {
        // e.g. the video's owner has disabled embedding elsewhere, or it's
        // private/deleted - fail silently, same as a broken direct audio URL.
        playing.value = false
      }
    }
  })
}

/**
 * Sets up (but does not start) the player for `src`, ahead of time. Call
 * this as soon as the track is known - e.g. the moment the wedding data
 * loads, before the guest has even tapped the envelope - so the browser has
 * a head start buffering it. A no-op if already prepared for this exact src.
 */
function preparePlayer(src: string | undefined | null) {
  if (!import.meta.client) return
  const next = src || null
  if (next === currentSrc.value && (audio || ytPlayer)) return

  teardownPlayer()
  currentSrc.value = next
  if (!next) return

  const videoId = extractYoutubeVideoId(next)
  if (videoId) prepareYoutubePlayer(next, videoId)
  else prepareAudioElement(next)
}

function startPlayback() {
  bindResumeListeners()
  shouldPlay = true
  if (extractYoutubeVideoId(currentSrc.value)) {
    if (ytReady && ytPlayer) ytPlayer.playVideo()
    else pendingAutoplay = true
    return
  }
  if (audio?.paused) {
    audio.play().catch(() => {
      // Autoplay was blocked - expected until the guest actually interacts with the page.
    })
  }
}

/**
 * Makes sure `src` is prepared, and attempts to start it if `autoplay` is
 * set - every time this is called, not just the first. MusicToggle mounting
 * fresh on the Details/RSVP pages, or the guest navigating back to the
 * Opening page and tapping the envelope open again, all call this with
 * autoplay=true; startPlayback() itself is a safe no-op whenever the track
 * is already playing, so repeat calls never restart or glitch it. The only
 * thing that should stop an autoplay attempt from going through is the
 * guest having explicitly paused it (`manuallyPaused`) - reset whenever a
 * new track loads, since that's a fresh choice to make.
 */
function ensurePlaying(src: string | undefined | null, autoplay = false) {
  const isNewTrack = (src || null) !== currentSrc.value
  preparePlayer(src)
  if (isNewTrack) manuallyPaused = false
  if (autoplay && !manuallyPaused) {
    startPlayback()
  }
}

function toggle() {
  if (ytPlayer) {
    if (playing.value) {
      shouldPlay = false
      manuallyPaused = true
      ytPlayer.pauseVideo()
    } else {
      manuallyPaused = false
      startPlayback()
    }
    return
  }
  if (!audio) return
  if (playing.value) {
    shouldPlay = false
    manuallyPaused = true
    audio.pause()
  } else {
    manuallyPaused = false
    startPlayback()
  }
}

export function useBackgroundMusic() {
  return { playing, preparePlayer, ensurePlaying, toggle }
}
