<script setup lang="ts">
import { computed, ref } from 'vue'
import { useForm } from '@tanstack/vue-form'
import { NAlert, NButton, NCheckbox, NFormItem, NInput, NRadioButton, NRadioGroup } from 'naive-ui'

import { fieldInput, fieldStatus } from '@/shared/utils/form.utils'
import { useCreateBillingAccount } from '@/features/account/composables/mutations/use-create-billing-account'
import { useRecordInvoiceConsent } from '@/features/account/composables/mutations/use-record-invoice-consent'
import {
  BILLING_ID_TYPE_OPTIONS,
  billingAccountFieldValidators as v,
  ID_NUMBER_FORMAT_MESSAGE,
  type IBillingAccountFormData,
} from '../../../constants/billing-account-form.schema'
import { INVOICE_CONSENT } from '../../../constants/invoice-consent'
import { isWellFormedIdNumber, normalizeIdNumber } from '../../../utils/billing-identification'
import {
  identificationMessageOf,
  readBillingServerError,
  type IBillingServerError,
} from '../../../utils/billing-server-error'
import type { ICreateBillingAccountRequest } from '../../../types/requests/billing-account.request'

const props = withDefaults(
  defineProps<{
    needsConsent: boolean
    prefill: { legalName: string; email: string }
    mode?: 'create' | 'correct'
    initial?: ICreateBillingAccountRequest
    submitLabel?: string
    submitting?: boolean
    serverError?: IBillingServerError | null
  }>(),
  { mode: 'create', initial: undefined, submitLabel: 'Guardar y usar', serverError: null },
)

const emit = defineEmits<{
  saved: [id: string]
  submit: [request: ICreateBillingAccountRequest]
  cancel: []
}>()

const isCorrecting = props.mode === 'correct'
const asksConsent = !isCorrecting && props.needsConsent
const recordInvoiceConsent = useRecordInvoiceConsent()
const createBillingAccount = useCreateBillingAccount()

const idNumberServerError = ref<string | null>(null)
const createError = ref<string | null>(null)
const showConsentDetails = ref(false)

const CREATE_FALLBACK = 'No pudimos guardar tus datos de facturación. Intenta de nuevo.'

const serverIdNumberError = computed(() =>
  props.serverError ? identificationMessageOf(props.serverError) : null,
)

const idNumberError = computed(() => idNumberServerError.value ?? serverIdNumberError.value)

const alertError = computed(() => {
  if (createError.value) return createError.value
  return props.serverError && !serverIdNumberError.value ? props.serverError.message : null
})

function toRequest(value: IBillingAccountFormData): ICreateBillingAccountRequest {
  const address = value.address.trim()
  return {
    idType: value.idType,
    idNumber: normalizeIdNumber(value.idType, value.idNumber),
    legalName: value.legalName.trim(),
    email: value.email.trim(),
    ...(address ? { address } : {}),
  }
}

const form = useForm({
  defaultValues: {
    idType: props.initial?.idType ?? 'national_id',
    idNumber: props.initial?.idNumber ?? '',
    legalName: props.initial?.legalName ?? props.prefill.legalName,
    email: props.initial?.email ?? props.prefill.email,
    address: props.initial?.address ?? '',
    consent: false,
  } as IBillingAccountFormData,
  onSubmit: async ({ value }) => {
    if (isCorrecting) {
      emit('submit', toRequest(value))
      return
    }
    idNumberServerError.value = null
    createError.value = null
    try {
      if (asksConsent) await recordInvoiceConsent.mutateAsync()
      const created = await createBillingAccount.mutateAsync(toRequest(value))
      emit('saved', created.id)
    } catch (caught) {
      const serverError = readBillingServerError(caught, CREATE_FALLBACK)
      const identificationMessage = identificationMessageOf(serverError)
      if (identificationMessage) idNumberServerError.value = identificationMessage
      else createError.value = serverError.message
    }
  },
})

const idType = form.useStore((state) => state.values.idType)

function idNumberValidator({ value }: { value: string }) {
  return isWellFormedIdNumber(idType.value, normalizeIdNumber(idType.value, value))
    ? undefined
    : ID_NUMBER_FORMAT_MESSAGE
}

function idNumberPlaceholder(): string {
  if (idType.value === 'ruc') return '13 dígitos'
  if (idType.value === 'passport') return 'Letras y números'
  return '10 dígitos'
}
</script>

<template>
  <form
    class="billing-account-form"
    @submit="
      (e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }
    "
  >
    <form.Field name="idType">
      <template v-slot="{ field }">
        <NFormItem label="Tipo de identificación" required>
          <NRadioGroup
            :value="field.state.value"
            size="medium"
            data-test="billing-id-type"
            @update:value="field.handleChange"
          >
            <NRadioButton
              v-for="option in BILLING_ID_TYPE_OPTIONS"
              :key="option.value"
              :value="option.value"
              :label="option.label"
            />
          </NRadioGroup>
        </NFormItem>
      </template>
    </form.Field>

    <form.Field
      name="idNumber"
      :validators="{ onBlur: idNumberValidator, onSubmit: idNumberValidator }"
    >
      <template v-slot="{ field }">
        <NFormItem
          label="Número"
          required
          v-bind="fieldStatus(field)"
          :validation-status="idNumberError ? 'error' : fieldStatus(field).validationStatus"
          :feedback="idNumberError ?? fieldStatus(field).feedback"
        >
          <NInput
            data-test="billing-id-number"
            :placeholder="idNumberPlaceholder()"
            :input-props="{
              inputmode: idType === 'passport' ? 'text' : 'numeric',
              autocomplete: 'off',
            }"
            v-bind="fieldInput(field)"
          />
        </NFormItem>
      </template>
    </form.Field>

    <form.Field name="legalName" :validators="{ onBlur: v.legalName, onSubmit: v.legalName }">
      <template v-slot="{ field }">
        <NFormItem label="Nombres y apellidos / razón social" required v-bind="fieldStatus(field)">
          <NInput data-test="billing-legal-name" v-bind="fieldInput(field)" />
        </NFormItem>
      </template>
    </form.Field>

    <form.Field name="email" :validators="{ onBlur: v.email, onSubmit: v.email }">
      <template v-slot="{ field }">
        <NFormItem label="Correo donde llega la factura" required v-bind="fieldStatus(field)">
          <NInput
            data-test="billing-email"
            :input-props="{ type: 'email', inputmode: 'email', autocomplete: 'email' }"
            v-bind="fieldInput(field)"
          />
        </NFormItem>
      </template>
    </form.Field>

    <form.Field name="address" :validators="{ onSubmit: v.address }">
      <template v-slot="{ field }">
        <NFormItem label="Dirección (opcional)" v-bind="fieldStatus(field)">
          <NInput data-test="billing-address" v-bind="fieldInput(field)" />
        </NFormItem>
      </template>
    </form.Field>

    <form.Field v-if="asksConsent" name="consent" :validators="{ onSubmit: v.consent }">
      <template v-slot="{ field }">
        <NFormItem :show-label="false" v-bind="fieldStatus(field)">
          <div class="billing-account-form__consent">
            <NCheckbox
              data-test="billing-consent"
              :checked="field.state.value"
              @update:checked="field.handleChange"
            >
              {{ INVOICE_CONSENT.CHECKBOX }}
            </NCheckbox>
            <button
              type="button"
              class="billing-account-form__more"
              @click="showConsentDetails = !showConsentDetails"
            >
              {{ INVOICE_CONSENT.MORE_INFO }}
            </button>
            <div v-if="showConsentDetails" class="billing-account-form__details">
              <p v-for="paragraph in INVOICE_CONSENT.DETAILS" :key="paragraph">{{ paragraph }}</p>
            </div>
          </div>
        </NFormItem>
      </template>
    </form.Field>

    <NAlert v-if="alertError" type="error" class="billing-account-form__alert">
      {{ alertError }}
    </NAlert>

    <div class="billing-account-form__actions">
      <NButton
        type="primary"
        size="large"
        block
        attr-type="submit"
        data-test="billing-submit"
        :loading="
          submitting || recordInvoiceConsent.isPending.value || createBillingAccount.isPending.value
        "
      >
        {{ submitLabel }}
      </NButton>
      <NButton quaternary block @click="emit('cancel')">Cancelar</NButton>
    </div>
  </form>
</template>

<style scoped src="./billing-account-form.css" />
