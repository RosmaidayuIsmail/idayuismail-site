<template>
  <aside class="h-full w-full sm:w-80 flex flex-col bg-white/95 dark:bg-ink-900/95 backdrop-blur border-l border-ink-900/10 dark:border-white/10">
    <div class="flex items-center justify-between px-4 py-3 border-b border-ink-900/10 dark:border-white/10">
      <h3 class="font-display font-bold text-ink-950 dark:text-white">Moodboard</h3>
      <button type="button" class="text-ink-900/50 dark:text-white/50 hover:text-gold-600 dark:hover:text-gold-300" aria-label="Close moodboard" @click="$emit('close')">
        <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
      </button>
    </div>

    <div class="p-4 space-y-2 border-b border-ink-900/10 dark:border-white/10">
      <div class="flex gap-2">
        <UInput v-model="url" placeholder="Paste an image URL…" size="sm" @keyup.enter="addUrl" />
        <UButton color="primary" size="sm" icon="i-heroicons-plus" @click="addUrl">Add</UButton>
      </div>
      <label class="inline-flex items-center gap-2 text-xs font-medium text-ink-900/60 dark:text-white/60 cursor-pointer hover:text-gold-600 dark:hover:text-gold-300 transition-colors">
        <UIcon name="i-heroicons-photo" class="w-4 h-4" />
        or upload from your device
        <input type="file" accept="image/*" class="hidden" @change="addFile">
      </label>
      <p v-if="error" class="text-xs text-rose-500">{{ error }}</p>
    </div>

    <div class="flex-1 overflow-y-auto p-4">
      <p v-if="items.length === 0" class="text-sm text-ink-900/45 dark:text-white/40 text-center mt-8">
        Collect inspiration for your house — interiors, facades, materials, gardens.
      </p>
      <div v-else class="grid grid-cols-2 gap-3">
        <div v-for="item in items" :key="item.id" class="group relative rounded-xl overflow-hidden border border-ink-900/10 dark:border-white/10 bg-ink-950/5 dark:bg-white/5">
          <img :src="item.src" alt="" class="w-full aspect-square object-cover">
          <button
            type="button"
            class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            aria-label="Remove image"
            @click="remove(item.id)"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </button>
          <input
            :value="item.note"
            placeholder="Add a note…"
            class="w-full bg-transparent text-xs p-2 focus:outline-none text-ink-900/70 dark:text-white/70"
            @input="setNote(item.id, ($event.target as HTMLInputElement).value)"
          >
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineEmits<{ close: [] }>()

interface MoodItem {
  id: string
  src: string
  note: string
  createdAt: number
}

const STORAGE_KEY = 'idayu:studio:moodboard'
const items = ref<MoodItem[]>([])
const url = ref('')
const error = ref('')

onMounted(() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) items.value = JSON.parse(raw)
  } catch { items.value = [] }
})

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
  } catch {
    error.value = 'Storage is full - remove a few images first.'
  }
}

function push(src: string) {
  error.value = ''
  items.value.unshift({ id: newStudioId(), src, note: '', createdAt: Date.now() })
  persist()
}

function addUrl() {
  const v = url.value.trim()
  if (!/^https?:\/\//.test(v)) {
    error.value = 'That doesn\'t look like a valid image URL.'
    return
  }
  push(v)
  url.value = ''
}

function addFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (file.size > 3 * 1024 * 1024) {
    error.value = 'That image is over 3MB - pick a smaller one so it fits in browser storage.'
    return
  }
  const reader = new FileReader()
  reader.onload = () => push(String(reader.result))
  reader.readAsDataURL(file)
}

function remove(id: string) {
  items.value = items.value.filter((i) => i.id !== id)
  persist()
}

function setNote(id: string, note: string) {
  const item = items.value.find((i) => i.id === id)
  if (item) {
    item.note = note
    persist()
  }
}
</script>
