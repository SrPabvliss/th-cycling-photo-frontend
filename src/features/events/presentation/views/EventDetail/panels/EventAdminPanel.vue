<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton, NIcon, NSwitch } from 'naive-ui'
import { InformationCircleOutline } from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import FrozenInfoModal from '../../../components/FrozenInfoModal/FrozenInfoModal.vue'
import type { IEventDetail } from '../../../../types/responses/event-detail.response'
import { formatNumber } from '@/shared/utils/format.utils'

const props = defineProps<{
  event: IEventDetail
  canFreeze: boolean
  canSetQuota: boolean
  canArchive: boolean
}>()

const emit = defineEmits<{
  freeze: [value: boolean]
  'change-quota': []
  archive: []
}>()

const isClosedForWork = computed(() => props.event.isFrozen || props.event.status === 'archived')

const hasAny = computed(() => props.canFreeze || props.canSetQuota || props.canArchive)

const audienceLabel = computed(() => (props.canFreeze ? 'Solo Titan TV' : 'Solo el organizador'))

const freezeTitle = computed(() => (props.event.isFrozen ? 'Congelado' : 'Congelar el evento'))

const freezeBody = computed(() => {
  const base =
    'Bloquea subir, editar y borrar fotos, la configuración, las categorías y la portada. No afecta la venta: la galería, el carrito y el checkout siguen abiertos.'
  if (props.event.isFrozen && props.event.frozenAt) {
    return `${base} Congelado el ${formatDate(props.event.frozenAt)}.`
  }
  return base
})

const quotaTitle = computed(() =>
  props.event.photoQuota === null
    ? 'Cupo de fotos · Sin límite'
    : `Cupo de fotos · ${formatNumber(props.event.photoQuota)}`,
)

const quotaBody = computed(() => {
  const contractClause = props.event.contractName ? ` (${props.event.contractName})` : ''
  return `Vino del contrato al crear el evento${contractClause}. Se puede ampliar o reducir sin tocar el contrato.`
})

const archiveTitle = computed(() =>
  props.event.status === 'archived' ? 'Restaurar el evento' : 'Archivar el evento',
)

const archiveBody = computed(() =>
  props.event.status === 'archived'
    ? 'Vuelve a Activos y, si tiene portada, a la galería pública.'
    : 'Sale de la lista de trabajo y deja de admitir cambios. Sus fotos, pedidos e ingresos se conservan. Se puede restaurar cuando quieras.',
)

const isFrozenInfoOpen = ref(false)

function handleFreezeToggle(value: boolean) {
  emit('freeze', value)
}
</script>

<template>
  <section v-if="hasAny" class="admin" data-test="admin-panel">
    <div class="admin__head">
      <h4>Administración del evento</h4>
      <span class="admin__pill" data-test="admin-audience">{{ audienceLabel }}</span>
    </div>

    <div v-if="canFreeze" class="admin__row" data-test="admin-freeze">
      <div class="admin__text">
        <b>
          {{ freezeTitle }}
          <button
            type="button"
            class="admin__info"
            title="Ver qué cambia al congelar"
            data-test="admin-freeze-info"
            @click="isFrozenInfoOpen = true"
          >
            <NIcon :component="InformationCircleOutline" :size="15" />
          </button>
        </b>
        <span>{{ freezeBody }}</span>
      </div>
      <NSwitch
        :value="event.isFrozen"
        :disabled="event.status === 'archived'"
        data-test="admin-freeze-switch"
        aria-label="Congelar el evento"
        @update:value="handleFreezeToggle"
      />
    </div>

    <div v-if="canSetQuota" class="admin__row" data-test="admin-quota">
      <div class="admin__text">
        <b>{{ quotaTitle }}</b>
        <span>{{ quotaBody }}</span>
      </div>
      <NButton
        :disabled="isClosedForWork"
        data-test="admin-quota-button"
        @click="emit('change-quota')"
      >
        Cambiar
      </NButton>
    </div>

    <div v-if="canArchive" class="admin__row" data-test="admin-archive">
      <div class="admin__text">
        <b>{{ archiveTitle }}</b>
        <span>{{ archiveBody }}</span>
      </div>
      <NButton
        :type="event.status === 'archived' ? 'default' : 'error'"
        :disabled="event.isFrozen"
        data-test="admin-archive-button"
        @click="emit('archive')"
      >
        {{ event.status === 'archived' ? 'Restaurar' : 'Archivar' }}
      </NButton>
    </div>
    <FrozenInfoModal v-model:show="isFrozenInfoOpen" />
  </section>
</template>

<style scoped src="./event-admin-panel.css" />
