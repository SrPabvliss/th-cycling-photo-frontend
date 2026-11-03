<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NCheckbox, NRadio, NRadioGroup, NTag } from 'naive-ui'

import type {
  BillingIdType,
  IBillingAccount,
} from '@/features/account/types/responses/billing-account.response'

const ID_TYPE_LABELS: Record<BillingIdType, string> = {
  national_id: 'Cédula',
  ruc: 'RUC',
  passport: 'Pasaporte',
}

const props = defineProps<{
  accounts: IBillingAccount[]
  selectedId: string | null
  isSaving: boolean
}>()

const emit = defineEmits<{
  choose: [payload: { id: string; makeDefault: boolean }]
  add: []
}>()

const chosenId = ref<string | null>(props.selectedId)
const makeDefault = ref(false)

function confirm() {
  if (!chosenId.value) return
  emit('choose', { id: chosenId.value, makeDefault: makeDefault.value })
}
</script>

<template>
  <div class="billing-picker">
    <NRadioGroup v-model:value="chosenId" class="billing-picker__list">
      <label
        v-for="account in accounts"
        :key="account.id"
        class="billing-picker__account"
        :class="{ 'billing-picker__account--selected': chosenId === account.id }"
      >
        <NRadio :value="account.id" :data-test="`billing-option-${account.id}`" />
        <span class="billing-picker__text">
          <strong>{{ account.legalName }}</strong>
          <NTag
            v-if="account.isDefault"
            class="billing-picker__badge"
            size="small"
            round
            type="info"
            :bordered="false"
          >
            predeterminada
          </NTag>
          <span>{{ ID_TYPE_LABELS[account.idType] }} {{ account.idNumber }}</span>
          <span>{{ account.email }}</span>
        </span>
      </label>
    </NRadioGroup>

    <button
      type="button"
      class="billing-picker__add"
      data-test="billing-picker-add"
      @click="emit('add')"
    >
      + Agregar otros datos
    </button>

    <NCheckbox v-model:checked="makeDefault" class="billing-picker__default">
      Usar siempre esta cuenta
    </NCheckbox>

    <NButton
      type="primary"
      size="large"
      block
      :disabled="!chosenId"
      :loading="isSaving"
      data-test="billing-picker-use"
      @click="confirm"
    >
      Usar para este pedido
    </NButton>
  </div>
</template>

<style scoped>
.billing-picker {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.billing-picker__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.billing-picker__account {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
}

.billing-picker__account--selected {
  border-color: #2080f0;
  background: #f3f8ff;
}

.billing-picker__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
  color: #6b7280;
  min-width: 0;
  overflow-wrap: anywhere;
}

.billing-picker__badge {
  align-self: flex-start;
}

.billing-picker__text strong {
  color: #1a1f2c;
  font-size: 14px;
}

.billing-picker__add {
  align-self: flex-start;
  padding: 4px 0;
  border: none;
  background: none;
  color: #2080f0;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
</style>
