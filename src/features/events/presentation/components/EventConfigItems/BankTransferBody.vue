<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { ShieldCheckmarkOutline } from '@vicons/ionicons5'

import { ACCOUNT_TYPE_OPTIONS, BANK_OPTIONS } from '@/shared/constants/payout'
import {
  MAX_ACCOUNT_HOLDER_LENGTH,
  MAX_ACCOUNT_NUMBER_LENGTH,
  MAX_HOLDER_IDENTIFICATION_LENGTH,
  MIN_ACCOUNT_HOLDER_LENGTH,
  MIN_ACCOUNT_NUMBER_LENGTH,
  MIN_BANK_NAME_LENGTH,
  isValidAccountHolder,
  isValidAccountNumber,
  isValidBankName,
  isValidHolderIdentification,
} from '@/shared/utils/payout.validation'
import type { IBankTransferDraft } from '../../../composables/use-configuration-items'
import ConfigComboSelect from './ConfigComboSelect.vue'
import ConfigField from './ConfigField.vue'
import ConfigInput from './ConfigInput.vue'
import ConfigSelect from './ConfigSelect.vue'
import RemovePayoutCheck from './RemovePayoutCheck.vue'
import SaveToProfileCheck from './SaveToProfileCheck.vue'
import SourceChoice from './SourceChoice.vue'

const BANK_NAME_ERROR = `Escribe al menos ${MIN_BANK_NAME_LENGTH} caracteres.`
const ACCOUNT_NUMBER_ERROR = `Solo números, mínimo ${MIN_ACCOUNT_NUMBER_LENGTH} dígitos.`
const ACCOUNT_HOLDER_ERROR = `Escribe al menos ${MIN_ACCOUNT_HOLDER_LENGTH} caracteres.`
const HOLDER_IDENTIFICATION_ERROR = 'Solo números: 10 dígitos de cédula o 13 de RUC.'

const props = withDefaults(
  defineProps<{
    hasProfileValue: boolean
    profileLabel: string
    useProfile: boolean
    saveToProfile: boolean
    showSaveToProfile?: boolean
    removable?: boolean
    isRemoved?: boolean
    removeDisabledReason?: string | null
    draft: IBankTransferDraft
  }>(),
  { showSaveToProfile: true, removable: false, isRemoved: false, removeDisabledReason: null },
)

const emit = defineEmits<{
  'update:use-profile': [boolean]
  'update:save-to-profile': [boolean]
  'update:removed': [boolean]
  'update:draft': [Partial<IBankTransferDraft>]
}>()

function errorFor(value: string, isValid: (candidate: string) => boolean, message: string) {
  return value === '' || isValid(value) ? null : message
}

const bankNameError = computed(() =>
  errorFor(props.draft.bankName, isValidBankName, BANK_NAME_ERROR),
)
const accountNumberError = computed(() =>
  errorFor(props.draft.accountNumber, isValidAccountNumber, ACCOUNT_NUMBER_ERROR),
)
const accountHolderError = computed(() =>
  errorFor(props.draft.accountHolder, isValidAccountHolder, ACCOUNT_HOLDER_ERROR),
)
const holderIdentificationError = computed(() =>
  errorFor(
    props.draft.holderIdentification,
    isValidHolderIdentification,
    HOLDER_IDENTIFICATION_ERROR,
  ),
)
</script>

<template>
  <SourceChoice
    v-if="hasProfileValue"
    :profile-label="profileLabel"
    :use-profile="useProfile"
    @update:use-profile="emit('update:use-profile', $event)"
  />

  <RemovePayoutCheck
    v-if="removable"
    :model-value="isRemoved"
    :disabled-reason="removeDisabledReason"
    @update:model-value="emit('update:removed', $event)"
  />

  <template v-if="!useProfile && !isRemoved">
    <ConfigField label="Banco" :error="bankNameError">
      <ConfigComboSelect
        :model-value="draft.bankName"
        :options="BANK_OPTIONS"
        placeholder="Elige el banco"
        data-test="bank-name-select"
        @update:model-value="emit('update:draft', { bankName: $event })"
      />
    </ConfigField>

    <div class="tt-field-row">
      <ConfigField label="Número de cuenta" half :error="accountNumberError">
        <ConfigInput
          :model-value="draft.accountNumber"
          :state="accountNumberError ? 'bad' : ''"
          :maxlength="MAX_ACCOUNT_NUMBER_LENGTH"
          placeholder="Solo números"
          data-test="bank-account-number"
          @update:model-value="emit('update:draft', { accountNumber: $event })"
        />
      </ConfigField>
      <ConfigField label="Tipo de cuenta" half>
        <ConfigSelect
          :model-value="draft.accountType"
          :options="ACCOUNT_TYPE_OPTIONS"
          placeholder="Ahorros o corriente"
          data-test="bank-account-type"
          @update:model-value="emit('update:draft', { accountType: $event })"
        />
      </ConfigField>
    </div>

    <div class="tt-field-row">
      <ConfigField label="Titular" half :error="accountHolderError">
        <ConfigInput
          :model-value="draft.accountHolder"
          :state="accountHolderError ? 'bad' : ''"
          :maxlength="MAX_ACCOUNT_HOLDER_LENGTH"
          placeholder="Nombre completo"
          data-test="bank-account-holder"
          @update:model-value="emit('update:draft', { accountHolder: $event })"
        />
      </ConfigField>
      <ConfigField label="Cédula o RUC del titular" half :error="holderIdentificationError">
        <ConfigInput
          :model-value="draft.holderIdentification"
          :state="holderIdentificationError ? 'bad' : ''"
          :maxlength="MAX_HOLDER_IDENTIFICATION_LENGTH"
          placeholder="10 o 13 dígitos"
          data-test="bank-holder-identification"
          @update:model-value="emit('update:draft', { holderIdentification: $event })"
        />
      </ConfigField>
    </div>

    <SaveToProfileCheck
      v-if="showSaveToProfile"
      :model-value="saveToProfile"
      :has-profile-value="hasProfileValue"
      @update:model-value="emit('update:save-to-profile', $event)"
    />

    <span v-if="showSaveToProfile && saveToProfile" class="ce-pass" data-test="bank-password-note">
      <NIcon :component="ShieldCheckmarkOutline" :size="14" />
      Crear este método pedirá tu contraseña al continuar
    </span>
  </template>
</template>

<style scoped src="./bank-transfer-body.css" />
