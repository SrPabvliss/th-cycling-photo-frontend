<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NAlert, NButton, NForm, NFormItem, NRadioButton, NRadioGroup, NTag } from 'naive-ui'

import { usePaymentAccountQuery } from '@/features/payments/composables/queries/use-payment-account'
import { useConfigurePaymentAccount } from '@/features/payments/composables/mutations/use-configure-payment-account'
import { DEFAULT_PAYMENT_PROVIDER, findPaymentGateway } from '@/features/payments/gateways/registry'
import {
  PAYMENT_MODE,
  type IPaymentCredentials,
  type PaymentMode,
} from '@/features/payments/types/payment-account'

const { data: account, isLoading } = usePaymentAccountQuery()
const { mutateAsync: configure, isPending } = useConfigurePaymentAccount()

const mode = ref<PaymentMode>(PAYMENT_MODE.OWN_MERCHANT)
const credentials = ref<IPaymentCredentials>({})
const credentialsKey = ref(0)
const error = ref<string | null>(null)

watch(account, (value) => {
  if (!value) return
  mode.value = value.mode
})

const gateway = computed(() =>
  findPaymentGateway(account.value?.provider ?? DEFAULT_PAYMENT_PROVIDER),
)

const isVerified = computed(() => account.value?.isUsable === true)

async function handleSubmit() {
  error.value = null
  try {
    await configure({ mode: mode.value, ...credentials.value })
    credentials.value = {}
    credentialsKey.value += 1
  } catch (caught) {
    const response = (caught as { response?: { data?: { error?: { message?: string } } } }).response
    error.value = response?.data?.error?.message ?? 'No pudimos verificar tus datos de cobro.'
  }
}
</script>

<template>
  <section class="payment-settings">
    <header>
      <h1>Cobros</h1>
      <NTag v-if="isVerified" type="success">Verificado</NTag>
      <NTag v-else type="warning">Sin verificar</NTag>
    </header>

    <NAlert v-if="!isVerified && !isLoading" type="warning" :show-icon="true">
      Mientras no verifiques tus datos de cobro, tus eventos no pueden vender fotos.
    </NAlert>

    <NAlert v-if="error" type="error" :show-icon="true">{{ error }}</NAlert>

    <NAlert v-if="!gateway" type="error" :show-icon="true">
      No podemos mostrar la configuración de cobros para tu proveedor de pagos.
    </NAlert>

    <NForm v-else @submit.prevent="handleSubmit">
      <NFormItem label="¿Cómo quieres recibir tu dinero?">
        <NRadioGroup v-model:value="mode">
          <NRadioButton
            v-for="gatewayMode in gateway.modes"
            :key="gatewayMode.value"
            :value="gatewayMode.value"
          >
            {{ gatewayMode.label }}
          </NRadioButton>
        </NRadioGroup>
      </NFormItem>

      <component
        :is="gateway.credentialsFieldsComponent"
        :key="credentialsKey"
        :mode="mode"
        :account="account ?? null"
        @update:credentials="credentials = $event"
      />

      <NButton type="primary" attr-type="submit" :loading="isPending">Guardar y verificar</NButton>
    </NForm>
  </section>
</template>

<style scoped src="./payment-settings-view.css" />
