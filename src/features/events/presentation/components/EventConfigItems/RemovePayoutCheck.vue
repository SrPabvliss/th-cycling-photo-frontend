<script setup lang="ts">
defineProps<{
  modelValue: boolean
  disabledReason: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
}>()
</script>

<template>
  <button
    type="button"
    class="ce-remove"
    :class="{ on: modelValue }"
    data-test="remove-payout"
    :aria-pressed="modelValue"
    :disabled="!modelValue && disabledReason !== null"
    @click="emit('update:modelValue', !modelValue)"
  >
    <span class="tt-remove-mark" :class="{ on: modelValue }" />
    <span class="ce-remove-t">
      <b>Quitar de este evento</b>
      <i v-if="!modelValue && disabledReason" data-test="remove-payout-reason">{{
        disabledReason
      }}</i>
    </span>
  </button>
</template>

<style scoped src="./remove-payout-check.css" />
