<template>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
    <button
      v-for="theme in allThemes"
      :key="theme.id"
      type="button"
      class="theme-card group"
      :class="{ 'theme-card-active': modelValue === theme.id }"
      @click="$emit('update:modelValue', theme.id)"
    >
      <span
        class="theme-swatch shadow-inner transition-transform group-hover:scale-[1.02] relative overflow-hidden"
        :style="{
          background: `linear-gradient(135deg, ${theme.palette.bgFrom}, ${theme.palette.bgTo})`,
          borderColor: theme.palette.accent
        }"
      >
        <!-- Simulating a mini invitation card look inside the swatch -->
        <span class="absolute inset-0 flex flex-col items-center justify-center w-full h-full opacity-70">
            <span class="w-8 h-px mb-2" :style="{ background: theme.palette.accent }"></span>
            <span class="text-[0.55rem] tracking-widest uppercase font-semibold" :style="{ color: theme.palette.ink }">RSVP</span>
            <span class="w-4 h-px mt-2 opacity-50" :style="{ background: theme.palette.accent }"></span>
        </span>
      </span>
      <span class="mt-3 text-sm font-semibold text-white tracking-wide">{{ theme.name }}</span>
      <span class="text-xs text-white/60 text-center leading-relaxed mt-1 px-1">{{ theme.tagline }}</span>
      <UBadge
        :color="theme.price === 0 ? 'neutral' : 'primary'"
        variant="subtle"
        size="sm"
        class="mt-3 shadow-sm"
      >
        {{ theme.price === 0 ? 'Free' : `${theme.currency} ${theme.price}` }}
      </UBadge>
      <UIcon
        v-if="modelValue === theme.id"
        name="i-heroicons-check-circle"
        class="absolute top-3 right-3 w-6 h-6 text-gold-300 drop-shadow-md transition-transform scale-100 animate-in zoom-in"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()

const { allThemes } = useThemes()
</script>

<style scoped>
.theme-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.25rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(8px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
}

.theme-card:hover {
  border-color: rgba(212, 160, 23, 0.6);
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.theme-card-active {
  border-color: var(--color-gold-400);
  background: rgba(212, 160, 23, 0.12);
  box-shadow: 0 0 0 1px var(--color-gold-400);
}

.theme-swatch {
  width: 100%;
  height: 5rem;
  border-radius: 0.5rem;
  border: 2px solid;
  display: flex;
}
</style>