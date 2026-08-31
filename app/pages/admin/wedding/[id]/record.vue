<template>
  <div class="h-full min-h-screen lg:h-[calc(100vh-6rem)] flex flex-col overflow-x-hidden">

    <div v-if="loading" class="flex-1 flex items-center">
      <PageSkeleton variant="page" />
    </div>

    <div v-else-if="!wedding" class="flex flex-col items-center justify-center flex-1 text-white/60 space-y-6">
      <div class="p-6 rounded-full bg-white/5 ring-1 ring-white/10 mb-2">
        <UIcon name="i-heroicons-video-camera" class="w-12 h-12" style="color: rgba(227, 176, 74, 0.5);" />
      </div>
      <p class="text-lg">Couldn't find that wedding.</p>
    </div>

    <div v-else class="flex-1 min-h-0 flex flex-col mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-4">
      <!-- Header -->
      <div class="mb-6 shrink-0 pt-4 lg:pt-0">
        <h1 class="text-3xl sm:text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-100 via-gold-300 to-gold-500 tracking-tight">
          Promo Video
        </h1>
        <p class="text-sm text-white/50 mt-1 flex items-center gap-2">
          <UIcon name="i-heroicons-video-camera" class="w-4 h-4" style="color: #e3b04a;" />
          Record the real, live mobile invite as an HD MP4 you can use for marketing.
        </p>
      </div>

      <div class="flex-1 flex flex-col lg:flex-row gap-8 xl:gap-12 lg:min-h-0">

        <!-- Left Column: Controls -->
        <div class="flex-1 w-full lg:min-w-[360px] lg:overflow-y-auto custom-scrollbar lg:pr-6 pb-8 lg:pb-20 space-y-6 order-2 lg:order-1">

          <div class="space-y-6 form-panel animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div>
              <h3 class="text-sm font-semibold text-white mb-3">What to record</h3>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  class="p-3 rounded-lg border text-sm font-medium transition-colors"
                  :class="previewMode === 'classic' ? 'border-gold-400 bg-gold-400/10 text-gold-200' : 'border-gray-700 text-gray-300 hover:border-gray-600'"
                  :disabled="recordingState !== 'idle'"
                  @click="previewMode = 'classic'"
                >
                  Classic Invite
                </button>
              </div>
            </div>

            <UFormField label="Guest name shown in the preview">
              <UInput v-model="previewGuestName" placeholder="e.g. Ahmad &amp; Family" size="lg" class="w-full" :disabled="recordingState !== 'idle'" />
              <template #help><span class="text-xs text-gray-500">This is just for the recording - it doesn't send or affect any real guest.</span></template>
            </UFormField>

            <UButton variant="soft" color="gray" size="sm" icon="i-heroicons-arrow-path" :disabled="recordingState !== 'idle'" @click="reloadPreview">
              Reset preview
            </UButton>

            <div class="pt-6 border-t border-gray-800 space-y-4">
              <h3 class="text-sm font-semibold text-white">Record</h3>

              <div v-if="recordingState === 'idle'" class="space-y-3">
                <p class="text-xs text-gray-400 leading-relaxed">
                  Click Start and a small new window will pop up, briefly showing "Preparing recording..." - that's expected, it's reserving a blank tab to share before the invite loads, so nothing on the actual page plays before recording begins. When your browser asks what to share, click the <strong class="text-gray-200">Chrome Tab</strong> tab at the top of that picker (not "Window" or "Entire Screen"), select that new tab (it may still say "Preparing recording..." in the list), and turn on <strong class="text-gray-200">Share tab audio</strong> if you want the invite's music in the recording - this has to be turned back on every single time you record, the browser never remembers it from a previous take. The real invite then loads in and plays from the very start, including its opening animation. Interact with it exactly like a guest would - tap to open the envelope, scroll through it - then come back here and click Stop. If you're moving between multiple pages (Details, RSVP), try to stay on one page for the whole take where possible - some browsers can silently end sharing mid-recording when the shared tab navigates.
                </p>
                <UButton size="lg" color="primary" icon="i-heroicons-video-camera" class="w-full font-semibold" @click="startRecording">
                  Start Recording
                </UButton>
              </div>

              <div v-else-if="recordingState === 'requesting'" class="flex items-center gap-3 text-sm text-gray-400">
                <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" /> Waiting for you to choose what to share...
              </div>

              <div v-else-if="recordingState === 'recording'" class="space-y-3">
                <div class="flex items-center gap-2 text-sm font-medium text-red-400">
                  <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                  Recording - {{ formattedElapsed }}
                </div>
                <UButton size="lg" color="error" variant="soft" icon="i-heroicons-stop" class="w-full font-semibold" @click="stopRecording">
                  Stop Recording
                </UButton>
              </div>

              <div v-else-if="recordingState === 'converting'" class="space-y-3">
                <div class="flex items-center gap-2 text-sm text-gray-300">
                  <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" /> {{ conversionLabel }}
                </div>
                <div class="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                  <div class="h-full bg-gold-400 transition-all duration-300" :style="{ width: `${Math.round(conversionProgress * 100)}%` }"></div>
                </div>
              </div>

              <div v-else-if="recordingState === 'ready'" class="space-y-4">
                <div class="flex items-center gap-2 text-sm font-medium text-emerald-400">
                  <UIcon name="i-heroicons-check-circle" class="w-4 h-4" /> Ready to download
                </div>
                <video v-if="downloadUrl" :src="downloadUrl" controls class="w-full rounded-lg border border-gray-700 max-h-64" />
                <div class="flex flex-wrap gap-2">
                  <UButton size="lg" color="primary" icon="i-heroicons-arrow-down-tray" class="font-semibold" :href="downloadUrl" :download="downloadFilename" tag="a">
                    Download {{ downloadIsFallback ? 'WebM' : 'MP4' }}
                  </UButton>
                  <UButton size="lg" variant="soft" color="gray" icon="i-heroicons-video-camera" @click="resetToIdle">
                    Record Again
                  </UButton>
                </div>
              </div>

              <p v-if="errorMessage" class="text-xs" :class="recordingState === 'ready' ? 'text-amber-400' : 'text-red-400'">{{ errorMessage }}</p>
            </div>
          </div>
        </div>

        <!-- Right Column: Live Mobile Preview (the real guest-facing page) -->
        <div class="w-full lg:w-[560px] shrink-0 flex flex-col items-center pb-8 lg:pb-0 overflow-y-auto hide-scrollbar order-1 lg:order-2">
          <div class="flex items-center justify-between w-full mb-4 px-2">
            <p class="text-xs font-semibold uppercase tracking-widest text-gold-200/70 flex items-center gap-2">
              <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4" /> Live Preview
            </p>
          </div>

          <!-- Smartphone Mockup Wrapper - matches the exact same bezel
               proportions as the Opening Design page's Live Preview (fixed
               height, capped width - not aspect-ratio-derived), so this
               looks identical rather than a differently-shaped phone. The
               recording itself crops to the iframe (frameEl below), not
               this outer bezel, so the dark border/notch decoration never
               ends up in the recorded video either way - the output video
               is scaled to a fixed 1080-wide HD target regardless of how
               big this renders on her screen (see OUTPUT_WIDTH below), so
               recording quality doesn't depend on this preview's size. -->
          <div class="phone-bezel w-full max-w-[390px] shadow-2xl shrink-0">
            <div class="phone-notch"></div>
            <iframe
              ref="frameEl"
              :key="previewReloadKey"
              :src="previewUrl"
              class="phone-screen"
              title="Live guest preview"
              @load="previewLoaded = true"
            ></iframe>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin-wedding', middleware: 'superadmin' })

const route = useRoute()
const weddingId = computed(() => route.params.id as string)
const { wedding, loading } = useMyWedding(weddingId)

const previewMode = ref<'classic'>('classic')
const previewGuestName = ref('Ahmad & Family')
const previewReloadKey = ref(0)
const frameEl = ref<HTMLIFrameElement | null>(null)
const previewLoaded = ref(false)

// preview=1 tells the real guest-facing pages (rsvp.vue in particular)
// that this load is a marketing recording, not an actual guest visit - see
// its submitForm(): without this flag, finishing the RSVP flow inside this
// iframe to demo the "thank you" screen for the video would silently write
// a real guest row (name = whatever was typed above, e.g. a caption like
// "Congratulations! Herry & Arissa") into the couple's live guest list.
const previewUrl = computed(() => {
  if (!wedding.value) return 'about:blank'
  const base = `/w/${wedding.value.slug}`
  const name = previewGuestName.value.trim()
  const params = new URLSearchParams({ preview: '1' })
  if (name) params.set('to', name)
  return `${base}?${params.toString()}`
})

function reloadPreview() {
  previewLoaded.value = false
  previewReloadKey.value++
}

// --- Recording -------------------------------------------------------
// One-click screen-recording of the phone preview above, entirely in the
// browser: capture "this tab" via getDisplayMedia, redraw just the phone
// frame's region onto an offscreen canvas every frame (so the output is
// cropped to exactly the phone, not the whole dashboard), record that
// canvas with MediaRecorder, then transcode the result from WebM to MP4
// with ffmpeg.wasm (loaded from a CDN at record time - not a build
// dependency) so the download works natively on phones and social apps
// that don't like WebM.

type RecordingState = 'idle' | 'requesting' | 'recording' | 'converting' | 'ready'
const recordingState = ref<RecordingState>('idle')
const elapsedSeconds = ref(0)
const conversionProgress = ref(0)
const conversionLabel = ref('Converting to MP4...')
const errorMessage = ref('')
const downloadUrl = ref('')
const downloadFilename = ref('')
const downloadIsFallback = ref(false)

const formattedElapsed = computed(() => {
  const m = Math.floor(elapsedSeconds.value / 60)
  const s = elapsedSeconds.value % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})

let displayStream: MediaStream | null = null
let sourceVideo: HTMLVideoElement | null = null
let outputCanvas: HTMLCanvasElement | null = null
let recorder: MediaRecorder | null = null
let recordedChunks: Blob[] = []
let recordedMimeType = ''
let rafId = 0
let rvfcId = 0
let timerInterval: ReturnType<typeof setInterval> | null = null
let recordingPopup: Window | null = null
let endedEarly = false

// This deployment sends a Cross-Origin-Opener-Policy header that blocks
// even same-origin window.close()/`.closed` calls between the admin tab
// and the popup ("Cross-Origin-Opener-Policy policy would block the
// window.closed call.", confirmed in the console) - every touch of the
// popup window's close/closed goes through here so that never throws
// uncaught and derails the recording flow (the popup is harmless left
// open; she can close it herself).
function safeClosePopup(win: Window | null) {
  try {
    win?.close()
  } catch {
    // COOP blocked it - nothing more to do.
  }
}

function resetToIdle() {
  if (downloadUrl.value) URL.revokeObjectURL(downloadUrl.value)
  downloadUrl.value = ''
  downloadFilename.value = ''
  downloadIsFallback.value = false
  errorMessage.value = ''
  conversionProgress.value = 0
  recordingState.value = 'idle'
  reloadPreview()
}

async function startRecording() {
  errorMessage.value = ''
  endedEarly = false
  recordingState.value = 'requesting'

  // Kick off loading the video encoder now, in the background, instead of
  // only after Stop is clicked - it has to fetch a real encoder
  // (~25-30MB) from a CDN the first time, which is what "Loading video
  // encoder..." was waiting on after every single recording. Starting it
  // here lets that download happen while she's recording (which usually
  // takes longer than the download itself), so by the time she clicks
  // Stop, it's typically already loaded and that step is instant. It's
  // cached after the first successful load, so this is a no-op on every
  // recording after the first.
  getFfmpeg().catch(() => {
    // If it fails to preload, convertWebmToMp4 will just try again (and
    // surface the real error then) after Stop - nothing to do here.
  })

  // Previous approach: share this whole admin tab, then mathematically
  // crop out just the phone region (by element bounds, or a browser-level
  // CropTarget). That crop math depended on assumptions - which surface
  // got shared, whether the browser reports displaySurface at all, tab
  // coordinates matching viewport coordinates - that didn't hold on every
  // browser/OS, and kept recording the wrong region no matter what was
  // shared. New approach: open a separate, minimal popup window that
  // contains nothing but the live guest page - no dashboard, no sidebar,
  // no controls around it. Sharing THAT window is the mobile screen; there
  // is nothing else in it to crop out, so no crop math is needed at all.
  //
  // It deliberately does NOT open straight to previewUrl. The opening
  // screen's cover animations (e.g. the guest-name "unroll") play once,
  // automatically, the moment that page loads - and getDisplayMedia can't
  // even be requested until she's picked what to share in the browser's
  // own dialog, which takes a few seconds. Loading the real invite first
  // and only then asking what to share meant those animations had already
  // finished, off camera, before a single frame was ever captured. Instead,
  // the popup opens on a blank placeholder (so there's still something
  // for the share picker to show and pick), and the real invite is only
  // loaded into it once the recorder is actually running below - so
  // everything that happens on page load, including the cover animation,
  // happens on camera from frame one.
  const popup = window.open(
    '',
    'wc_promo_recording',
    'width=440,height=956,menubar=no,toolbar=no,location=no,status=no,scrollbars=no,resizable=yes'
  )
  if (!popup) {
    recordingState.value = 'idle'
    errorMessage.value = "Your browser blocked the recording window from opening - allow pop-ups for this site and click Start Recording again."
    return
  }
  recordingPopup = popup
  try {
    popup.document.title = 'Preparing recording...'
    popup.document.body.style.cssText = 'margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#04101f;color:rgba(255,255,255,0.5);font:14px system-ui,sans-serif;'
    popup.document.body.textContent = 'Preparing recording...'
  } catch {
    // Not essential - if this fails for some reason, the picker just shows
    // a blank window instead of this placeholder text.
  }

  // Give the popup a moment to actually paint and register as a real,
  // shareable window before the share picker opens.
  await new Promise((resolve) => setTimeout(resolve, 300))

  try {
    // audio: true asks for the shared window/tab's own sound (e.g.
    // background music on the invite) to be captured along with the video.
    // Whether the browser actually offers/grants it depends on the OS and
    // which surface she shares - if it isn't available, recording still
    // proceeds silently rather than failing the take.
    displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: { width: { ideal: 2560 }, height: { ideal: 1440 }, frameRate: { ideal: 30 } },
      audio: true
    })
  } catch (err: any) {
    safeClosePopup(popup)
    recordingPopup = null
    recordingState.value = 'idle'
    errorMessage.value = err?.name === 'NotAllowedError'
      ? "Recording wasn't started - you closed the share dialog or denied permission. Click Start Recording to try again."
      : `Couldn't start recording: ${err?.message || err}`
    return
  }

  sourceVideo = document.createElement('video')
  sourceVideo.muted = true
  sourceVideo.srcObject = displayStream
  await sourceVideo.play()
  if (sourceVideo.readyState < 2) {
    await new Promise<void>((resolve) => { sourceVideo!.onloadedmetadata = () => resolve() })
  }

  // Sharing the Chrome Tab (now what the instructions ask for, since only
  // tab sharing reliably offers audio) never includes the address bar to
  // begin with - Chrome's tab capture is exactly the page content. The
  // chrome-trim below only applies to a Window/Screen share, where some
  // browsers (Safari especially) ignore the location=no/toolbar=no hints
  // and leave a thin address-bar strip baked into the capture. Trimming it
  // unconditionally would instead cut real content off a tab share, so
  // check which surface actually got shared first.
  const sharedTrack = displayStream.getVideoTracks()[0]
  const sharedSettings = sharedTrack.getSettings() as MediaTrackSettings & { displaySurface?: string }
  const isTabShare = sharedSettings.displaySurface === 'browser'

  let crop = { x: 0, y: 0, w: sourceVideo.videoWidth, h: sourceVideo.videoHeight }
  try {
    if (!isTabShare && !popup.closed) {
      const chromeHeightCss = Math.max(0, popup.outerHeight - popup.innerHeight)
      if (chromeHeightCss > 0) {
        const scaleY = sourceVideo.videoHeight / popup.outerHeight
        const chromeHeightPx = Math.round(chromeHeightCss * scaleY)
        crop = {
          x: 0,
          y: chromeHeightPx,
          w: sourceVideo.videoWidth,
          h: Math.max(2, sourceVideo.videoHeight - chromeHeightPx)
        }
      }
    }
  } catch {
    // If the popup's window metrics aren't readable for some reason, fall
    // back to recording the frame whole rather than failing the take.
  }

  // Export at the phone's own native aspect ratio, edge-to-edge - no
  // padding, no bars, no blurred backdrop. (A fixed 1080-wide export with
  // blurred fill was tried to match standard 9:16 Canva/Instagram/TikTok
  // placeholders, but on non-9:16 pages like the VIP/story layout it showed
  // up as visible blurred bands above and below the real content instead of
  // looking intentional - so this always renders exactly what's on screen,
  // full-bleed, at whatever shape the recorded page actually is.)
  const OUTPUT_WIDTH = 1080
  const outputHeight = Math.max(2, Math.round(OUTPUT_WIDTH * (crop.h / crop.w)))

  outputCanvas = document.createElement('canvas')
  outputCanvas.width = OUTPUT_WIDTH
  outputCanvas.height = outputHeight
  const ctx = outputCanvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // Drawing the canvas via requestAnimationFrame is what made the video go
  // blank while the audio kept going the moment she clicked into the
  // popup (e.g. to hit RSVP) - rAF on THIS tab (where this script runs,
  // not the popup) is paused by the browser entirely whenever this tab
  // isn't the visible/focused one, which stops the canvas from ever being
  // redrawn again until she clicks back to it. The audio track has no such
  // dependency, which is exactly why it kept playing while the picture
  // froze/blanked. sourceVideo.requestVideoFrameCallback() is tied to the
  // video element actually decoding frames, not to this tab's visibility,
  // so it keeps the canvas updating no matter which window has focus.
  const supportsVfc = typeof (sourceVideo as any).requestVideoFrameCallback === 'function'
  const drawFrame = () => {
    if (sourceVideo) {
      ctx.drawImage(sourceVideo, crop.x, crop.y, crop.w, crop.h, 0, 0, OUTPUT_WIDTH, outputHeight)
    }
    if (supportsVfc) {
      rvfcId = (sourceVideo as any).requestVideoFrameCallback(drawFrame)
    } else {
      rafId = requestAnimationFrame(drawFrame)
    }
  }
  drawFrame()

  const canvasStream = outputCanvas.captureStream(30)
  // The canvas only ever carries video (drawImage doesn't touch audio), so
  // graft the shared window's own audio track onto it, when one came
  // through, into a single stream to actually record from.
  const audioTracks = displayStream.getAudioTracks()
  const recordingStream = new MediaStream([...canvasStream.getVideoTracks(), ...audioTracks])
  const hasAudio = audioTracks.length > 0

  // Capture H.264 directly when the browser supports it (still a webm
  // container) so the MP4 step below can be a lossless remux instead of a
  // second lossy re-encode stacked on top of VP9 - that double-compression
  // was the other half of "HD on the Mac, awful after upload": every
  // re-encode throws away more detail before the destination platform even
  // gets to do its own compression.
  const mimeCandidates = hasAudio
    ? ['video/webm;codecs=h264,opus', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=h264', 'video/webm;codecs=vp9', 'video/webm']
    : ['video/webm;codecs=h264', 'video/webm;codecs=vp9', 'video/webm']
  const mimeType = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) || 'video/webm'
  recordedMimeType = mimeType
  recordedChunks = []
  // Higher than before (was 14 Mbps) - a richer intermediate before the
  // ffmpeg pass above still has more real detail to work with on flat,
  // dark backgrounds instead of already having lost it to the live
  // capture encoder.
  recorder = new MediaRecorder(recordingStream, { mimeType, videoBitsPerSecond: 22_000_000 })
  recorder.ondataavailable = (e) => { if (e.data.size) recordedChunks.push(e.data) }
  recorder.onstop = handleRecordingStopped

  // Load the real invite into the popup right as the recorder starts, not
  // before - navigating first and starting the recorder second would just
  // move the same "already played the animation" problem a few hundred
  // milliseconds later once the page finishes loading. Starting the
  // recorder first (it's already drawing/capturing the blank placeholder
  // above) and triggering the navigation in the same breath means the very
  // first real frames captured are the invite loading in, so the cover
  // animation plays entirely on camera.
  try {
    if (!popup.closed) popup.location.href = previewUrl.value
  } catch {
    // If this fails for some reason, the popup just stays on the blank
    // placeholder - worth surfacing rather than silently recording nothing.
    errorMessage.value = "Couldn't load the invite into the recording window - close this take and try Start Recording again."
  }
  recorder.start()

  // Calling .stop() ourselves (the Stop button, below) does NOT fire
  // 'ended' - only the track ending on its own does: she clicked the
  // browser's native "Stop sharing" pill, OR - when sharing a Chrome Tab
  // specifically - the browser silently ended the capture because that tab
  // navigated (e.g. tapping through from the opening to Details/RSVP).
  // Either way, treat it like Stop was clicked so nothing is lost, but
  // remember it happened so the "ready" screen can explain why it cut off
  // instead of just quietly handing back a shorter clip.
  displayStream.getVideoTracks()[0].addEventListener('ended', () => {
    if (recordingState.value === 'recording') {
      endedEarly = true
      stopRecording()
    }
  })

  recordingState.value = 'recording'
  elapsedSeconds.value = 0
  timerInterval = setInterval(() => { elapsedSeconds.value++ }, 1000)
}

function stopRecording() {
  if (recordingState.value !== 'recording') return
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
  cancelAnimationFrame(rafId)
  if (rvfcId && sourceVideo && 'cancelVideoFrameCallback' in sourceVideo) {
    (sourceVideo as any).cancelVideoFrameCallback(rvfcId)
  }
  displayStream?.getTracks().forEach((t) => t.stop())
  safeClosePopup(recordingPopup)
  recordingPopup = null
  recordingState.value = 'converting'
  conversionLabel.value = 'Finishing recording...'
  conversionProgress.value = 0
  recorder?.stop()
}

async function handleRecordingStopped() {
  const webmBlob = new Blob(recordedChunks, { type: 'video/webm' })
  const isH264 = recordedMimeType.includes('h264')
  sourceVideo = null
  outputCanvas = null

  try {
    conversionLabel.value = 'Loading video encoder...'
    const mp4Blob = await convertWebmToMp4(webmBlob, isH264, (ratio) => {
      conversionLabel.value = isH264 ? 'Finalizing MP4...' : 'Converting to MP4...'
      conversionProgress.value = Math.min(1, Math.max(0, ratio))
    })
    downloadUrl.value = URL.createObjectURL(mp4Blob)
    downloadFilename.value = `${wedding.value?.slug || 'wedding'}-promo-${previewMode.value}.mp4`
    downloadIsFallback.value = false
  } catch (err) {
    // MP4 conversion is a nice-to-have on top of a recording that already
    // succeeded - if it fails for any reason (e.g. the CDN encoder
    // couldn't load), hand back the raw WebM rather than losing the take.
    // eslint-disable-next-line no-console
    console.error('MP4 conversion failed:', err)
    downloadUrl.value = URL.createObjectURL(webmBlob)
    downloadFilename.value = `${wedding.value?.slug || 'wedding'}-promo-${previewMode.value}.webm`
    downloadIsFallback.value = true
    const detail = err instanceof Error ? err.message : String(err)
    errorMessage.value = `Couldn't convert to MP4 (${detail}), so here's the recording as WebM instead - it plays in most browsers and video editors, just not natively on all phones/social apps.`
  }
  if (endedEarly) {
    // The browser ended sharing on its own mid-take, not from clicking
    // Stop - most often either the native "Stop sharing" pill got clicked
    // by accident, or (when sharing a Chrome Tab) the tab navigated to a
    // new page, which can end tab capture depending on the browser. What
    // was captured up to that point is still saved below - this just
    // explains why it may be shorter than expected instead of leaving her
    // to wonder if something broke.
    const note = "The recording stopped on its own partway through - either the browser's own \"Stop sharing\" indicator got clicked, or (if you were sharing a Chrome Tab) the tab navigated to a new page, which can end sharing mid-recording on some browsers. What was captured up to that point is below - try staying on one page for the whole take, or record shorter clips per page."
    errorMessage.value = errorMessage.value ? `${errorMessage.value} ${note}` : note
  }
  recordingState.value = 'ready'
}

// ffmpeg.wasm is loaded from a CDN at record time (not an npm dependency),
// so using this feature never requires a build/deploy step of its own -
// the single-threaded core is used deliberately since it works without the
// cross-origin-isolation headers this app doesn't set.
let ffmpegInstance: any = null
// The recording flow now calls getFfmpeg() twice - once to preload as soon
// as Start is clicked, once for real after Stop. Without caching the
// in-flight promise itself (not just the finished instance), that second
// call would see ffmpegInstance still null and kick off a whole second,
// completely separate CDN download + Worker load in parallel with the
// first - two competing loads that could contend with each other and
// never resolve, which is exactly what looked like "stuck on Loading video
// encoder... forever". Every caller now awaits the one shared load.
let ffmpegLoadPromise: Promise<any> | null = null
async function getFfmpeg() {
  if (ffmpegInstance) return ffmpegInstance
  if (!ffmpegLoadPromise) {
    // Previously this could hang forever with no feedback - e.g. if an ad
    // blocker or privacy extension silently blocks the CDN fetch (her own
    // console showed exactly that pattern - ERR_BLOCKED_BY_CLIENT - on
    // other unrelated requests on this page). A hard timeout turns a
    // silent, permanent "Loading video encoder..." into an actual error
    // that falls back to the WebM download instead of never finishing.
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timed out loading the video encoder - if you have an ad blocker or privacy extension enabled, it may be blocking the CDN this needs. Try turning it off for this site, or use an incognito window, then record again.")), 25000)
    })
    ffmpegLoadPromise = Promise.race([loadFfmpeg(), timeout]).catch((err) => {
      // A failed load shouldn't permanently wedge future attempts - clear
      // the cached promise so the next call (e.g. after Stop) tries fresh
      // instead of forever returning the same rejected promise.
      ffmpegLoadPromise = null
      throw err
    })
  }
  return ffmpegLoadPromise
}

async function loadFfmpeg() {
  const { FFmpeg } = await import(/* @vite-ignore */ 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js')
  const { toBlobURL } = await import(/* @vite-ignore */ 'https://unpkg.com/@ffmpeg/util@0.12.2/dist/esm/index.js')
  const ffmpeg = new FFmpeg()
  const coreBase = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd'
  // @ffmpeg/ffmpeg internally runs the core in a background Worker, and by
  // default points that Worker straight at its own script on unpkg - but
  // Workers (unlike normal fetches) are blocked from loading cross-origin,
  // so the browser throws "Failed to construct 'Worker': ... cannot be
  // accessed from origin ..." the moment conversion starts, which is
  // exactly what silently fell back to WebM every time. Blobbing the
  // worker script itself (classWorkerURL), the same trick already used for
  // the core/wasm files below, makes it same-origin and fixes that.
  await ffmpeg.load({
    coreURL: await toBlobURL(`${coreBase}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${coreBase}/ffmpeg-core.wasm`, 'application/wasm'),
    classWorkerURL: await toBlobURL('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/worker.js', 'text/javascript')
  })
  ffmpegInstance = ffmpeg
  return ffmpeg
}

async function convertWebmToMp4(webmBlob: Blob, isH264: boolean, onProgress: (ratio: number) => void) {
  const ffmpeg = await getFfmpeg()
  const onProgressEvent = ({ progress }: { progress: number }) => onProgress(progress)
  ffmpeg.on('progress', onProgressEvent)
  try {
    const inputData = new Uint8Array(await webmBlob.arrayBuffer())
    await ffmpeg.writeFile('input.webm', inputData)
    // Always re-encode rather than "copy" the H.264 path straight through -
    // the invite designs lean on large flat/dark, softly-gradiented
    // backgrounds (deep maroon, navy, etc.), which is exactly the content
    // real-time browser encoders (what MediaRecorder itself used live)
    // handle worst - it shows up as a faint blocky/gridded pattern in those
    // backgrounds. A proper non-realtime x264 pass at a low CRF, plus a
    // deband filter aimed at that exact artifact, cleans it up - re-encoding
    // an already-compressed H.264 source loses a little vs. a true copy,
    // but it's imperceptible at this quality level and worth it to remove
    // the visible blocking.
    await ffmpeg.exec([
      '-i', 'input.webm',
      '-vf', 'deband=1thr=0.02:2thr=0.02:3thr=0.02:4thr=0.02',
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '15',
      '-pix_fmt', 'yuv420p',
      '-profile:v', 'high',
      '-level', '4.2',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-movflags', '+faststart',
      'output.mp4'
    ])
    const data = await ffmpeg.readFile('output.mp4')
    // Pass the Uint8Array itself, not .buffer - the view's underlying
    // ArrayBuffer can be larger than the actual file (WASM memory isn't
    // tightly sized to it), so .buffer risks trailing garbage bytes in
    // the resulting MP4.
    return new Blob([data], { type: 'video/mp4' })
  } finally {
    ffmpeg.off('progress', onProgressEvent)
  }
}

onBeforeUnmount(() => {
  if (timerInterval) clearInterval(timerInterval)
  cancelAnimationFrame(rafId)
  if (rvfcId && sourceVideo && 'cancelVideoFrameCallback' in sourceVideo) {
    (sourceVideo as any).cancelVideoFrameCallback(rvfcId)
  }
  displayStream?.getTracks().forEach((t) => t.stop())
  safeClosePopup(recordingPopup)
  if (downloadUrl.value) URL.revokeObjectURL(downloadUrl.value)
})
</script>

<style scoped>
.form-panel {
  border-radius: 1.25rem;
  padding: 1.75rem;
  background: #111827;
  border: 1px solid #374151;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
}

/* Smartphone Bezel - exact same rule as the Opening Design page's Live
   Preview (fixed height, width capped by the max-w-[390px] class on the
   element, not derived from aspect-ratio). Using aspect-ratio here
   previously let the width get clamped by the column's max-width without
   the height following it back down, which is what made this bezel render
   narrower/more elongated than the Opening Design one instead of matching
   it. */
.phone-bezel {
  position: relative;
  height: 844px;
  background: #000;
  border: 12px solid #1e293b;
  border-radius: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 2px rgba(255, 255, 255, 0.05);
  overflow: hidden;
  transform: translateZ(0);
}

.phone-notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40%;
  height: 24px;
  background: #1e293b;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
  z-index: 50;
  box-shadow: inset 0 -1px 1px rgba(255, 255, 255, 0.05);
}

.phone-screen {
  width: 100%;
  height: 100%;
  border: 0;
  background: #04101f;
}

.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #374151;
  border-radius: 10px;
}
</style>
