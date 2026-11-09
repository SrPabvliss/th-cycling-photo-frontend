<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  NAlert,
  NButton,
  NIcon,
  NInput,
  NModal,
  NRadioButton,
  NRadioGroup,
  NSelect,
} from 'naive-ui'
import { BusinessOutline, LockClosedOutline } from '@vicons/ionicons5'

import { BANK_OPTIONS } from '@/shared/constants/payout'
import { readApiErrorMessage } from '../../utils/payout-method.utils'
import { useCreatePayoutMethod } from '../../composables/mutations/use-create-payout-method'
import { useUpdatePayoutMethod } from '../../composables/mutations/use-update-payout-method'
import type {
  PayoutMethodAccountType,
  PayoutMethodResponse,
} from '../../types/responses/payout-method.response'

const props = defineProps<{ show: boolean; method: PayoutMethodResponse | null }>()
const emit = defineEmits<{ (e: 'update:show', val: boolean): void }>()

const bankName = ref(props.method?.bankName ?? '')
const accountType = ref<PayoutMethodAccountType>(props.method?.accountType ?? 'ahorros')
const accountNumber = ref(props.method?.accountNumber ?? '')
const accountHolder = ref(props.method?.accountHolder ?? '')
const holderIdentification = ref(props.method?.holderIdentification ?? '')
const password = ref('')
const error = ref<string | null>(null)

const isEditing = computed(() => props.method !== null)

const hasAccountFields = computed(
  () =>
    bankName.value.trim() !== '' &&
    accountNumber.value.trim() !== '' &&
    accountHolder.value.trim() !== '' &&
    holderIdentification.value.trim() !== '',
)

const canSubmit = computed(() => hasAccountFields.value && password.value.length > 0)

watch(
  () => props.method,
  (method) => {
    bankName.value = method?.bankName ?? ''
    accountType.value = method?.accountType ?? 'ahorros'
    accountNumber.value = method?.accountNumber ?? ''
    accountHolder.value = method?.accountHolder ?? ''
    holderIdentification.value = method?.holderIdentification ?? ''
    password.value = ''
    error.value = null
  },
)

watch(
  () => props.show,
  (show) => {
    if (!show) {
      password.value = ''
      error.value = null
    }
  },
)

const { mutateAsync: createMethod, isPending: isCreating } = useCreatePayoutMethod()
const { mutateAsync: updateMethod, isPending: isUpdating } = useUpdatePayoutMethod()

async function submit() {
  if (!canSubmit.value) return
  error.value = null

  const bankFields = {
    bankName: bankName.value,
    accountType: accountType.value,
    accountNumber: accountNumber.value,
    accountHolder: accountHolder.value,
    holderIdentification: holderIdentification.value,
  }

  try {
    if (props.method) {
      await updateMethod({
        id: props.method.id,
        payload: { ...bankFields, password: password.value },
      })
    } else {
      await createMethod({ provider: 'bank_transfer', ...bankFields, password: password.value })
    }
    emit('update:show', false)
  } catch (caught) {
    error.value = readApiErrorMessage(caught, 'No pudimos guardar los datos bancarios.')
  }
}
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    :bordered="false"
    style="width: 540px; max-width: calc(100vw - 32px)"
    @update:show="(v) => emit('update:show', v)"
  >
    <template #header>
      <div class="tt-modal-head">
        <span class="tt-modal-head__icon">
          <NIcon :component="BusinessOutline" :size="22" />
        </span>
        <div>
          <h3>{{ isEditing ? 'Editar cuenta bancaria' : 'Agregar cuenta bancaria' }}</h3>
          <p>Son los datos que le pasas al comprador cuando te paga por transferencia.</p>
        </div>
      </div>
    </template>

    <NAlert v-if="error" type="error" :show-icon="true" class="tt-modal-alert">
      {{ error }}
    </NAlert>

    <section class="bank-block">
      <div class="bank-block__grid">
        <label class="tt-form-field bank-field--wide">
          <span>Banco</span>
          <NSelect
            v-model:value="bankName"
            :options="BANK_OPTIONS"
            filterable
            tag
            placeholder="Elige tu banco"
          />
        </label>

        <label class="tt-form-field">
          <span>Tipo de cuenta</span>
          <NRadioGroup v-model:value="accountType">
            <NRadioButton value="ahorros">Ahorros</NRadioButton>
            <NRadioButton value="corriente">Corriente</NRadioButton>
          </NRadioGroup>
        </label>

        <label class="tt-form-field">
          <span>Número de cuenta</span>
          <NInput v-model:value="accountNumber" placeholder="Solo números" />
        </label>

        <label class="tt-form-field">
          <span>Titular</span>
          <NInput v-model:value="accountHolder" placeholder="Como aparece en el banco" />
        </label>

        <label class="tt-form-field">
          <span>Cédula o RUC</span>
          <NInput v-model:value="holderIdentification" placeholder="Ej. 1850046317" />
        </label>
      </div>
    </section>

    <section class="tt-fieldset tt-fieldset--muted">
      <header class="tt-fieldset__head">
        <NIcon :component="LockClosedOutline" :size="15" />
        <h4>Confirma que eres tú</h4>
      </header>

      <NInput
        v-model:value="password"
        type="password"
        show-password-on="click"
        placeholder="Tu contraseña de TitanTV"
        :input-props="{ autocomplete: 'new-password', name: 'payout-password' }"
      />

      <p class="tt-form-hint">
        Te la pedimos porque esta cuenta decide a dónde llega el dinero de tus ventas.
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
          Guardar cuenta
        </NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped src="./bank-transfer-method-modal.css"></style>
