<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { AddOutline, FlagOutline } from '@vicons/ionicons5'

const props = defineProps<{
  role: 'titan' | 'organizer' | 'operator'
  canCreate: boolean
}>()

const emit = defineEmits<{
  create: []
}>()

const title = computed(() =>
  props.role === 'organizer' ? 'Todavía no tienes eventos' : 'Todavía no hay eventos',
)

const hint = computed(() => {
  if (props.role === 'organizer') {
    return 'Crea tu primer evento, sube las fotos y quedará listo para vender en tu galería.'
  }

  return props.canCreate
    ? 'Crea el primero, o espera a que un organizador con cupo publique el suyo: aparecerá aquí con sus fotos, su cupo y sus ingresos.'
    : 'Cuando un organizador con cupo cree su primer evento, aparecerá aquí con sus fotos, su cupo y sus ingresos.'
})
</script>

<template>
  <div class="ees-empty ees-empty--tall" data-test="first-run">
    <span class="ees-empty__icon">
      <NIcon :component="FlagOutline" :size="22" />
    </span>
    <b>{{ title }}</b>
    <span class="ees-empty__hint">{{ hint }}</span>
    <NButton
      v-if="canCreate"
      type="primary"
      class="ees-empty__action"
      data-test="create-first-event"
      @click="emit('create')"
    >
      <template #icon><NIcon :component="AddOutline" /></template>
      Crear evento
    </NButton>
  </div>
</template>

<style scoped src="./event-empty-states.css" />
