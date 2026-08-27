<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'
import { NIcon } from 'naive-ui'
import { isAxiosError } from 'axios'
import { ShieldCheckmarkOutline } from '@vicons/ionicons5'
import IntlTelInput from 'intl-tel-input/vueWithUtils'
import 'intl-tel-input/styles'

import { PHONE_INPUT_OPTIONS } from '@/shared/constants/phone-input'
import { isPhoneValid } from '@/shared/utils/phone.utils'
import { useVerifyPayoutReceiver } from '@/features/tenant-profile/composables/mutations/use-verify-payout-receiver'
import type {
  IPayphoneDraft,
  PayphoneVerificationState,
} from '../../../composables/use-configuration-items'
import ConfigField from './ConfigField.vue'
import RemovePayoutCheck from './RemovePayoutCheck.vue'
import SaveToProfileCheck from './SaveToProfileCheck.vue'
import SourceChoice from './SourceChoice.vue'

const VERIFY_DEBOUNCE_MS = 400

const NOT_REGISTERED_MESSAGE = 'Ese número no está registrado en Payphone. Revísalo o usa otro.'
const INVALID_PHONE_MESSAGE =
  'Ese número no tiene un formato válido. Escríbelo como 09 seguido de ocho dígitos.'
const GENERIC_MESSAGE = 'No pudimos verificar ese número con Payphone. Intenta nuevamente.'

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
    draft: IPayphoneDraft
  }>(),
  { showSaveToProfile: true, removable: false, isRemoved: false, removeDisabledReason: null },
)

const emit = defineEmits<{
  'update:use-profile': [boolean]
  'update:save-to-profile': [boolean]
  'update:removed': [boolean]
  'update:draft': [Partial<IPayphoneDraft>]
}>()

const { mutate: verify, isPending, data, error, reset } = useVerifyPayoutReceiver()

function isInvalidPhone(caught: unknown): boolean {
  if (!isAxiosError(caught)) return false
  return caught.response?.data?.error?.messageKey === 'payment.invalid_phone'
}

const liveVerification = computed<PayphoneVerificationState>(() => {
  if (isPending.value) return 'pending'
  if (error.value) return isInvalidPhone(error.value) ? 'invalid' : 'rejected'
  if (data.value) return data.value.registered ? 'verified' : 'rejected'
  return 'idle'
})

const verification = computed<PayphoneVerificationState>(() => {
  if (liveVerification.value !== 'idle') return liveVerification.value
  return props.draft.verification === 'pending' ? 'idle' : props.draft.verification
})

const isFormatInvalid = computed(() => props.draft.phone !== '' && !isPhoneValid(props.draft.phone))

const errorMessage = computed(() => {
  if (isFormatInvalid.value) return INVALID_PHONE_MESSAGE
  if (verification.value !== 'rejected' && verification.value !== 'invalid') return null
  if (verification.value === 'invalid') return INVALID_PHONE_MESSAGE
  return error.value ? GENERIC_MESSAGE : NOT_REGISTERED_MESSAGE
})

const isVerified = computed(() => verification.value === 'verified' && !isFormatInvalid.value)

const inputState = computed<'' | 'bad' | 'good'>(() => {
  if (isVerified.value) return 'good'
  if (errorMessage.value) return 'bad'
  return ''
})

watch(liveVerification, (value) => emit('update:draft', { verification: value }))

let timer: ReturnType<typeof setTimeout> | null = null

function clearTimer() {
  if (timer !== null) clearTimeout(timer)
  timer = null
}

function onPhoneInput(value: string) {
  if (value === props.draft.phone) return
  clearTimer()
  reset()
  emit('update:draft', { phone: value, verification: 'idle' })
}

function onPhoneBlur() {
  clearTimer()
  timer = setTimeout(() => {
    const phone = props.draft.phone.trim()
    if (!isPhoneValid(phone)) return
    verify(phone)
  }, VERIFY_DEBOUNCE_MS)
}

onBeforeUnmount(clearTimer)
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
    <ConfigField
      label="Número registrado en Payphone"
      hint="Verificamos con Payphone que el número esté registrado como receptor de pagos."
      :pending="verification === 'pending' ? 'Verificando con Payphone…' : null"
      :error="errorMessage"
      :ok="isVerified ? 'Número verificado con Payphone' : null"
    >
      <div
        class="tt-phone-input"
        :class="inputState"
        data-test="payphone-input"
        @focusout="onPhoneBlur"
      >
        <IntlTelInput
          :options="PHONE_INPUT_OPTIONS"
          :value="draft.phone"
          :input-props="{ placeholder: 'Ej. 99 123 4567' }"
          @change-number="onPhoneInput"
        />
      </div>
    </ConfigField>

    <SaveToProfileCheck
      v-if="showSaveToProfile"
      :model-value="saveToProfile"
      :has-profile-value="hasProfileValue"
      @update:model-value="emit('update:save-to-profile', $event)"
    />

    <span
      v-if="showSaveToProfile && saveToProfile"
      class="ce-pass"
      data-test="payphone-password-note"
    >
      <NIcon :component="ShieldCheckmarkOutline" :size="14" />
      Crear este método pedirá tu contraseña al continuar
    </span>
  </template>
</template>

<style scoped src="./payphone-body.css" />
