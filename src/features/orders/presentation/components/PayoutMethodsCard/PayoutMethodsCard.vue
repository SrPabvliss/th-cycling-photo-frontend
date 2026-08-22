<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
import { CopyOutline } from '@vicons/ionicons5'
import { useClipboard } from '@vueuse/core'

import type { IOrderPayoutMethod } from '../../../types/responses/order-detail.response'

defineProps<{
  methods: IOrderPayoutMethod[]
}>()

const ACCOUNT_TYPE_LABELS: Record<NonNullable<IOrderPayoutMethod['accountType']>, string> = {
  ahorros: 'Ahorros',
  corriente: 'Corriente',
}

const { copy, copied, text: copiedValue } = useClipboard()

function copyValue(value: string) {
  copy(value)
}
</script>

<template>
  <div class="pm-card">
    <div class="pm-card__header">
      <span class="pm-card__title">Datos de cobro de este evento</span>
    </div>

    <div v-for="(method, index) in methods" :key="index" class="pm-card__method">
      <template v-if="method.provider === 'bank_transfer'">
        <div v-if="method.bankName" class="pm-card__row">
          <span class="pm-card__label">Banco</span>
          <span class="pm-card__value">{{ method.bankName }}</span>
        </div>
        <div v-if="method.accountNumber" class="pm-card__row">
          <span class="pm-card__label">Número de cuenta</span>
          <span class="pm-card__value">{{ method.accountNumber }}</span>
          <NButton size="tiny" quaternary @click="copyValue(method.accountNumber)">
            <template #icon><NIcon :component="CopyOutline" /></template>
            {{ copied && copiedValue === method.accountNumber ? 'Copiado' : 'Copiar' }}
          </NButton>
        </div>
        <div v-if="method.accountType" class="pm-card__row">
          <span class="pm-card__label">Tipo de cuenta</span>
          <span class="pm-card__value">{{ ACCOUNT_TYPE_LABELS[method.accountType] }}</span>
        </div>
        <div v-if="method.accountHolder" class="pm-card__row">
          <span class="pm-card__label">Titular</span>
          <span class="pm-card__value">{{ method.accountHolder }}</span>
        </div>
        <div v-if="method.holderIdentification" class="pm-card__row">
          <span class="pm-card__label">Identificación</span>
          <span class="pm-card__value">{{ method.holderIdentification }}</span>
        </div>
      </template>

      <template v-else-if="method.provider === 'payphone' && method.receiverIdentifier">
        <div class="pm-card__row">
          <span class="pm-card__label">Número PayPhone</span>
          <span class="pm-card__value">{{ method.receiverIdentifier }}</span>
          <NButton size="tiny" quaternary @click="copyValue(method.receiverIdentifier)">
            <template #icon><NIcon :component="CopyOutline" /></template>
            {{ copied && copiedValue === method.receiverIdentifier ? 'Copiado' : 'Copiar' }}
          </NButton>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped src="./payout-methods-card.css" />
