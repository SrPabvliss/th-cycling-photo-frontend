<script setup lang="ts">
import { ref, watch } from 'vue'
import { NButton, NForm, NFormItem, NInput, NModal } from 'naive-ui'

import { useCreatePayoutMethod } from '../../composables/mutations/use-create-payout-method'
import { useUpdatePayoutMethod } from '../../composables/mutations/use-update-payout-method'
import type { PayoutMethodResponse } from '../../types/responses/payout-method.response'

const props = defineProps<{
  show: boolean
  method: PayoutMethodResponse | null
  whatsappNumber: string | null
}>()
const emit = defineEmits<{ (e: 'update:show', val: boolean): void }>()

const phone = ref(props.method?.receiverIdentifier ?? '')
const error = ref<string | null>(null)

watch(
  () => props.method,
  (method) => {
    phone.value = method?.receiverIdentifier ?? ''
    error.value = null
  },
)

function usePrefillWhatsapp() {
  if (props.whatsappNumber) phone.value = props.whatsappNumber
}

const { mutateAsync: createMethod, isPending: isCreating } = useCreatePayoutMethod()
const { mutateAsync: updateMethod, isPending: isUpdating } = useUpdatePayoutMethod()

async function submit() {
  error.value = null
  try {
    if (props.method) {
      await updateMethod({ id: props.method.id, payload: { phone: phone.value } })
    } else {
      await createMethod({ provider: 'payphone', phone: phone.value })
    }
    emit('update:show', false)
  } catch (caught) {
    const response = (caught as { response?: { data?: { error?: { message?: string } } } }).response
    error.value = response?.data?.error?.message ?? 'No pudimos verificar ese número de Payphone.'
  }
}
</script>

<template>
  <NModal
    :show="show"
    @update:show="(v) => emit('update:show', v)"
    preset="card"
    :title="method ? 'Editar cuenta Payphone' : 'Agregar cuenta Payphone'"
    style="width: 400px"
  >
    <NForm @submit.prevent="submit">
      <NFormItem label="Número de Payphone">
        <NInput v-model:value="phone" placeholder="0999999999" />
      </NFormItem>

      <NButton
        v-if="whatsappNumber"
        size="small"
        style="margin-bottom: 16px"
        @click="usePrefillWhatsapp"
      >
        Usar el mismo número de WhatsApp
      </NButton>

      <p v-if="error" style="color: #d03050; font-size: 13px; margin-top: -8px">{{ error }}</p>

      <div style="display: flex; justify-content: flex-end; gap: 8px">
        <NButton @click="emit('update:show', false)">Cancelar</NButton>
        <NButton type="primary" attr-type="submit" :loading="isCreating || isUpdating">
          Guardar
        </NButton>
      </div>
    </NForm>
  </NModal>
</template>
