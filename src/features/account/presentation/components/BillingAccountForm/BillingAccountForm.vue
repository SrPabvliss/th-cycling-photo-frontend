<script setup lang="ts">
import { ref } from 'vue'
import { NAlert, NButton, NCheckbox, NFormItem, NInput, NRadioButton, NRadioGroup } from 'naive-ui'

import { fieldInput, fieldStatus } from '@/shared/utils/form.utils'
import {
  useBillingAccountForm,
  type BillingFormMode,
} from '../../../composables/use-billing-account-form'
import {
  BILLING_ID_TYPE_OPTIONS,
  billingAccountFieldValidators as v,
} from '../../../constants/billing-account-form.schema'
import { INVOICE_CONSENT } from '../../../constants/invoice-consent'
import type { IBillingServerError } from '../../../utils/billing-server-error'
import type { ICreateBillingAccountRequest } from '../../../types/requests/billing-account.request'

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

const showConsentDetails = ref(false)
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
    <p v-if="isEditing" class="billing-account-form__note" data-test="billing-edit-note">
      Los cambios aplican a tus próximas compras.
    </p>

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
            :placeholder="idNumberPlaceholder"
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
        :loading="submitting || isSaving"
      >
        {{ submitLabel }}
      </NButton>
      <NButton quaternary block @click="emit('cancel')">Cancelar</NButton>
    </div>
  </form>
</template>

<style scoped src="./billing-account-form.css" />
