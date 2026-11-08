<script setup lang="ts">
withDefaults(
  defineProps<{
    profileLabel: string
    useProfile: boolean
    profileTitle?: string
    otherTitle?: string
    otherHint?: string
  }>(),
  {
    profileTitle: 'Usar la de mi perfil',
    otherTitle: 'Usar otra solo para este evento',
    otherHint: 'Tu perfil no cambia',
  },
)

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
        <b>{{ profileTitle }}</b>
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
        <b>{{ otherTitle }}</b>
        <i>{{ otherHint }}</i>
      </span>
    </button>
  </div>
</template>

<style scoped src="./source-choice.css" />
