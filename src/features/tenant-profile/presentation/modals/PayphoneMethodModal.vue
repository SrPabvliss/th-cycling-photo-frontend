<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NAlert, NButton, NForm, NFormItem, NInput, NModal } from 'naive-ui'
import { isAxiosError } from 'axios'

import { message } from '@/core/ui/discrete-api'
import { useCreatePayoutMethod } from '../../composables/mutations/use-create-payout-method'
import { useUpdatePayoutMethod } from '../../composables/mutations/use-update-payout-method'
import type { PayoutMethodResponse } from '../../types/responses/payout-method.response'

const NOT_REGISTERED = 'not-registered'
const GENERIC_ERROR = 'No pudimos verificar ese número con Payphone. Intenta nuevamente.'

const props = defineProps<{
  show: boolean
  method: PayoutMethodResponse | null
  whatsappNumber: string | null
}>()
const emit = defineEmits<{ (e: 'update:show', val: boolean): void }>()

const phone = ref(props.method?.receiverIdentifier ?? '')
const error = ref<string | null>(null)

const isEditing = computed(() => props.method !== null)
const isNotRegistered = computed(() => error.value === NOT_REGISTERED)

watch(
  () => props.method,
  (method) => {
    phone.value = method?.receiverIdentifier ?? ''
    error.value = null
  },
)

watch(
  () => props.show,
  (show) => {
    if (!show) error.value = null
  },
)

function usePrefillWhatsapp() {
  if (props.whatsappNumber) phone.value = props.whatsappNumber
}

const { mutateAsync: createMethod, isPending: isCreating } = useCreatePayoutMethod()
const { mutateAsync: updateMethod, isPending: isUpdating } = useUpdatePayoutMethod()

function readError(caught: unknown): string {
  if (!isAxiosError(caught)) return GENERIC_ERROR

  const apiError = caught.response?.data?.error
  if (apiError?.details?.rule === 'phone_not_registered') return NOT_REGISTERED

  return apiError?.message ?? GENERIC_ERROR
}

async function submit() {
  error.value = null
  try {
    if (props.method) {
      await updateMethod({ id: props.method.id, payload: { phone: phone.value } })
    } else {
      await createMethod({ provider: 'payphone', phone: phone.value })
    }
    message.success('Número de Payphone verificado y guardado')
    emit('update:show', false)
  } catch (caught) {
    error.value = readError(caught)
  }
}
</script>

<template>
  <NModal
    :show="show"
    @update:show="(v) => emit('update:show', v)"
    preset="card"
    :title="isEditing ? 'Editar cuenta Payphone' : 'Agregar cuenta Payphone'"
    style="width: 440px"
  >
    <p class="payphone-modal__intro">
      A este número te llega el dinero de cada venta cobrada con tarjeta, descontada la comisión de
      Payphone. Necesitas tenerlo configurado para poder publicar eventos.
    </p>

    <NAlert
      v-if="isNotRegistered"
      type="warning"
      :show-icon="true"
      title="Ese número no tiene cuenta en Payphone"
      class="payphone-modal__alert"
    >
      Para poder recibir los pagos primero necesitas una cuenta Payphone Personal con ese número:
      <ol class="payphone-modal__steps">
        <li>Descarga la aplicación Payphone en tu celular.</li>
        <li>Crea tu cuenta usando este mismo número.</li>
        <li>Vuelve aquí y guárdalo de nuevo.</li>
      </ol>
    </NAlert>

    <NAlert
      v-else-if="error"
      type="error"
      :show-icon="true"
      class="payphone-modal__alert"
      data-test="payphone-error"
    >
      {{ error }}
    </NAlert>

    <NForm @submit.prevent="submit">
      <NFormItem label="Número de Payphone">
        <NInput v-model:value="phone" placeholder="0999999999" />
      </NFormItem>

      <p class="payphone-modal__hint">
        Verificamos con Payphone que el número tenga una cuenta antes de guardarlo.
      </p>

      <NButton
        v-if="whatsappNumber"
        size="small"
        class="payphone-modal__prefill"
        @click="usePrefillWhatsapp"
      >
        Usar el mismo número de WhatsApp
      </NButton>

      <div class="payphone-modal__actions">
        <NButton @click="emit('update:show', false)">Cancelar</NButton>
        <NButton type="primary" attr-type="submit" :loading="isCreating || isUpdating">
          Verificar y guardar
        </NButton>
      </div>
    </NForm>
  </NModal>
</template>

<style scoped src="./payphone-method-modal.css"></style>
