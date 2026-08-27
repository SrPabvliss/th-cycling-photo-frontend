<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    state?: '' | 'bad' | 'good'
    maxlength?: number
  }>(),
  { placeholder: '', state: '', maxlength: undefined },
)

const emit = defineEmits<{
  'update:modelValue': [string]
  blur: []
}>()

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <input
    class="tt-input"
    :class="state"
    :value="modelValue"
    :maxlength="maxlength"
    :placeholder="placeholder"
    @input="onInput"
    @blur="emit('blur')"
  />
</template>

<style scoped src="./config-input.css" />
