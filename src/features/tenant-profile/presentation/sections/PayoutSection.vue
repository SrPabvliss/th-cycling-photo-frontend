<script setup lang="ts">
import { computed, ref } from 'vue'
import { NAlert, NButton, NIcon, NSpin, NTag } from 'naive-ui'
import {
  AddOutline,
  BusinessOutline,
  CreateOutline,
  PhonePortraitOutline,
  TrashOutline,
} from '@vicons/ionicons5'

import { PERMISSIONS } from '@/core/auth/permissions'
import { usePermissions } from '@/core/auth/use-permissions'
import { message } from '@/core/ui/discrete-api'
import PasswordConfirmModal from '@/shared/components/PasswordConfirmModal/PasswordConfirmModal.vue'
import { formatPayphoneReceiver, readApiErrorMessage } from '../../utils/payout-method.utils'
import { usePayoutMethods } from '../../composables/queries/use-payout-methods'
import { useDeletePayoutMethod } from '../../composables/mutations/use-delete-payout-method'
import PayphoneMethodModal from '../modals/PayphoneMethodModal.vue'
import BankTransferMethodModal from '../modals/BankTransferMethodModal.vue'
import type {
  PayoutMethodProvider,
  PayoutMethodResponse,
} from '../../types/responses/payout-method.response'

const props = defineProps<{ whatsappNumber: string | null }>()

const { has } = usePermissions()
const canManagePayouts = computed(() => has(PERMISSIONS.TENANT_PAYOUT_METHOD_MANAGE))

const { data: methods, isLoading } = usePayoutMethods()
const { mutateAsync: deleteMethod, isPending: isDeleting } = useDeletePayoutMethod()

const PROVIDER_LABELS: Record<PayoutMethodProvider, string> = {
  payphone: 'Payphone',
  bank_transfer: 'Transferencia bancaria',
}

const payphoneMethod = computed(
  () => methods.value?.find((method) => method.provider === 'payphone') ?? null,
)

const bankMethod = computed(
  () => methods.value?.find((method) => method.provider === 'bank_transfer') ?? null,
)

const isPayphoneModalOpen = ref(false)
const isBankModalOpen = ref(false)
const editingMethod = ref<PayoutMethodResponse | null>(null)

function openPayphone(method: PayoutMethodResponse | null) {
  editingMethod.value = method
  isPayphoneModalOpen.value = true
}

function openBank(method: PayoutMethodResponse | null) {
  editingMethod.value = method
  isBankModalOpen.value = true
}

const methodPendingRemoval = ref<PayoutMethodResponse | null>(null)
const removalError = ref<string | null>(null)

const removalLabels = computed(() =>
  methodPendingRemoval.value ? [PROVIDER_LABELS[methodPendingRemoval.value.provider]] : [],
)

function askToRemove(method: PayoutMethodResponse) {
  removalError.value = null
  methodPendingRemoval.value = method
}

function cancelRemoval() {
  methodPendingRemoval.value = null
  removalError.value = null
}

async function confirmRemoval(password: string) {
  const method = methodPendingRemoval.value
  if (!method) return

  removalError.value = null
  try {
    await deleteMethod({ id: method.id, password })
    message.success('Método de cobro eliminado')
    methodPendingRemoval.value = null
  } catch (caught) {
    removalError.value = readApiErrorMessage(caught, 'No pudimos eliminar el método de cobro.')
  }
}
</script>

<template>
  <div class="payout-section">
    <NAlert
      v-if="!isLoading && !payphoneMethod"
      type="warning"
      :show-icon="true"
      class="payout-section__alert"
    >
      Necesitas una cuenta Payphone verificada para poder publicar eventos y cobrar con tarjeta.
    </NAlert>

    <NSpin v-if="isLoading" size="small" class="payout-section__loading" />

    <div v-else class="payout-section__slots">
      <div
        class="payout-slot"
        :class="payphoneMethod ? 'payout-slot--filled' : 'payout-slot--empty'"
      >
        <button
          type="button"
          class="payout-slot__main"
          :disabled="!canManagePayouts"
          data-test="payphone-slot"
          @click="openPayphone(payphoneMethod)"
        >
          <span class="payout-slot__icon">
            <NIcon :component="PhonePortraitOutline" :size="22" />
          </span>

          <span class="payout-slot__body">
            <span class="payout-slot__title">
              {{ payphoneMethod ? 'Payphone' : 'Agrega tu cuenta Payphone' }}
              <NTag v-if="payphoneMethod" type="success" size="small" :bordered="false" round>
                Verificada
              </NTag>
            </span>

            <span v-if="payphoneMethod" class="payout-slot__value">
              {{ formatPayphoneReceiver(payphoneMethod.receiverIdentifier) }}
            </span>

            <span class="payout-slot__note">
              Es donde recibes el dinero de cada venta cobrada con tarjeta, ya descontada la
              comisión de Payphone. Sin esta cuenta no puedes publicar eventos.
            </span>
          </span>
        </button>

        <div v-if="canManagePayouts" class="payout-slot__actions">
          <NButton
            v-if="payphoneMethod"
            size="small"
            secondary
            data-test="edit-payphone"
            @click="openPayphone(payphoneMethod)"
          >
            <template #icon><NIcon :component="CreateOutline" /></template>
            Editar
          </NButton>

          <NButton
            v-if="payphoneMethod"
            size="small"
            secondary
            type="error"
            data-test="delete-payphone"
            @click="askToRemove(payphoneMethod)"
          >
            <template #icon><NIcon :component="TrashOutline" /></template>
            Eliminar
          </NButton>

          <NButton v-else size="small" type="primary" @click="openPayphone(null)">
            <template #icon><NIcon :component="AddOutline" /></template>
            Agregar Payphone
          </NButton>
        </div>
      </div>

      <div class="payout-slot" :class="bankMethod ? 'payout-slot--filled' : 'payout-slot--empty'">
        <button
          type="button"
          class="payout-slot__main"
          :disabled="!canManagePayouts"
          data-test="bank-slot"
          @click="openBank(bankMethod)"
        >
          <span class="payout-slot__icon">
            <NIcon :component="BusinessOutline" :size="22" />
          </span>

          <span class="payout-slot__body">
            <span class="payout-slot__title">
              {{ bankMethod ? bankMethod.bankName : 'Agrega tu cuenta bancaria' }}
            </span>

            <span v-if="bankMethod" class="payout-slot__value">
              {{ bankMethod.accountType }} · {{ bankMethod.accountNumber }} ·
              {{ bankMethod.accountHolder }}
            </span>

            <span class="payout-slot__note">
              Para las ventas que cobras por transferencia. Ese cobro todavía es manual: le pasas
              los datos al comprador y confirmas el pago a mano.
            </span>
          </span>
        </button>

        <div v-if="canManagePayouts" class="payout-slot__actions">
          <NButton
            v-if="bankMethod"
            size="small"
            secondary
            data-test="edit-bank"
            @click="openBank(bankMethod)"
          >
            <template #icon><NIcon :component="CreateOutline" /></template>
            Editar
          </NButton>

          <NButton
            v-if="bankMethod"
            size="small"
            secondary
            type="error"
            data-test="delete-bank"
            @click="askToRemove(bankMethod)"
          >
            <template #icon><NIcon :component="TrashOutline" /></template>
            Eliminar
          </NButton>

          <NButton v-else size="small" type="primary" @click="openBank(null)">
            <template #icon><NIcon :component="AddOutline" /></template>
            Agregar cuenta bancaria
          </NButton>
        </div>
      </div>
    </div>

    <PasswordConfirmModal
      :show="methodPendingRemoval !== null"
      :methods="removalLabels"
      action-verb="Eliminar"
      subtitle="Necesitamos verificar que eres tú antes de eliminar este método de cobro."
      tone="danger"
      footnote="Se borra de tu perfil. Los eventos que ya lo tienen copiado no se tocan."
      :loading="isDeleting"
      :error="removalError"
      @update:show="(open: boolean) => !open && cancelRemoval()"
      @confirm="confirmRemoval"
      @cancel="cancelRemoval"
    />

    <PayphoneMethodModal
      v-model:show="isPayphoneModalOpen"
      :method="editingMethod"
      :whatsapp-number="props.whatsappNumber"
    />
    <BankTransferMethodModal v-model:show="isBankModalOpen" :method="editingMethod" />
  </div>
</template>

<style scoped src="./payout-section.css"></style>
