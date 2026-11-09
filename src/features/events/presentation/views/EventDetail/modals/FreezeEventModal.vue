<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NModal } from 'naive-ui'

import { formatDate } from '@/shared/utils/date.utils'
import { useSetEventFreeze } from '../../../../composables/mutations/use-set-event-freeze'
import StateSlides from '../../../components/StateSlides/StateSlides.vue'
import { FROZEN_SLIDES } from '../../../components/StateSlides/frozen-slides.data'
import type { IEventDetail } from '../../../../types/responses/event-detail.response'

const props = defineProps<{ show: boolean; event: IEventDetail }>()

const emit = defineEmits<{ 'update:show': [value: boolean]; done: [] }>()

const title = computed(() =>
  props.event.isFrozen ? 'Descongelar el evento' : 'Congelar el evento',
)

const confirmLabel = computed(() => (props.event.isFrozen ? 'Descongelar' : 'Congelar'))

const frozenAtLabel = computed(() => (props.event.frozenAt ? formatDate(props.event.frozenAt) : ''))

const { mutateAsync: setFreeze, isPending } = useSetEventFreeze(props.event.id)

async function confirm() {
  await setFreeze(!props.event.isFrozen)
  emit('done')
  emit('update:show', false)
}
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    :title="title"
    style="width: 520px; max-width: calc(100vw - 32px)"
    @update:show="(v: boolean) => emit('update:show', v)"
  >
    <template v-if="!event.isFrozen">
      <p class="fem-lead">Esto es lo que cambia mientras dure.</p>
      <StateSlides :slides="FROZEN_SLIDES" />
    </template>

    <template v-else>
      <p class="fem-unfreeze" data-test="freeze-unfreeze-text">
        Congelado el {{ frozenAtLabel }}. Al descongelarlo, el equipo vuelve a poder subir, editar y
        borrar fotos, y a cambiar la configuración, las categorías y la portada.
      </p>
      <p class="fem-unfreeze-note">La venta nunca se detuvo, así que ahí no cambia nada.</p>
    </template>

    <template #footer>
      <div class="fem-footer">
        <NButton @click="emit('update:show', false)">Cancelar</NButton>
        <NButton
          :type="event.isFrozen ? 'primary' : 'warning'"
          :loading="isPending"
          data-test="freeze-confirm"
          @click="confirm"
        >
          {{ confirmLabel }}
        </NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped src="./freeze-event-modal.css" />
