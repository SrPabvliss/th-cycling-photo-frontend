<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { CheckmarkOutline } from '@vicons/ionicons5'

const props = defineProps<{
  modelValue: boolean
  hasProfileValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
}>()

const note = computed(() => {
  if (!props.modelValue) {
    return 'Es un dato solo para este evento: tu perfil se queda como está.'
  }

  return props.hasProfileValue
    ? 'Se guardará en tu perfil y reemplazará el que tenías, así que tus próximos eventos usarán este.'
    : 'Se guardará en tu perfil, así no vuelves a escribirlo en tus próximos eventos.'
})
</script>

<template>
  <button
    type="button"
    class="ce-check"
    :class="{ on: modelValue }"
    data-test="save-to-profile"
    :aria-pressed="modelValue"
    @click="emit('update:modelValue', !modelValue)"
  >
    <span class="tt-check" :class="{ on: modelValue }">
      <NIcon v-if="modelValue" :component="CheckmarkOutline" :size="11" />
    </span>
    <span class="ce-check-t">
      <b>Guardar también en mi perfil</b>
      <i data-test="save-to-profile-note">{{ note }}</i>
    </span>
  </button>
</template>

<style scoped src="./save-to-profile-check.css" />
