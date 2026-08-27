<script setup lang="ts">
defineProps<{
  profileLabel: string
  useProfile: boolean
}>()

const emit = defineEmits<{
  'update:use-profile': [boolean]
}>()
</script>

<template>
  <div class="ce-choice" data-test="source-choice">
    <button
      type="button"
      class="ce-opt"
      :class="{ on: useProfile }"
      data-test="source-choice-profile"
      @click="emit('update:use-profile', true)"
    >
      <span class="ce-radio" />
      <span class="ce-opt-t">
        <b>Usar la de mi perfil</b>
        <i>{{ profileLabel }}</i>
      </span>
    </button>
    <button
      type="button"
      class="ce-opt"
      :class="{ on: !useProfile }"
      data-test="source-choice-new"
      @click="emit('update:use-profile', false)"
    >
      <span class="ce-radio" />
      <span class="ce-opt-t">
        <b>Usar otra solo para este evento</b>
        <i>Tu perfil no cambia</i>
      </span>
    </button>
  </div>
</template>

<style scoped src="./source-choice.css" />
