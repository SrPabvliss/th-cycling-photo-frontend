<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NAlert, NButton, NIcon, NInput, NModal } from 'naive-ui'
import { LockClosedOutline, LogoWhatsapp, PhonePortraitOutline } from '@vicons/ionicons5'
import { message } from '@/core/ui/discrete-api'
import { PHONE_INPUT_OPTIONS } from '@/shared/constants/phone-input'
import { formatWhatsAppNumber, isPhoneValid } from '@/shared/utils/phone.utils'
import { readApiErrorMessage, readApiErrorRule } from '../../utils/payout-method.utils'
import { useCreatePayoutMethod } from '../../composables/mutations/use-create-payout-method'
import { useUpdatePayoutMethod } from '../../composables/mutations/use-update-payout-method'
import type { PayoutMethodResponse } from '../../types/responses/payout-method.response'
import IntlTelInput from 'intl-tel-input/vueWithUtils'
import 'intl-tel-input/styles'

const NOT_REGISTERED = 'not-registered'
const GENERIC_ERROR = 'No pudimos verificar ese número con Payphone. Intenta nuevamente.'

const props = defineProps<{
  show: boolean
  method: PayoutMethodResponse | null
  whatsappNumber: string | null
}>()
const emit = defineEmits<{ (e: 'update:show', val: boolean): void }>()

function storedNumber(method: PayoutMethodResponse | null): string {
  return method?.receiverIdentifier ? `+593${method.receiverIdentifier}` : ''
}

const phone = ref(storedNumber(props.method))
const password = ref('')
const error = ref<string | null>(null)

const isEditing = computed(() => props.method !== null)
const isNotRegistered = computed(() => error.value === NOT_REGISTERED)
const isPhoneUsable = computed(() => isPhoneValid(phone.value))
const canSubmit = computed(() => isPhoneUsable.value && password.value.length > 0)

const canUseWhatsapp = computed(
  () => props.whatsappNumber !== null && props.whatsappNumber !== phone.value,
)

watch(
  () => props.method,
  (method) => {
    phone.value = storedNumber(method)
    password.value = ''
    error.value = null
  },
)

watch(
  () => props.show,
  (show) => {
    if (!show) {
      error.value = null
      password.value = ''
    }
  },
)

function takeWhatsappNumber() {
  if (props.whatsappNumber) phone.value = props.whatsappNumber
}

const { mutateAsync: createMethod, isPending: isCreating } = useCreatePayoutMethod()
const { mutateAsync: updateMethod, isPending: isUpdating } = useUpdatePayoutMethod()

function readError(caught: unknown): string {
  if (readApiErrorRule(caught) === 'phone_not_registered') return NOT_REGISTERED
  return readApiErrorMessage(caught, GENERIC_ERROR)
}

async function submit() {
  if (!canSubmit.value) return
  error.value = null
  try {
    if (props.method) {
      await updateMethod({
        id: props.method.id,
        payload: { phone: phone.value, password: password.value },
      })
    } else {
      await createMethod({ provider: 'payphone', phone: phone.value, password: password.value })
    }
    message.success('Número de Payphone verificado y guardado')
    emit('update:show', false)
  } catch (caught) {
    error.value = readError(caught)
  }
}
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    :bordered="false"
    class="payphone-modal"
    style="width: 540px; max-width: calc(100vw - 32px)"
    @update:show="(v) => emit('update:show', v)"
  >
    <template #header>
      <div class="tt-modal-head">
        <span class="tt-modal-head__icon">
          <NIcon :component="PhonePortraitOutline" :size="22" />
        </span>
        <div>
          <h3>{{ isEditing ? 'Editar cuenta Payphone' : 'Agregar cuenta Payphone' }}</h3>
          <p>Aquí te llega el dinero de cada venta con tarjeta, menos la comisión de Payphone.</p>
        </div>
      </div>
    </template>

    <NAlert
      v-if="isNotRegistered"
      type="warning"
      :show-icon="true"
      title="Ese número no tiene cuenta en Payphone"
      class="tt-modal-alert"
    >
      <ol class="payphone-modal__steps">
        <li>Descarga la aplicación Payphone en tu celular.</li>
        <li>Crea tu cuenta usando este mismo número.</li>
        <li>Vuelve aquí y guárdalo de nuevo.</li>
      </ol>
    </NAlert>

    <NAlert
      v-else-if="error"
      type="error"
      :show-icon="true"
      class="tt-modal-alert"
      data-test="payphone-error"
    >
      {{ error }}
    </NAlert>

    <section class="tt-fieldset">
      <header class="tt-fieldset__head">
        <span class="tt-fieldset__num">1</span>
        <h4>¿A qué número te llega el dinero?</h4>
      </header>

      <label class="tt-form-field">
        <span>Número de Payphone</span>
        <div class="tt-phone-input payphone-step__input">
          <IntlTelInput
            :options="PHONE_INPUT_OPTIONS"
            :value="phone"
            :input-props="{ placeholder: 'Ej. 99 123 4567', autocomplete: 'off', name: 'payphone' }"
            @change-number="(num: string) => (phone = num)"
          />
        </div>
      </label>

      <button
        v-if="canUseWhatsapp"
        type="button"
        class="payphone-shortcut"
        data-test="use-whatsapp"
        @click="takeWhatsappNumber"
      >
        <span class="payphone-shortcut__icon">
          <NIcon :component="LogoWhatsapp" :size="16" />
        </span>
        <span class="payphone-shortcut__text">
          ¿Es el mismo de tu WhatsApp?
          <b>{{ formatWhatsAppNumber(props.whatsappNumber ?? '') }}</b>
        </span>
        <span class="payphone-shortcut__cue">Usar</span>
      </button>

      <p class="tt-form-hint">
        Antes de guardarlo comprobamos con Payphone que ese número tenga una cuenta.
      </p>
    </section>

    <section class="tt-fieldset tt-fieldset--muted">
      <header class="tt-fieldset__head">
        <span class="tt-fieldset__num">2</span>
        <h4>Confirma que eres tú</h4>
      </header>

      <NInput
        v-model:value="password"
        type="password"
        show-password-on="click"
        placeholder="Tu contraseña de TitanTV"
        :input-props="{ autocomplete: 'new-password', name: 'payout-password' }"
      >
        <template #prefix>
          <NIcon :component="LockClosedOutline" />
        </template>
      </NInput>

      <p class="tt-form-hint">
        Te la pedimos porque este número decide a dónde llega el dinero de tus ventas.
      </p>
    </section>

    <template #footer>
      <div class="tt-modal-foot">
        <NButton @click="emit('update:show', false)">Cancelar</NButton>
        <NButton
          type="primary"
          :disabled="!canSubmit"
          :loading="isCreating || isUpdating"
          @click="submit"
        >
          Verificar y guardar
        </NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped src="./payphone-method-modal.css"></style>
