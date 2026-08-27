<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NModal } from 'naive-ui'

import { formatDate } from '@/shared/utils/date.utils'
import { useSetEventFreeze } from '../../../../composables/mutations/use-set-event-freeze'
import type { IEventDetail } from '../../../../types/responses/event-detail.response'

const props = defineProps<{ show: boolean; event: IEventDetail }>()

const emit = defineEmits<{ 'update:show': [value: boolean]; done: [] }>()

const FREEZE_ROWS = [
  {
    title: 'Se bloquea el trabajo.',
    text: 'No se podrá subir, editar ni borrar fotos, ni cambiar la configuración, las categorías o la portada del evento.',
  },
  {
    title: 'La venta sigue igual.',
    text: 'La galería, el carrito y el checkout siguen abiertos: los compradores siguen comprando y los pedidos se siguen gestionando y entregando.',
  },
  {
    title: 'Se puede deshacer.',
    text: 'Descongelar devuelve todo al estado anterior, sin perder nada.',
  },
] as const

const title = computed(() =>
  props.event.isFrozen ? 'Descongelar el evento' : 'Congelar el evento',
)

const confirmLabel = computed(() => (props.event.isFrozen ? 'Descongelar' : 'Congelar'))

const unfreezeText = computed(() => {
  const frozenAt = props.event.frozenAt ? formatDate(props.event.frozenAt) : ''
  return (
    `Congelado el ${frozenAt}. Al descongelarlo, el equipo vuelve a poder subir, editar y ` +
    'borrar fotos y a cambiar la configuración, las categorías y la portada.'
  )
})

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
    style="width: 480px"
    @update:show="(v: boolean) => emit('update:show', v)"
  >
    <div class="fem-body">
      <template v-if="!event.isFrozen">
        <div v-for="row in FREEZE_ROWS" :key="row.title" class="fem-row" data-test="freeze-row">
          <b>{{ row.title }}</b>
          <span>{{ row.text }}</span>
        </div>
      </template>
      <p v-else class="fem-unfreeze" data-test="freeze-unfreeze-text">{{ unfreezeText }}</p>
    </div>

    <template #footer>
      <div class="fem-footer">
        <NButton @click="emit('update:show', false)">Cancelar</NButton>
        <NButton
          :type="event.isFrozen ? 'default' : 'warning'"
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
