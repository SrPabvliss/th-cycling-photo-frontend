<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NModal } from 'naive-ui'

import { useArchiveEvent } from '../../../../composables/mutations/use-archive-event'
import { useRestoreEvent } from '../../../../composables/mutations/use-restore-event'
import type { IEventDetail } from '../../../../types/responses/event-detail.response'
import { formatNumber } from '@/shared/utils/format.utils'

const props = defineProps<{ show: boolean; event: IEventDetail }>()

const emit = defineEmits<{ 'update:show': [value: boolean]; done: [] }>()

const isArchived = computed(() => props.event.status === 'archived')

const title = computed(() => (isArchived.value ? 'Restaurar el evento' : 'Archivar el evento'))

const confirmLabel = computed(() => (isArchived.value ? 'Restaurar' : 'Archivar'))

const hasCover = computed(() => props.event.coverImageSlug !== null)

const { mutateAsync: archiveEvent, isPending: isArchiving } = useArchiveEvent(props.event.id)
const { mutateAsync: restoreEvent, isPending: isRestoring } = useRestoreEvent(props.event.id)

const isPending = computed(() => isArchiving.value || isRestoring.value)

async function confirm() {
  if (isArchived.value) {
    await restoreEvent()
  } else {
    await archiveEvent()
  }
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
    <div class="aem-body">
      <template v-if="!isArchived">
        <div class="aem-row" data-test="archive-row">
          <b>Sale de la galería y del trabajo.</b>
          <span>Deja de ser visible y no admite subidas ni cambios.</span>
        </div>
        <div class="aem-row" data-test="archive-row">
          <b>No se borra nada.</b>
          <span>
            Sus {{ formatNumber(event.photoCount) }} fotos, sus pedidos y sus ingresos se conservan
            y se pueden consultar.
          </span>
        </div>
        <div class="aem-row" data-test="archive-row">
          <b>Se puede restaurar.</b>
          <span>Vuelve a Activos cuando quieras.</span>
        </div>
      </template>
      <template v-else>
        <div class="aem-row" data-test="restore-row">
          <b>Vuelve a Activos.</b>
          <span>El equipo puede volver a subir y editar fotos.</span>
        </div>
        <div v-if="hasCover" class="aem-row" data-test="restore-cover-row">
          <b>Vuelve a la galería.</b>
          <span>Tiene portada, así que se hace visible de inmediato.</span>
        </div>
        <div v-else class="aem-row" data-test="restore-cover-row">
          <b>No volverá a la galería.</b>
          <span>No tiene portada: seguirá invisible hasta que subas una.</span>
        </div>
      </template>
    </div>

    <template #footer>
      <div class="aem-footer">
        <NButton @click="emit('update:show', false)">Cancelar</NButton>
        <NButton
          :type="isArchived ? 'primary' : 'error'"
          :loading="isPending"
          data-test="archive-confirm"
          @click="confirm"
        >
          {{ confirmLabel }}
        </NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped src="./archive-event-modal.css" />
