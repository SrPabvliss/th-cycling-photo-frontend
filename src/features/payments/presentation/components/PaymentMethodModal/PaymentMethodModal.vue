<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NAlert, NButton, NIcon, NModal } from 'naive-ui'
import { CardOutline, ChevronBackOutline, SwapHorizontalOutline } from '@vicons/ionicons5'

import { useCheckout } from '@/features/cart/composables/mutations/use-checkout'
import type { ICheckoutOrderResult } from '@/features/cart/types/requests/cart.request'
import { useChoosePaymentMethod } from '@/features/payments/composables/mutations/use-choose-payment-method'
import { PAYMENT_METHOD, type PaymentMethod } from '@/features/payments/types/payment-method'
import { formatCurrency } from '@/features/pricing/utils/format-currency'
import { CARD_BRANDS } from './card-brands'
import PaymentCheckout from '../PaymentCheckout/PaymentCheckout.vue'

const props = defineProps<{
  show: boolean
  total: number
  currency: string
  orderIds?: string[]
}>()

const emit = defineEmits<{
  'update:show': [boolean]
  'method-chosen': [PaymentMethod]
  'paid-orders': [ICheckoutOrderResult[]]
}>()

const { mutateAsync: checkout, isPending: isCheckingOut } = useCheckout()
const { mutateAsync: chooseMethod, isPending: isChoosing } = useChoosePaymentMethod()

const step = ref<'choice' | 'card'>('choice')
const error = ref<string | null>(null)
const cardOrderIds = ref<string[]>([])
const cardTotal = ref<number | null>(null)
const cardCurrency = ref<string | null>(null)

const hasCheckedOut = computed(() => cardOrderIds.value.length > 0)
const isRetry = computed(() => props.orderIds !== undefined || hasCheckedOut.value)
const isPending = computed(() => (isRetry.value ? isChoosing.value : isCheckingOut.value))

const displayTotal = computed(() =>
  step.value === 'card' && cardTotal.value !== null ? cardTotal.value : props.total,
)
const displayCurrency = computed(() =>
  step.value === 'card' && cardCurrency.value !== null ? cardCurrency.value : props.currency,
)

watch(
  () => props.show,
  (visible) => {
    if (!visible) return
    step.value = 'choice'
    error.value = null
    cardOrderIds.value = []
    cardTotal.value = null
    cardCurrency.value = null
  },
)

function backToChoice() {
  step.value = 'choice'
  error.value = null
}

async function chooseExisting(method: PaymentMethod) {
  const orderIds = props.orderIds ?? cardOrderIds.value

  try {
    await chooseMethod({ orderIds, method })
  } catch {
    error.value = 'No pudimos registrar tu elección. Intenta nuevamente.'
    return
  }

  emit('method-chosen', method)

  if (method === PAYMENT_METHOD.TRANSFER) {
    emit('update:show', false)
    return
  }

  cardOrderIds.value = orderIds
  step.value = 'card'
}

async function chooseNew(method: PaymentMethod) {
  let orders: ICheckoutOrderResult[]

  try {
    orders = await checkout(method)
  } catch {
    error.value = 'No pudimos registrar tu pedido. Intenta nuevamente.'
    return
  }

  emit('method-chosen', method)

  if (method === PAYMENT_METHOD.TRANSFER) {
    emit('paid-orders', orders)
    emit('update:show', false)
    return
  }

  cardOrderIds.value = orders.map((order) => order.orderId)
  cardTotal.value = orders.reduce((sum, order) => sum + order.subtotal, 0)
  cardCurrency.value = orders[0]?.currency ?? props.currency
  step.value = 'card'
}

function choose(method: PaymentMethod) {
  error.value = null
  return isRetry.value ? chooseExisting(method) : chooseNew(method)
}
</script>

<template>
  <NModal
    :show="props.show"
    preset="card"
    class="payment-method-modal"
    style="width: 460px; max-width: calc(100vw - 32px)"
    title="¿Cómo quieres pagar?"
    :mask-closable="step !== 'card'"
    :closable="step !== 'card'"
    @update:show="emit('update:show', $event)"
  >
    <p class="payment-method-modal__total">
      Total a pagar: <strong>{{ formatCurrency(displayTotal, displayCurrency) }}</strong>
    </p>

    <div v-if="step === 'choice'" class="payment-method-modal__options">
      <button
        type="button"
        class="payment-method-modal__option"
        data-test="method-card"
        :disabled="isPending"
        @click="choose(PAYMENT_METHOD.CARD)"
      >
        <NIcon :component="CardOutline" :size="28" />
        <span class="payment-method-modal__option-title">Tarjeta de crédito o débito</span>
        <span class="payment-method-modal__brands">
          <component :is="brand.Icon" v-for="brand in CARD_BRANDS" :key="brand.name" />
        </span>
      </button>

      <button
        type="button"
        class="payment-method-modal__option"
        data-test="method-transfer"
        :disabled="isPending"
        @click="choose(PAYMENT_METHOD.TRANSFER)"
      >
        <NIcon :component="SwapHorizontalOutline" :size="28" />
        <span class="payment-method-modal__option-title">Transferencia bancaria</span>
        <span class="payment-method-modal__option-hint"
          >Te enviamos los datos para hacer la transferencia</span
        >
      </button>
    </div>

    <div v-else class="payment-method-modal__card">
      <NButton quaternary size="small" data-test="method-back" @click="backToChoice">
        <template #icon><NIcon :component="ChevronBackOutline" /></template>
        Cambiar método
      </NButton>

      <PaymentCheckout :order-ids="cardOrderIds" />
    </div>

    <NAlert v-if="error" type="error" :show-icon="true" class="payment-method-modal__error">
      {{ error }}
    </NAlert>
  </NModal>
</template>

<style scoped src="./payment-method-modal.css" />
