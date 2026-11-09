<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { AddOutline, FlagOutline } from '@vicons/ionicons5'

const props = withDefaults(
  defineProps<{
    isOrganizer?: boolean
    canCreate?: boolean
  }>(),
  {
    isOrganizer: false,
    canCreate: false,
  },
)

const emit = defineEmits<{
  create: []
}>()

const title = computed(() =>
  props.isOrganizer ? 'Crea tu primer evento' : 'Todavía no hay eventos',
)

const hint = computed(() => {
  if (!props.isOrganizer) {
    return 'Cuando un organizador con cupo cree su primer evento, aparecerá aquí con sus fotos, su cupo y sus ingresos.'
  }
  return props.canCreate
    ? 'Tu contrato tiene cupo disponible. Crea el evento, sube las fotos y empieza a vender.'
    : 'Cuando tengas un contrato con cupo podrás crear tu primer evento aquí.'
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
      data-test="first-run-create"
      @click="emit('create')"
    >
      <template #icon>
        <NIcon :component="AddOutline" />
      </template>
      Crear evento
    </NButton>
  </div>
</template>

<style scoped src="./event-empty-states.css" />
