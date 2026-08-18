<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { NButton, NSpin } from 'naive-ui'

import type {
  IPaymentGatewayCheckoutEmits,
  IPaymentGatewayCheckoutProps,
} from '@/features/payments/gateways/types'
import type { IConfirmPaymentRequest } from '@/features/payments/types/requests/payment.request'
import { PAYPHONE_SDK } from './payphone-sdk.constants'
import { usePayphoneBox } from './use-payphone-box'

const props = defineProps<IPaymentGatewayCheckoutProps>()
const emit = defineEmits<IPaymentGatewayCheckoutEmits>()

const box = usePayphoneBox()

onMounted(async () => {
  try {
    await box.render(props.intent)
  } catch (error) {
    emit('setup-failed', error)
  }
})

onBeforeUnmount(() => {
  box.destroy()
})

async function pay(): Promise<IConfirmPaymentRequest> {
  const outcome = await box.pay()
  return { clientTransactionId: outcome.clientTransactionId, id: outcome.transactionId }
}

defineExpose({ pay, isProcessing: box.isProcessing })
</script>

<template>
  <div class="payphone-box">
    <div :id="PAYPHONE_SDK.CONTAINER_ID" class="payphone-box__container" />

    <NSpin v-if="!box.isReady.value" size="small" class="payphone-box__loading" />

    <NButton
      v-else
      type="primary"
      size="large"
      block
      :loading="box.isProcessing.value || props.settling"
      :disabled="box.isProcessing.value || props.settling"
      @click="emit('pay-requested')"
    >
      {{ props.settling ? 'Confirmando pago…' : 'Pagar ahora' }}
    </NButton>
  </div>
</template>

<style scoped src="./payphone-box.css" />
