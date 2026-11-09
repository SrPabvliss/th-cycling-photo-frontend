<script setup lang="ts">
import { computed } from 'vue'
import { NSelect } from 'naive-ui'

const props = defineProps<{
  modelValue: string
  placeholder: string
  options: { value: string; label: string }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [string]
}>()

const mergedOptions = computed(() => {
  const isKnown = props.options.some((option) => option.value === props.modelValue)
  if (props.modelValue === '' || isKnown) return props.options
  return [{ value: props.modelValue, label: props.modelValue }, ...props.options]
})

function onUpdate(value: string | null) {
  emit('update:modelValue', value ?? '')
}
</script>

<template>
  <div class="ce-combo">
    <NSelect
      filterable
      tag
      :value="modelValue === '' ? null : modelValue"
      :options="mergedOptions"
      :placeholder="placeholder"
      :show-arrow="true"
      @update:value="onUpdate"
    />
  </div>
</template>

<style scoped src="./config-combo-select.css" />
