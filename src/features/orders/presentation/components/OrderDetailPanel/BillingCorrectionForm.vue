<script setup lang="ts">
import { NAlert, NButton, NFormItem, NInput, NRadioButton, NRadioGroup } from 'naive-ui'

import { useBillingAccountForm } from '@/features/account/composables/use-billing-account-form'
import {
  BILLING_ID_TYPE_OPTIONS,
  billingAccountFieldValidators as v,
} from '@/features/account/constants/billing-account-form.schema'
import type { ICreateBillingAccountRequest } from '@/features/account/types/requests/billing-account.request'
import type { IBillingServerError } from '@/features/account/utils/billing-server-error'
import { fieldInput, fieldStatus } from '@/shared/utils/form.utils'

// The organizer corrects the billing data of an invoice. The panel keeps its own look: the
// client billing form has another one.
const props = withDefaults(
  defineProps<{
    initial: ICreateBillingAccountRequest
    submitLabel: string
    submitting?: boolean
    serverError?: IBillingServerError | null
  }>(),
  { serverError: null },
)

const emit = defineEmits<{
  submit: [request: ICreateBillingAccountRequest]
  cancel: []
}>()

const { form, idType, idNumberError, alertError, idNumberValidator, idNumberPlaceholder } =
  useBillingAccountForm({
    mode: 'correct',
    needsConsent: false,
    prefill: { legalName: props.initial.legalName, email: props.initial.email },
    initial: props.initial,
    serverError: () => props.serverError,
    onSaved: () => {},
    onSubmit: (request) => emit('submit', request),
  })
</script>

<template>
  <form
    class="billing-correction-form"
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

    <NAlert v-if="alertError" type="error" class="billing-correction-form__alert">
      {{ alertError }}
    </NAlert>

    <div class="billing-correction-form__actions">
      <NButton
        type="primary"
        size="large"
        block
        attr-type="submit"
        data-test="billing-submit"
        :loading="submitting"
      >
        {{ submitLabel }}
      </NButton>
      <NButton quaternary block @click="emit('cancel')">Cancelar</NButton>
    </div>
  </form>
</template>

<style scoped src="./billing-correction-form.css" />
