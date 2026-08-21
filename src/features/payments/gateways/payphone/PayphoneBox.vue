<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { NSpin } from 'naive-ui'

import type {
  IPaymentGatewayCheckoutEmits,
  IPaymentGatewayCheckoutProps,
} from '@/features/payments/gateways/types'
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

  document.querySelectorAll('.ppb-content-otp').forEach((node) => node.remove())
  document.body.classList.remove(
    'ppb-overflow-hidden',
    'ppb-position-relative',
    'ppb-h-100',
    'ppb-vw-100',
  )
})
</script>

<template>
  <div class="payphone-box tt-payphone-box">
    <div :id="PAYPHONE_SDK.CONTAINER_ID" class="payphone-box__container" />

    <NSpin v-if="!box.isReady.value" size="small" class="payphone-box__loading" />
  </div>
</template>

<style scoped src="./payphone-box.css" />
