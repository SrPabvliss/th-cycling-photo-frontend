<script setup lang="ts">
import { ref, watch } from 'vue'
import { NFormItem, NInput } from 'naive-ui'

import type {
  IPaymentGatewayCredentialsEmits,
  IPaymentGatewayCredentialsProps,
} from '@/features/payments/gateways/types'
import { PAYMENT_MODE } from '@/features/payments/types/payment-account'

const props = defineProps<IPaymentGatewayCredentialsProps>()
const emit = defineEmits<IPaymentGatewayCredentialsEmits>()

const phone = ref(props.account?.phone ?? '')
const token = ref('')
const storeId = ref(props.account?.storeId ?? '')

function emitCredentials() {
  emit(
    'update:credentials',
    props.mode === PAYMENT_MODE.SPLIT_RECEIVER
      ? { phone: phone.value }
      : { token: token.value, storeId: storeId.value || undefined },
  )
}

watch(
  () => props.account,
  (account) => {
    phone.value = account?.phone ?? ''
    storeId.value = account?.storeId ?? ''
    emitCredentials()
  },
  { immediate: true },
)

watch([phone, token, storeId, () => props.mode], emitCredentials)
</script>

<template>
  <template v-if="props.mode === PAYMENT_MODE.SPLIT_RECEIVER">
    <NFormItem label="Número de celular con Payphone">
      <NInput v-model:value="phone" placeholder="0984112233" />
    </NFormItem>
    <p>Verificaremos que ese número tenga una cuenta Payphone antes de habilitar tus ventas.</p>
  </template>

  <template v-else>
    <NFormItem label="Token de tu aplicación en Payphone Developer">
      <NInput v-model:value="token" type="password" show-password-on="click" />
    </NFormItem>
    <NFormItem label="Store ID (déjalo vacío si tienes una sola tienda)">
      <NInput v-model:value="storeId" />
    </NFormItem>
    <p>
      Crea una aplicación de tipo Web en tu cuenta de Payphone Developer con el dominio de Titan TV
      y su URL de respuesta. Tu token se guarda cifrado y nunca se muestra de nuevo.
    </p>
  </template>
</template>
