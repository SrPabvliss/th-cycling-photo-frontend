<script setup lang="ts">
import { NSelect } from 'naive-ui'

defineProps<{
  modelValue: string
  placeholder: string
  options: { value: string; label: string }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [string]
}>()

function onUpdate(value: string | null) {
  emit('update:modelValue', value ?? '')
}
</script>

<template>
  <NSelect
    :value="modelValue === '' ? null : modelValue"
    :options="options"
    :placeholder="placeholder"
    @update:value="onUpdate"
  />
</template>
