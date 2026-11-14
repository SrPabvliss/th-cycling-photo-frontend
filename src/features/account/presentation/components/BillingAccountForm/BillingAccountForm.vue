<script setup lang="ts">
import { ref, useId } from 'vue'
import { NButton } from 'naive-ui'

import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
import FormField from '@/shared/components/form/FormField/FormField.vue'
import { fieldErrorText, sendClientForm } from '@/shared/utils/form.utils'
import {
  useBillingAccountForm,
  type BillingFormMode,
} from '../../../composables/use-billing-account-form'
import {
  BILLING_ID_TYPE_OPTIONS,
  billingAccountFieldValidators as v,
} from '../../../constants/billing-account-form.schema'
import { INVOICE_CONSENT } from '../../../constants/invoice-consent'
import type { ICreateBillingAccountRequest } from '../../../types/requests/billing-account.request'
import type { BillingIdType } from '../../../types/responses/billing-account.response'
import type { IBillingServerError } from '../../../utils/billing-server-error'

const props = withDefaults(
  defineProps<{
    needsConsent: boolean
    prefill: { legalName: string; email: string }
    mode?: BillingFormMode
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

const {
  form,
  idType,
  isEditing,
  asksConsent,
  idNumberError,
  alertError,
  isSaving,
  idNumberValidator,
  idNumberPlaceholder,
} = useBillingAccountForm({
  mode: props.mode,
  needsConsent: props.needsConsent,
  prefill: props.prefill,
  initial: props.initial,
  serverError: () => props.serverError,
  onSaved: (id) => emit('saved', id),
  onSubmit: (request) => emit('submit', request),
})

const uid = useId()
const ids = {
  idType: `${uid}-id-type`,
  idNumber: `${uid}-id-number`,
  legalName: `${uid}-legal-name`,
  email: `${uid}-email`,
  address: `${uid}-address`,
  consent: `${uid}-consent`,
  consentError: `${uid}-consent-error`,
  consentDetails: `${uid}-consent-details`,
}

const formRef = ref<HTMLFormElement | null>(null)
const submitted = ref(false)
const showConsentDetails = ref(false)

const inputValue = (event: Event) => (event.target as HTMLInputElement).value

async function save() {
  submitted.value = true
  await sendClientForm(form, formRef.value)
}
</script>

<template>
  <form ref="formRef" class="billing-form" novalidate @submit.prevent="save">
    <p v-if="isEditing" class="billing-form__note" data-test="billing-edit-note">
      Los cambios aplican a tus próximas compras.
    </p>

    <form.Field name="idType">
      <template #default="{ field }">
        <fieldset class="billing-form__kinds" data-test="billing-id-type">
          <legend class="billing-form__label">Tipo de identificación</legend>
          <div class="billing-form__segments">
            <label
              v-for="option in BILLING_ID_TYPE_OPTIONS"
              :key="option.value"
              class="billing-form__segment"
            >
              <input
                type="radio"
                :name="ids.idType"
                :value="option.value"
                :checked="field.state.value === option.value"
                @change="field.handleChange(option.value as BillingIdType)"
              />
              <span>{{ option.label }}</span>
            </label>
          </div>
        </fieldset>
      </template>
    </form.Field>

    <form.Field name="idNumber" :validators="{ onSubmit: idNumberValidator }">
      <template #default="{ field }">
        <FormField
          :id="ids.idNumber"
          label="Número"
          :error="idNumberError ?? fieldErrorText(field, submitted)"
        >
          <template #default="{ id, describedby, invalid }">
            <input
              :id="id"
              data-test="billing-id-number"
              autocomplete="off"
              :inputmode="idType === 'passport' ? 'text' : 'numeric'"
              :placeholder="idNumberPlaceholder"
              :aria-describedby="describedby"
              :aria-invalid="invalid"
              :value="field.state.value"
              @input="field.handleChange(inputValue($event))"
              @blur="field.handleBlur"
            />
          </template>
        </FormField>
      </template>
    </form.Field>

    <form.Field name="legalName" :validators="{ onSubmit: v.legalName }">
      <template #default="{ field }">
        <FormField
          :id="ids.legalName"
          label="Nombres y apellidos o razón social"
          :error="fieldErrorText(field, submitted)"
        >
          <template #default="{ id, describedby, invalid }">
            <input
              :id="id"
              data-test="billing-legal-name"
              autocomplete="name"
              :aria-describedby="describedby"
              :aria-invalid="invalid"
              :value="field.state.value"
              @input="field.handleChange(inputValue($event))"
              @blur="field.handleBlur"
            />
          </template>
        </FormField>
      </template>
    </form.Field>

    <form.Field name="email" :validators="{ onSubmit: v.email }">
      <template #default="{ field }">
        <FormField
          :id="ids.email"
          label="Correo donde llega la factura"
          :error="fieldErrorText(field, submitted)"
        >
          <template #default="{ id, describedby, invalid }">
            <input
              :id="id"
              data-test="billing-email"
              type="email"
              inputmode="email"
              autocomplete="email"
              :aria-describedby="describedby"
              :aria-invalid="invalid"
              :value="field.state.value"
              @input="field.handleChange(inputValue($event))"
              @blur="field.handleBlur"
            />
          </template>
        </FormField>
      </template>
    </form.Field>

    <form.Field name="address" :validators="{ onSubmit: v.address }">
      <template #default="{ field }">
        <FormField
          :id="ids.address"
          label="Dirección (opcional)"
          :error="fieldErrorText(field, submitted)"
        >
          <template #default="{ id, describedby, invalid }">
            <input
              :id="id"
              data-test="billing-address"
              autocomplete="street-address"
              :aria-describedby="describedby"
              :aria-invalid="invalid"
              :value="field.state.value"
              @input="field.handleChange(inputValue($event))"
              @blur="field.handleBlur"
            />
          </template>
        </FormField>
      </template>
    </form.Field>

    <form.Field v-if="asksConsent" name="consent" :validators="{ onSubmit: v.consent }">
      <template #default="{ field }">
        <div class="billing-form__consent">
          <label class="billing-form__check">
            <input
              :id="ids.consent"
              type="checkbox"
              data-test="billing-consent"
              :checked="field.state.value"
              :aria-describedby="fieldErrorText(field, submitted) ? ids.consentError : undefined"
              :aria-invalid="fieldErrorText(field, submitted) ? true : undefined"
              @change="field.handleChange(($event.target as HTMLInputElement).checked)"
            />
            <span>{{ INVOICE_CONSENT.CHECKBOX }}</span>
          </label>
          <em
            v-if="fieldErrorText(field, submitted)"
            :id="ids.consentError"
            class="billing-form__error"
          >
            {{ fieldErrorText(field, submitted) }}
          </em>
          <button
            type="button"
            class="billing-form__more"
            data-test="billing-consent-more"
            :aria-expanded="showConsentDetails ? 'true' : 'false'"
            :aria-controls="ids.consentDetails"
            @click="showConsentDetails = !showConsentDetails"
          >
            {{ INVOICE_CONSENT.MORE_INFO }}
          </button>
          <div v-if="showConsentDetails" :id="ids.consentDetails" class="billing-form__details">
            <p v-for="paragraph in INVOICE_CONSENT.DETAILS" :key="paragraph">{{ paragraph }}</p>
          </div>
        </div>
      </template>
    </form.Field>

    <FormAlert v-if="alertError" tone="bad" :title="alertError" />

    <div class="billing-form__actions">
      <NButton
        type="primary"
        size="large"
        block
        attr-type="submit"
        data-test="billing-submit"
        :loading="submitting || isSaving"
        :aria-busy="submitting || isSaving ? 'true' : undefined"
      >
        {{ submitLabel }}
      </NButton>
      <NButton size="large" block data-test="billing-cancel" @click="emit('cancel')">
        Cancelar
      </NButton>
    </div>
  </form>
</template>

<style scoped src="./billing-account-form.css" />
