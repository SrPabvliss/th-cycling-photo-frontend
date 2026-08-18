<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NResult, NSpin } from 'naive-ui'

import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import { useConfirmPayment } from '../../composables/mutations/use-confirm-payment'
import { DEFAULT_PAYMENT_PROVIDER, findPaymentGateway } from '../../gateways/registry'

const route = useRoute()
const router = useRouter()
const { mutateAsync: confirmPayment } = useConfirmPayment()

const state = ref<'confirming' | 'approved' | 'declined' | 'error'>('confirming')
const message = ref<string | null>(null)

onMounted(async () => {
  const provider = String(route.meta.provider ?? DEFAULT_PAYMENT_PROVIDER)
  const confirmation = findPaymentGateway(provider)?.parseReturn(route.query) ?? null

  if (!confirmation) {
    state.value = 'error'
    message.value = 'No pudimos identificar tu pago.'
    return
  }

  try {
    const result = await confirmPayment(confirmation)
    state.value = result.approved ? 'approved' : 'declined'
    message.value = result.message
  } catch {
    state.value = 'error'
    message.value = 'Tu pago se está procesando. Te contactaremos para confirmarlo.'
  }
})
</script>

<template>
  <PublicLayout>
    <div class="payment-return">
      <NSpin v-if="state === 'confirming'" size="large" />

      <NResult
        v-else-if="state === 'approved'"
        status="success"
        title="¡Pago confirmado!"
        description="Ya puedes descargar tus fotos desde el enlace que te enviamos."
      >
        <template #footer>
          <NButton type="primary" @click="router.push('/gallery')">Volver a la galería</NButton>
        </template>
      </NResult>

      <NResult
        v-else-if="state === 'declined'"
        status="warning"
        title="El pago fue rechazado"
        :description="message ?? 'Intenta nuevamente con otra tarjeta.'"
      >
        <template #footer>
          <NButton type="primary" @click="router.push('/checkout')">Intentar de nuevo</NButton>
        </template>
      </NResult>

      <NResult v-else status="info" title="Estamos procesando tu pago" :description="message ?? ''">
        <template #footer>
          <NButton @click="router.push('/gallery')">Volver a la galería</NButton>
        </template>
      </NResult>
    </div>
  </PublicLayout>
</template>

<style scoped src="./payment-return-view.css" />
