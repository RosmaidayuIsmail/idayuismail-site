<template>
  <div class="preview-card" :style="styleVars">
    <div class="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-black/60 pointer-events-none"></div>
    <CardOrnament :style="content.ornamentStyle" :color="content.ornamentColor || 'var(--theme-accent)'" class="pointer-events-none" />
    <PetalsBackground v-if="content.enablePetals !== false" :style-name="content.petalStyle" :color="content.petalColor || ''" :count="12" class="pointer-events-none" />
    <div v-if="content.coverPhotoUrl" class="preview-photo pointer-events-none" :class="{ 'preview-photo-contain': content.hideSystemText }" :style="{ backgroundImage: `url(${content.coverPhotoUrl})` }" />

    <template v-if="!content.hideSystemText">
      
      <!-- 1. Top Icon -->
      <div v-if="content.innerTopIcon && content.innerTopIcon !== 'none'"
           class="absolute flex flex-col items-center justify-center text-center w-full max-w-full px-4 z-20 select-none"
           :class="{ 'cursor-move hover:ring-2 hover:ring-gold-400 hover:bg-black/20 rounded-2xl p-2 transition-colors': editable, 'transition-transform': !isDragging.icon }"
           :style="{ left: `${content.iconX ?? 50}%`, top: `${content.iconY ?? 15}%`, transform: 'translate(-50%, -50%)' }"
           @pointerdown="onPointerDown($event, 'icon')"
      >
        <p
          v-if="content.innerTopIcon === 'bismillah'"
          class="leading-relaxed"
          dir="rtl"
          :style="{
            color: 'var(--theme-accent)',
            fontFamily: `'Amiri', 'Traditional Arabic', serif`,
            fontSize: `clamp(0.75rem, ${8 * ((content.iconSize ?? 100) / 100)}vw, ${1.1 * ((content.iconSize ?? 100) / 100)}rem)`
          }"
        >بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
        <UIcon v-else-if="content.innerTopIcon === 'rings'" name="i-heroicons-lifebuoy" :style="{ color: 'var(--theme-accent)', width: `${1.5 * ((content.iconSize ?? 100) / 100)}rem`, height: `${1.5 * ((content.iconSize ?? 100) / 100)}rem` }" />
        <UIcon v-else-if="content.innerTopIcon === 'heart'" name="i-heroicons-heart" :style="{ color: 'var(--theme-accent)', width: `${1.5 * ((content.iconSize ?? 100) / 100)}rem`, height: `${1.5 * ((content.iconSize ?? 100) / 100)}rem` }" />
        <img v-else-if="content.innerTopIcon === 'custom' && content.customIconUrl" :src="content.customIconUrl" alt="" class="object-contain drop-shadow" :style="{ width: `${6 * ((content.iconSize ?? 100) / 100)}rem`, height: 'auto', maxWidth: '90%', maxHeight: `${6 * ((content.iconSize ?? 100) / 100)}rem` }">
        <p v-if="content.iconSubtitle" class="mt-2 text-[0.6rem] text-white/60 italic">{{ content.iconSubtitle }}</p>
      </div>

      <!-- 2. Greeting -->
      <div class="absolute flex flex-col items-center justify-center text-center w-full px-4 z-20 select-none"
           :class="{ 'cursor-move hover:ring-2 hover:ring-gold-400 hover:bg-black/20 rounded-2xl p-2 transition-colors': editable, 'transition-transform': !isDragging.greeting }"
           :style="{ left: `${content.greetingX ?? 50}%`, top: `${content.greetingY ?? 25}%`, transform: 'translate(-50%, -50%)' }"
           @pointerdown="onPointerDown($event, 'greeting')"
      >
        <p class="preview-eyebrow">{{ content.innerGreeting || "You're Invited" }}</p>
      </div>

      <!-- 3. Intro -->
      <div class="absolute flex flex-col items-center justify-center text-center w-full px-4 z-20 select-none"
           :class="{ 'cursor-move hover:ring-2 hover:ring-gold-400 hover:bg-black/20 rounded-2xl p-2 transition-colors': editable, 'transition-transform': !isDragging.intro }"
           :style="{ left: `${content.introX ?? 50}%`, top: `${content.introY ?? 32}%`, transform: 'translate(-50%, -50%)' }"
           @pointerdown="onPointerDown($event, 'intro')"
      >
        <p class="preview-meta text-[0.65rem] !opacity-70 italic whitespace-nowrap">{{ content.innerIntro || "To the wedding celebration of" }}</p>
      </div>

      <!-- 4. Names (Supports Horizontal & Vertical) -->
      <div class="absolute flex flex-col items-center justify-center text-center w-full px-4 z-20 select-none"
           :class="{ 'cursor-move hover:ring-2 hover:ring-gold-400 hover:bg-black/20 rounded-2xl p-2 transition-colors': editable, 'transition-transform': !isDragging.names }"
           :style="{ left: `${content.namesX ?? 50}%`, top: `${content.namesY ?? 50}%`, transform: 'translate(-50%, -50%)' }"
           @pointerdown="onPointerDown($event, 'names')"
      >
        <!-- Vertical Layout -->
        <div v-if="content.namesLayout === 'vertical'" class="flex flex-col items-center gap-0 font-heading drop-shadow-lg" :style="{ fontFamily: 'var(--theme-heading-font)', fontSize: 'clamp(1.5rem,6vw,2.4rem)', lineHeight: '1.15' }">
          <span>{{ content.brideName || 'Bride' }}</span>
          <span class="text-[0.4em] text-gold-300 opacity-80 leading-none">&amp;</span>
          <span>{{ content.groomName || 'Groom' }}</span>
        </div>
        
        <!-- ADDED: Diagonal Layout -->
        <div v-else-if="content.namesLayout === 'diagonal'" class="flex flex-col font-heading drop-shadow-lg w-full max-w-[220px]" :style="{ fontFamily: 'var(--theme-heading-font)', fontSize: 'clamp(1.6rem, 7vw, 2.6rem)', lineHeight: '1.1' }">
          <span class="self-start text-left ml-2">{{ content.brideName || 'Bride' }}</span>
          <span class="text-[0.5em] text-gold-300 opacity-80 leading-none self-center my-1">&amp;</span>
          <span class="self-end text-right mr-2">{{ content.groomName || 'Groom' }}</span>
        </div>

        <!-- Horizontal Layout (Fallback/Default) -->
        <p v-else class="font-heading preview-names drop-shadow-lg whitespace-nowrap" :style="{ fontFamily: 'var(--theme-heading-font)' }">
          {{ content.brideName || 'Bride' }} <span class="text-[0.6em] mx-1 text-gold-300 opacity-80">&amp;</span> {{ content.groomName || 'Groom' }}
        </p>
      </div>

      <!-- 5. Date -->
      <div class="absolute flex flex-col items-center justify-center text-center w-full px-4 z-20 select-none"
           :class="{ 'cursor-move hover:ring-2 hover:ring-gold-400 hover:bg-black/20 rounded-2xl p-2 transition-colors': editable, 'transition-transform': !isDragging.date }"
           :style="{ left: `${content.dateX ?? 50}%`, top: `${content.dateY ?? 70}%`, transform: 'translate(-50%, -50%)' }"
           @pointerdown="onPointerDown($event, 'date')"
      >
        <p class="preview-meta font-medium whitespace-nowrap">{{ content.dateLabel || 'Wedding date' }}</p>
      </div>

      <!-- 6. Venue -->
      <div class="absolute flex flex-col items-center justify-center text-center w-full px-4 z-20 select-none"
           :class="{ 'cursor-move hover:ring-2 hover:ring-gold-400 hover:bg-black/20 rounded-2xl p-2 transition-colors': editable, 'transition-transform': !isDragging.venue }"
           :style="{ left: `${content.venueX ?? 50}%`, top: `${content.venueY ?? 78}%`, transform: 'translate(-50%, -50%)' }"
           @pointerdown="onPointerDown($event, 'venue')"
      >
        <p class="preview-meta text-xs whitespace-nowrap">{{ content.venueName || 'Venue' }}</p>
      </div>

    </template>

    <!-- Footer reservation guide (edit mode only) - the live page pins RSVP/Details
         buttons here, so dragged text should stay above this zone -->
    <div
      v-if="editable"
      class="absolute inset-x-0 bottom-0 z-10 pointer-events-none flex items-start justify-center pt-2"
      style="height: 22%; background: linear-gradient(to top, rgba(0,0,0,0.35), transparent);"
    >
      <span class="text-[9px] uppercase tracking-widest text-white/40">Buttons area — avoid placing text here</span>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="quickEditKey" class="quick-edit-backdrop" @click.self="closeQuickEdit">
      <div class="quick-edit-panel">
        <p class="quick-edit-title">{{ QUICK_EDIT_TITLE[quickEditKey] }}</p>

        <template v-if="quickEditKey === 'names'">
          <label class="quick-edit-label">Bride's name</label>
          <input v-model="quickEditDraft.bride" type="text" class="quick-edit-input" placeholder="Bride" autofocus>
          <label class="quick-edit-label">Groom's name</label>
          <input v-model="quickEditDraft.groom" type="text" class="quick-edit-input" placeholder="Groom">

          <label class="quick-edit-label">Layout</label>
          <div class="quick-edit-layout-row">
            <button type="button" class="quick-edit-layout-btn" :class="{ 'quick-edit-layout-btn-active': content.namesLayout !== 'vertical' }" @click="content.namesLayout = 'horizontal'">
              Straight (Side by Side)
            </button>
            <button type="button" class="quick-edit-layout-btn" :class="{ 'quick-edit-layout-btn-active': content.namesLayout === 'vertical' }" @click="content.namesLayout = 'vertical'">
              Stacked
            </button>
            <!-- ADDED: Diagonal quick-edit button -->
            <button type="button" class="quick-edit-layout-btn" :class="{ 'quick-edit-layout-btn-active': content.namesLayout === 'diagonal' }" @click="content.namesLayout = 'diagonal'">
              Diagonal
            </button>
          </div>
        </template>

        <template v-else>
          <label class="quick-edit-label">{{ QUICK_EDIT_PLACEHOLDER[quickEditKey] }}</label>
          <input v-model="quickEditDraft.text" type="text" class="quick-edit-input" :placeholder="QUICK_EDIT_PLACEHOLDER[quickEditKey]" autofocus>
        </template>

        <div class="quick-edit-actions">
          <button type="button" class="quick-edit-cancel" @click="closeQuickEdit">Cancel</button>
          <button type="button" class="quick-edit-save" @click="saveQuickEdit">Done</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { WeddingContent } from '~/composables/useWeddingTypes'

const props = defineProps<{ 
  content: WeddingContent; 
  themeId: string;
  editable?: boolean;
}>()

const { themeStyleVars } = useThemes()

const styleVars = computed(() =>
  themeStyleVars(
    props.themeId,
    { bgFrom: props.content.customBgFrom, bgTo: props.content.customBgTo, accent: props.content.customAccent },
    props.content.customFontFamily || props.content.fontFamily 
  )
)

const isDragging = ref<Record<string, boolean>>({ icon: false, greeting: false, intro: false, names: false, date: false, venue: false })

// Tapping (not dragging) a text block opens a small inline editor right in
// the preview, so mobile users can adjust text without hunting through the
// separate form fields below.
const quickEditKey = ref<string | null>(null)
const quickEditDraft = reactive({ text: '', bride: '', groom: '' })

const QUICK_EDIT_FIELD: Partial<Record<string, keyof WeddingContent>> = {
  greeting: 'innerGreeting',
  intro: 'innerIntro',
  date: 'dateLabel',
  venue: 'venueName'
}

const QUICK_EDIT_TITLE: Record<string, string> = {
  names: 'Edit Names',
  greeting: 'Edit Greeting',
  intro: 'Edit Intro Line',
  date: 'Edit Date',
  venue: 'Edit Venue Name'
}

const QUICK_EDIT_PLACEHOLDER: Record<string, string> = {
  greeting: "You're Invited",
  intro: 'To the wedding celebration of',
  date: 'Wednesday, 9 September 2026',
  venue: 'Grand Ballroom'
}

function openQuickEdit(key: string) {
  if (key === 'names') {
    quickEditDraft.bride = props.content.brideName || ''
    quickEditDraft.groom = props.content.groomName || ''
  } else if (QUICK_EDIT_FIELD[key]) {
    quickEditDraft.text = (props.content[QUICK_EDIT_FIELD[key]!] as string) || ''
  } else {
    return
  }
  quickEditKey.value = key
}

function saveQuickEdit() {
  if (!quickEditKey.value) return
  if (quickEditKey.value === 'names') {
    props.content.brideName = quickEditDraft.bride
    props.content.groomName = quickEditDraft.groom
  } else {
    const field = QUICK_EDIT_FIELD[quickEditKey.value]
    if (field) {
      ;(props.content as unknown as Record<string, string>)[field] = quickEditDraft.text
    }
  }
  quickEditKey.value = null
}

function closeQuickEdit() {
  quickEditKey.value = null
}

function onPointerDown(e: PointerEvent, key: string) {
  if (!props.editable) return
  e.preventDefault()
  isDragging.value[key] = true

  const parent = (e.currentTarget as HTMLElement).parentElement
  if (!parent) return

  const rect = parent.getBoundingClientRect()
  const startClientX = e.clientX
  const startClientY = e.clientY
  let moved = false

  const onPointerMove = (moveEvent: PointerEvent) => {
    if (Math.abs(moveEvent.clientX - startClientX) > 6 || Math.abs(moveEvent.clientY - startClientY) > 6) {
      moved = true
    }

    let x = ((moveEvent.clientX - rect.left) / rect.width) * 100
    let y = ((moveEvent.clientY - rect.top) / rect.height) * 100
    
    // Lock within sensible bounds so it doesn't get completely lost off-screen
    props.content[`${key}X` as keyof WeddingContent] = Math.max(5, Math.min(95, x))
    props.content[`${key}Y` as keyof WeddingContent] = Math.max(5, Math.min(95, y))
  }

  const onPointerUp = () => {
    isDragging.value[key] = false
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    // A tap (no meaningful movement) opens the quick editor instead of just repositioning
    if (!moved) openQuickEdit(key)
  }

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}
</script>

<style scoped>
.preview-card {
  position: relative;
  width: 100%;
  aspect-ratio: 9 / 19;
  height: 100%;
  border-radius: 1.5rem;
  overflow: hidden;
  background: linear-gradient(160deg, var(--theme-bg-from), var(--theme-bg-via), var(--theme-bg-to));
  border: 1px solid var(--theme-accent-soft);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  touch-action: none;
}

.preview-photo {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.45;
}

.preview-photo-contain {
  background-size: contain;
  background-repeat: no-repeat;
  opacity: 1;
}

.preview-eyebrow {
  font-size: 0.65rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--theme-accent);
  white-space: nowrap;
}

.preview-names {
  color: var(--theme-ink);
  font-size: clamp(2.5rem, 8vw, 3.5rem);
  line-height: 1.1;
}

.preview-meta {
  font-size: 0.8rem;
  color: var(--theme-ink);
  opacity: 0.85;
  font-weight: 300;
  letter-spacing: 0.05em;
}

.quick-edit-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.quick-edit-panel {
  width: 100%;
  max-width: 340px;
  background: #111827;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.quick-edit-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
}

.quick-edit-label {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 0.35rem;
  margin-top: 0.75rem;
}

.quick-edit-input {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border-radius: 0.6rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 0.9rem;
}

.quick-edit-input:focus {
  outline: none;
  border-color: #e3b04a;
}

.quick-edit-layout-row {
  display: flex;
  gap: 0.5rem;
}

.quick-edit-layout-btn {
  flex: 1;
  padding: 0.5rem;
  border-radius: 0.6rem;
  font-size: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.15s ease;
}

.quick-edit-layout-btn-active {
  border-color: #e3b04a;
  background: rgba(212, 160, 23, 0.15);
  color: #f3ddaa;
}

.quick-edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.25rem;
}

.quick-edit-cancel,
.quick-edit-save {
  padding: 0.5rem 1.1rem;
  border-radius: 0.6rem;
  font-size: 0.85rem;
  font-weight: 500;
}

.quick-edit-cancel {
  color: rgba(255, 255, 255, 0.6);
}

.quick-edit-cancel:hover {
  color: white;
}

.quick-edit-save {
  background: #e3b04a;
  color: #1f1400;
  font-weight: 600;
}
</style>