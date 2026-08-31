<template>
  <div class="flex items-center gap-2 flex-wrap">
    <button
      type="button"
      class="ctp-swatch ctp-default"
      :class="{ 'ctp-active': !modelValue }"
      title="Default colors"
      @click="$emit('update:modelValue', '')"
    >
      <UIcon name="i-heroicons-slash" class="w-3.5 h-3.5" />
    </button>
    <button
      v-for="color in options"
      :key="color"
      type="button"
      class="ctp-swatch"
      :class="{ 'ctp-active': modelValue === color }"
      :style="{ background: color }"
      :title="color"
      @click="$emit('update:modelValue', color)"
    />
    <label class="ctp-custom" title="Custom color">
      <input type="color" :value="modelValue || '#d4a017'" class="ctp-custom-input" @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
      <UIcon name="i-heroicons-plus" class="w-3.5 h-3.5" />
    </label>
  </div>
</template>

<script setup lang="ts">
// Swatch row for picking a color for a design-option style. '' = default.
defineProps<{ options: string[]; modelValue: string }>()
defineEmits<{ (e: 'update:modelValue', value: string): void }>()
</script>

<style scoped>
.ctp-swatch {
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.ctp-swatch:hover { transform: scale(1.1); }
.ctp-active {
  box-shadow: 0 0 0 2px rgba(212, 160, 23, 0.8);
  transform: scale(1.05);
}
.ctp-default { background: rgba(255, 255, 255, 0.06); }
.ctp-custom {
  position: relative;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 9999px;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  overflow: hidden;
}
.ctp-custom-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}
</style>
