<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NCheckbox } from 'naive-ui'

import { INVOICE_CONSENT } from '@/features/account/constants/invoice-consent'
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
  needsConsent: boolean
}>()

const consented = defineModel<boolean>('consented', { required: true })

const emit = defineEmits<{
  add: []
  change: []
}>()

const selected = computed(
  () => props.accounts.find((account) => account.id === props.selectedId) ?? null,
)
</script>

<template>
  <section class="billing-card" :class="{ 'billing-card--empty': !selected }">
    <template v-if="!selected">
      <h3 class="billing-card__title">Datos de facturación</h3>
      <p class="billing-card__hint">Necesitamos tus datos para enviarte la factura electrónica.</p>
      <NButton type="primary" block data-test="billing-add" @click="emit('add')">
        Agregar datos de facturación
      </NButton>
    </template>

    <template v-else>
      <div class="billing-card__head">
        <h3 class="billing-card__title">Factura a</h3>
        <button
          type="button"
          class="billing-card__link"
          data-test="billing-change"
          @click="emit('change')"
        >
          Cambiar
        </button>
      </div>
      <strong class="billing-card__name">{{ selected.legalName }}</strong>
      <span class="billing-card__line">
        {{ ID_TYPE_LABELS[selected.idType] }} {{ selected.idNumber }}
      </span>
      <span class="billing-card__line">{{ selected.email }}</span>

      <NCheckbox
        v-if="needsConsent"
        v-model:checked="consented"
        class="billing-card__consent"
        data-test="billing-card-consent"
      >
        {{ INVOICE_CONSENT.CHECKBOX }}
      </NCheckbox>
    </template>
  </section>
</template>

<style scoped src="./billing-card.css" />
