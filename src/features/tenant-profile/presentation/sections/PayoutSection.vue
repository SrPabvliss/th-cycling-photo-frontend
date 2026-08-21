<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton, NCard, NEmpty, NFlex, NIcon, NPopconfirm, NSpin, NTag } from 'naive-ui'
import { ArrowDownOutline, ArrowUpOutline } from '@vicons/ionicons5'

import { PERMISSIONS } from '@/core/auth/permissions'
import { usePermissions } from '@/core/auth/use-permissions'
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
    <NFlex v-if="canManagePayouts" :size="8" style="margin-bottom: 16px">
      <NButton size="small" @click="openCreate('payphone')">Agregar cuenta Payphone</NButton>
      <NButton size="small" @click="openCreate('bank_transfer')">
        Agregar transferencia bancaria
      </NButton>
    </NFlex>

    <p v-if="reorderError" style="color: #d03050; font-size: 13px; margin-top: -8px">
      {{ reorderError }}
    </p>

    <NSpin v-if="isLoading" size="small" />

    <NEmpty v-else-if="sortedMethods.length === 0" description="No hay métodos de cobro" />

    <NFlex v-else vertical :size="12">
      <div v-for="(method, index) in sortedMethods" :key="method.id" class="payout-method-row">
        <div class="payout-method-row__info">
          <strong>{{ PROVIDER_LABELS[method.provider] }}</strong>
          <NTag :type="STATUS_TAG_TYPE[method.status]" size="small">
            {{ STATUS_LABELS[method.status] }}
          </NTag>
          <span v-if="method.provider === 'payphone'">{{ method.receiverIdentifier }}</span>
          <span v-else>{{ method.bankName }} · {{ method.accountNumber }}</span>
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
          <NPopconfirm @positive-click="deleteMethod(method.id)">
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

<style scoped>
.payout-method-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  flex-wrap: wrap;
}

.payout-method-row__info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
