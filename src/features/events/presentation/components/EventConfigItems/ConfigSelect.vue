<script setup lang="ts">
defineProps<{
  modelValue: string
  placeholder: string
  options: { value: string; label: string }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [string]
}>()

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>

<template>
  <select
    class="tt-input ce-selin"
    :class="{ ph: modelValue === '' }"
    :value="modelValue"
    @change="onChange"
  >
    <option value="" disabled>{{ placeholder }}</option>
    <option v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>

<style scoped src="./config-select.css" />
