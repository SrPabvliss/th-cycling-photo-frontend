<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton, NInputNumber, NModal } from 'naive-ui'

import { useUpdateEventPhotoQuota } from '../../../../composables/mutations/use-update-event-photo-quota'
import type { IEventDetail } from '../../../../types/responses/event-detail.response'
import { formatNumber } from '@/shared/utils/format.utils'

const props = defineProps<{ show: boolean; event: IEventDetail }>()

const emit = defineEmits<{ 'update:show': [value: boolean]; done: [] }>()

const value = ref<number | null>(props.event.photoQuota)

const isBelowConsumed = computed(
  () => value.value !== null && value.value < props.event.photosUploaded,
)

const canSave = computed(() => !isBelowConsumed.value)

const { mutateAsync: updateQuota, isPending } = useUpdateEventPhotoQuota(props.event.id)

function resetForm() {
  value.value = props.event.photoQuota
}

function close() {
  resetForm()
  emit('update:show', false)
}

async function confirm() {
  if (!canSave.value) return
  await updateQuota(value.value)
  emit('done')
  close()
}
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    title="Cambiar el cupo de fotos"
    style="width: 440px"
    @update:show="(v: boolean) => emit('update:show', v)"
  >
    <div class="pqm-body">
      <div class="pqm-figures">
        <div class="pqm-figure" data-test="quota-consumed">
          <span class="pqm-figure__label">Consumidas</span>
          <b>{{ formatNumber(event.photosUploaded) }}</b>
          <span class="pqm-figure__note">no bajan al borrar fotos</span>
        </div>
        <div class="pqm-figure" data-test="quota-contract-figure">
          <span class="pqm-figure__label">Cupo del contrato</span>
          <b>{{ event.photoQuota === null ? 'Sin límite' : formatNumber(event.photoQuota) }}</b>
          <span v-if="event.contractName" class="pqm-figure__note">{{ event.contractName }}</span>
        </div>
      </div>

      <label class="pqm-field">
        <span class="pqm-field__label">Cupo nuevo</span>
        <NInputNumber
          v-model:value="value"
          placeholder="Sin límite"
          data-test="quota-input"
          style="width: 100%"
        />
        <span class="pqm-field__hint">
          Déjalo vacío para quitar el límite. No puede quedar por debajo de
          {{ formatNumber(event.photosUploaded) }}: es lo ya consumido.
        </span>
        <span v-if="isBelowConsumed" class="pqm-field__error" data-test="quota-below-warning">
          El cupo no puede quedar por debajo de lo ya consumido.
        </span>
      </label>

      <p class="pqm-footnote">
        Cambiar el cupo aquí no toca el contrato del organizador ni el cupo de sus otros eventos.
      </p>
    </div>

    <template #footer>
      <div class="pqm-footer">
        <NButton data-test="quota-cancel" @click="close">Cancelar</NButton>
        <NButton
          type="primary"
          :disabled="!canSave"
          :loading="isPending"
          data-test="quota-save"
          @click="confirm"
        >
          Guardar cupo
        </NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped src="./photo-quota-modal.css" />
