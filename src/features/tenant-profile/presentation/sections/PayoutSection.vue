<script setup lang="ts">
import { computed, ref } from 'vue'
import { NAlert, NButton, NCard, NEmpty, NFlex, NIcon, NPopconfirm, NSpin, NTag } from 'naive-ui'
import { ArrowDownOutline, ArrowUpOutline } from '@vicons/ionicons5'

import { PERMISSIONS } from '@/core/auth/permissions'
import { usePermissions } from '@/core/auth/use-permissions'
import { message } from '@/core/ui/discrete-api'
import { usePayoutMethods } from '../../composables/queries/use-payout-methods'
import { useDeletePayoutMethod } from '../../composables/mutations/use-delete-payout-method'
import { useUpdatePayoutMethod } from '../../composables/mutations/use-update-payout-method'
import PayphoneMethodModal from '../modals/PayphoneMethodModal.vue'
import BankTransferMethodModal from '../modals/BankTransferMethodModal.vue'
import type { PayoutMethodResponse } from '../../types/responses/payout-method.response'

const props = defineProps<{ whatsappNumber: string | null }>()

const { has } = usePermissions()
const canManagePayouts = computed(() => has(PERMISSIONS.TENANT_PAYOUT_METHOD_MANAGE))

const { data: methods, isLoading } = usePayoutMethods()
const { mutate: deleteMethod } = useDeletePayoutMethod()
const { mutateAsync: updateMethod } = useUpdatePayoutMethod()
const reorderError = ref<string | null>(null)

const sortedMethods = computed(() =>
  [...(methods.value ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
)

const hasPayphone = computed(() =>
  sortedMethods.value.some((method) => method.provider === 'payphone'),
)

const STATUS_LABELS: Record<PayoutMethodResponse['status'], string> = {
  pending: 'Pendiente',
  verified: 'Verificado',
  disabled: 'Deshabilitado',
}

const STATUS_TAG_TYPE: Record<PayoutMethodResponse['status'], 'warning' | 'success' | 'default'> = {
  pending: 'warning',
  verified: 'success',
  disabled: 'default',
}

const PROVIDER_LABELS: Record<PayoutMethodResponse['provider'], string> = {
  payphone: 'Payphone',
  bank_transfer: 'Transferencia bancaria',
}

const isPayphoneModalOpen = ref(false)
const isBankModalOpen = ref(false)
const editingMethod = ref<PayoutMethodResponse | null>(null)

function openCreate(provider: PayoutMethodResponse['provider']) {
  editingMethod.value = null
  if (provider === 'payphone') isPayphoneModalOpen.value = true
  else isBankModalOpen.value = true
}

function openEdit(method: PayoutMethodResponse) {
  editingMethod.value = method
  if (method.provider === 'payphone') isPayphoneModalOpen.value = true
  else isBankModalOpen.value = true
}

function removeMethod(id: string) {
  deleteMethod({ id }, {
    onSuccess: () => message.success('Método de cobro eliminado'),
  })
}

async function moveMethod(method: PayoutMethodResponse, direction: -1 | 1) {
  const list = sortedMethods.value
  const index = list.findIndex((m) => m.id === method.id)
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= list.length) return
  const target = list[targetIndex]!
  reorderError.value = null
  try {
    await updateMethod({ id: method.id, payload: { sortOrder: target.sortOrder } })
    await updateMethod({ id: target.id, payload: { sortOrder: method.sortOrder } })
  } catch {
    reorderError.value = 'No pudimos cambiar el orden. Intenta nuevamente.'
  }
}
</script>

<template>
  <NCard title="Cobros" class="payout-section">
    <NAlert
      v-if="!isLoading && !hasPayphone"
      type="warning"
      :show-icon="true"
      class="payout-section__error"
    >
      Necesitas una cuenta Payphone verificada para poder publicar eventos y cobrar con tarjeta.
    </NAlert>

    <NFlex v-if="canManagePayouts" :size="8" class="payout-section__actions">
      <NButton size="small" @click="openCreate('payphone')">Agregar cuenta Payphone</NButton>
      <NButton size="small" @click="openCreate('bank_transfer')">
        Agregar transferencia bancaria
      </NButton>
    </NFlex>

    <NAlert
      v-if="reorderError"
      type="error"
      :show-icon="true"
      class="payout-section__error"
      data-test="reorder-error"
    >
      {{ reorderError }}
    </NAlert>

    <NSpin v-if="isLoading" size="small" />

    <NEmpty v-else-if="sortedMethods.length === 0" description="No hay métodos de cobro" />

    <NFlex v-else vertical :size="12">
      <div v-for="(method, index) in sortedMethods" :key="method.id" class="payout-method-row">
        <div class="payout-method-row__info">
          <strong>{{ PROVIDER_LABELS[method.provider] }}</strong>
          <NTag :type="STATUS_TAG_TYPE[method.status]" size="small">
            {{ STATUS_LABELS[method.status] }}
          </NTag>
          <span v-if="method.provider === 'payphone'" class="payout-method-row__detail">
            Recibes los pagos en {{ method.receiverIdentifier }}
          </span>
          <span v-else class="payout-method-row__detail">
            {{ method.bankName }} · {{ method.accountNumber }}
          </span>
        </div>

        <NFlex v-if="canManagePayouts" :size="4">
          <NButton size="tiny" quaternary :disabled="index === 0" @click="moveMethod(method, -1)">
            <template #icon><NIcon :component="ArrowUpOutline" /></template>
          </NButton>
          <NButton
            size="tiny"
            quaternary
            :disabled="index === sortedMethods.length - 1"
            @click="moveMethod(method, 1)"
          >
            <template #icon><NIcon :component="ArrowDownOutline" /></template>
          </NButton>
          <NButton size="tiny" @click="openEdit(method)">Editar</NButton>
          <NPopconfirm @positive-click="removeMethod(method.id)">
            <template #trigger>
              <NButton size="tiny">Eliminar</NButton>
            </template>
            ¿Eliminar este método de cobro?
          </NPopconfirm>
        </NFlex>
      </div>
    </NFlex>

    <PayphoneMethodModal
      v-model:show="isPayphoneModalOpen"
      :method="editingMethod"
      :whatsapp-number="props.whatsappNumber"
    />
    <BankTransferMethodModal v-model:show="isBankModalOpen" :method="editingMethod" />
  </NCard>
</template>

<style scoped src="./payout-section.css"></style>
