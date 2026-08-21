<script setup lang="ts">
import { ref, watch } from 'vue'
import { NButton, NForm, NFormItem, NInput, NModal, NRadioButton, NRadioGroup } from 'naive-ui'

import { useCreatePayoutMethod } from '../../composables/mutations/use-create-payout-method'
import { useUpdatePayoutMethod } from '../../composables/mutations/use-update-payout-method'
import type {
  PayoutMethodAccountType,
  PayoutMethodResponse,
} from '../../types/responses/payout-method.response'

const props = defineProps<{ show: boolean; method: PayoutMethodResponse | null }>()
const emit = defineEmits<{ (e: 'update:show', val: boolean): void }>()

const bankName = ref(props.method?.bankName ?? '')
const accountType = ref<PayoutMethodAccountType>(props.method?.accountType ?? 'ahorros')
const accountNumber = ref(props.method?.accountNumber ?? '')
const accountHolder = ref(props.method?.accountHolder ?? '')
const holderIdentification = ref(props.method?.holderIdentification ?? '')
const error = ref<string | null>(null)

watch(
  () => props.method,
  (method) => {
    bankName.value = method?.bankName ?? ''
    accountType.value = method?.accountType ?? 'ahorros'
    accountNumber.value = method?.accountNumber ?? ''
    accountHolder.value = method?.accountHolder ?? ''
    holderIdentification.value = method?.holderIdentification ?? ''
    error.value = null
  },
)

const { mutateAsync: createMethod, isPending: isCreating } = useCreatePayoutMethod()
const { mutateAsync: updateMethod, isPending: isUpdating } = useUpdatePayoutMethod()

async function submit() {
  error.value = null
  const bankFields = {
    bankName: bankName.value,
    accountType: accountType.value,
    accountNumber: accountNumber.value,
    accountHolder: accountHolder.value,
    holderIdentification: holderIdentification.value,
  }
  try {
    if (props.method) {
      await updateMethod({ id: props.method.id, payload: bankFields })
    } else {
      await createMethod({ provider: 'bank_transfer', ...bankFields })
    }
    emit('update:show', false)
  } catch (caught) {
    const response = (caught as { response?: { data?: { error?: { message?: string } } } }).response
    error.value = response?.data?.error?.message ?? 'No pudimos guardar los datos bancarios.'
  }
}
</script>

<template>
  <NModal
    :show="show"
    @update:show="(v) => emit('update:show', v)"
    preset="card"
    :title="method ? 'Editar transferencia bancaria' : 'Agregar transferencia bancaria'"
    style="width: 440px"
  >
    <NForm @submit.prevent="submit">
      <NFormItem label="Banco">
        <NInput v-model:value="bankName" />
      </NFormItem>
      <NFormItem label="Tipo de cuenta">
        <NRadioGroup v-model:value="accountType">
          <NRadioButton value="ahorros">Ahorros</NRadioButton>
          <NRadioButton value="corriente">Corriente</NRadioButton>
        </NRadioGroup>
      </NFormItem>
      <NFormItem label="Número de cuenta">
        <NInput v-model:value="accountNumber" />
      </NFormItem>
      <NFormItem label="Titular">
        <NInput v-model:value="accountHolder" />
      </NFormItem>
      <NFormItem label="Identificación">
        <NInput v-model:value="holderIdentification" />
      </NFormItem>

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
