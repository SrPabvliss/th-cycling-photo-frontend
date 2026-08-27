<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NAlert, NIcon, NModal } from 'naive-ui'
import { CardOutline, SwapHorizontalOutline } from '@vicons/ionicons5'

import { useCheckout } from '@/shared/composables/use-checkout'
import { useChoosePaymentMethod } from '@/shared/composables/use-choose-payment-method'
import { PAYMENT_ROUTE_NAMES } from '@/features/payments/routes'
import { PAYMENT_METHOD, type PaymentMethod } from '@/shared/types/payment-method.types'
import type { ICheckoutOrderResult } from '@/shared/types/cart.types'
import { formatCurrency } from '@/shared/utils/currency.utils'
import { CARD_BRANDS } from './card-brands'

const props = defineProps<{
  show: boolean
  total: number
  currency: string
  orderIds?: string[]
  eventId?: string
}>()

const emit = defineEmits<{
  'update:show': [boolean]
  'method-chosen': [PaymentMethod]
  'paid-orders': [ICheckoutOrderResult[]]
}>()

const router = useRouter()

const { mutateAsync: checkout, isPending: isCheckingOut } = useCheckout()
const { mutateAsync: chooseMethod, isPending: isChoosing } = useChoosePaymentMethod()

const error = ref<string | null>(null)

const isRetry = computed(() => props.orderIds !== undefined)
const isPending = computed(() => (isRetry.value ? isChoosing.value : isCheckingOut.value))

watch(
  () => props.show,
  (visible) => {
    if (!visible) return
    error.value = null
  },
)

function goToPaymentBox(orderIds: string[]) {
  emit('update:show', false)
  router.push({ name: PAYMENT_ROUTE_NAMES.BOX, query: { orders: orderIds.join(',') } })
}

async function chooseExisting(method: PaymentMethod) {
  const orderIds = props.orderIds ?? []

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

  goToPaymentBox(orderIds)
}

async function chooseNew(method: PaymentMethod) {
  if (!props.eventId) {
    error.value = 'No pudimos identificar el evento de tu pedido.'
    return
  }

  let orders: ICheckoutOrderResult[]

  try {
    orders = await checkout({ eventId: props.eventId, method })
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

  goToPaymentBox(orders.map((order) => order.orderId))
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
    @update:show="emit('update:show', $event)"
  >
    <p class="payment-method-modal__total">
      Total a pagar: <strong>{{ formatCurrency(props.total, props.currency) }}</strong>
    </p>

    <div class="payment-method-modal__options">
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

    <NAlert v-if="error" type="error" :show-icon="true" class="payment-method-modal__error">
      {{ error }}
    </NAlert>
  </NModal>
</template>

<style scoped src="./payment-method-modal.css" />
