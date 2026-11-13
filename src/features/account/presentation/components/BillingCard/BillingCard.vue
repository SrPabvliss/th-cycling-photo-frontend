<script setup lang="ts">
import { computed } from 'vue'

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

const emailParts = computed(() => {
  const email = selected.value?.email ?? ''
  const at = email.indexOf('@')
  return at > 0
    ? { local: email.slice(0, at), domain: email.slice(at) }
    : { local: email, domain: '' }
})
</script>

<template>
  <section class="billing-card" :class="{ 'billing-card--empty': !selected }">
    <template v-if="!selected">
      <span class="billing-card__eyebrow">Datos de facturación</span>
      <p class="billing-card__hint">Necesitamos tus datos para enviarte la factura electrónica.</p>
      <button type="button" class="billing-card__add" data-test="billing-add" @click="emit('add')">
        Agregar datos de facturación
      </button>
    </template>

    <template v-else>
      <div class="billing-card__head">
        <span class="billing-card__eyebrow">Factura a</span>
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
      <!-- A long email breaks at the @, not wherever the line ends. -->
      <span class="billing-card__line billing-card__email" data-test="billing-email"
        >{{ emailParts.local }}<wbr />{{ emailParts.domain }}</span
      >

      <!-- The api will not create an order without this consent: it is asked here when the
           buyer has billing data but never gave it. -->
      <label v-if="needsConsent" class="billing-card__consent" data-test="billing-card-consent">
        <input v-model="consented" type="checkbox" class="billing-card__check" />
        <span>{{ INVOICE_CONSENT.CHECKBOX }}</span>
      </label>
    </template>
  </section>
</template>

<style scoped>
.billing-card {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-1);
  padding: var(--tt-space-3) var(--tt-space-4);
  border-radius: var(--tt-radius-l);
  background: var(--tt-surface-raised);
  box-shadow: var(--tt-card-edge), var(--tt-shadow-2);
  color: var(--tt-ink);
  font-family: var(--tt-font-sans);
}

.billing-card--empty {
  gap: var(--tt-space-2);
}

.billing-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.billing-card__eyebrow {
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-eyebrow-size);
  line-height: var(--tt-type-eyebrow-line);
  font-weight: var(--tt-type-eyebrow-weight);
  letter-spacing: var(--tt-type-eyebrow-tracking);
  text-transform: uppercase;
}

.billing-card__hint,
.billing-card__line {
  margin: 0;
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
  overflow-wrap: anywhere;
}

/* Inside a word only when even the part after the @ does not fit. */
.billing-card__email {
  overflow-wrap: break-word;
}

.billing-card__name {
  font-size: var(--tt-type-body-size);
  font-weight: var(--tt-type-body-medium-weight);
}

.billing-card__link {
  min-block-size: var(--tt-space-6);
  padding: 0;
  border: 0;
  background: none;
  color: var(--tt-primary-ink);
  font-family: inherit;
  font-size: var(--tt-type-body-s-medium-size);
  font-weight: var(--tt-type-title-weight);
  cursor: pointer;
}

.billing-card__add {
  block-size: var(--tt-control-m);
  margin-block-start: var(--tt-space-2);
  border: 0;
  border-radius: var(--tt-radius-m);
  background: var(--tt-primary);
  color: var(--tt-on-primary);
  font-family: inherit;
  font-size: var(--tt-type-body-s-medium-size);
  font-weight: var(--tt-type-title-weight);
  cursor: pointer;
}

.billing-card__consent {
  display: flex;
  align-items: flex-start;
  gap: var(--tt-space-2);
  margin-block-start: var(--tt-space-2);
  padding: var(--tt-space-3);
  border-radius: var(--tt-radius-m);
  background: var(--tt-primary-soft);
  color: var(--tt-ink);
  font-size: var(--tt-type-body-s-size);
  line-height: var(--tt-type-body-s-line);
  cursor: pointer;
}

.billing-card__check {
  flex: none;
  inline-size: var(--tt-icon-m);
  block-size: var(--tt-icon-m);
  margin: calc(var(--tt-space-1) / 2) 0 0;
  accent-color: var(--tt-primary);
}
</style>
