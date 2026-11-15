import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { AxiosError, type AxiosResponse } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'

const push = vi.fn()
const replace = vi.fn()
const routeQuery = ref<Record<string, string>>({})

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: routeQuery.value }),
  useRouter: () => ({ push, replace }),
}))

const mutate = vi.fn()
const intentData = ref<{ provider: string; payload: Record<string, unknown> } | undefined>(
  undefined,
)
const intentError = ref<unknown>(undefined)
const isPending = ref(false)

vi.mock('@/features/payments/composables/mutations/use-create-payment-intent', () => ({
  useCreatePaymentIntent: () => ({ mutate, data: intentData, error: intentError, isPending }),
}))

const CheckoutStub = defineComponent({
  name: 'GatewayCheckout',
  emits: ['setup-failed'],
  template: '<div class="gateway-checkout" />',
})

const payByTransfer = vi.fn()
const transferProblem = ref<string | null>(null)
vi.mock('@/features/payments/composables/use-declined-actions', () => ({
  useDeclinedActions: () => ({ payByTransfer, isSwitching: ref(false), problem: transferProblem }),
}))

const findPaymentGateway = vi.fn()
vi.mock('@/features/payments/gateways/registry', () => ({
  findPaymentGateway: (provider: string) => findPaymentGateway(provider),
}))
vi.mock('@/core/views/NotFoundView.vue', () => ({
  default: { template: '<div data-test="not-found">404</div>' },
}))

import { cardPaymentEvent } from '../../utils/card-payment-event'
import PaymentBoxView from './PaymentBoxView.vue'

function setupGateway() {
  findPaymentGateway.mockReturnValue({
    provider: 'payphone',
    checkoutComponent: CheckoutStub,
    parseReturn: () => null,
    describeIntent: (intent: { payload: Record<string, unknown> }) => {
      const { amount, currency } = intent.payload
      if (typeof amount !== 'number' || typeof currency !== 'string') return null
      return { amountCents: amount, currency }
    },
  })
}

function httpError(status: number, message = 'Mensaje del servidor') {
  const response = {
    status,
    data: { error: { message } },
    headers: {},
    config: {},
  } as AxiosResponse
  return new AxiosError('failed', 'ERR_BAD_REQUEST', undefined, undefined, response)
}

const mounted: { unmount(): void }[] = []
async function mountView() {
  const component = mount(PaymentBoxView, { attachTo: document.body })
  mounted.push(component)
  await flushPromises()
  return { component, wrapper: new DOMWrapper(document.body) }
}

const buttonNamed = (wrapper: DOMWrapper<Element>, name: string) =>
  wrapper.findAll('button, a').find((each) => each.text().trim() === name)

beforeEach(() => {
  document.body.innerHTML = ''
  push.mockClear()
  replace.mockClear()
  mutate.mockClear()
  findPaymentGateway.mockReset()
  routeQuery.value = { orders: 'o1,o2', evento: 'e1' }
  payByTransfer.mockReset()
  transferProblem.value = null
  sessionStorage.clear()
  intentData.value = undefined
  intentError.value = undefined
  isPending.value = false
})
afterEach(() => {
  while (mounted.length) mounted.pop()!.unmount()
})

describe('PaymentBoxView', () => {
  it('asks the gateway once for the orders in the address', async () => {
    await mountView()

    expect(mutate).toHaveBeenCalledTimes(1)
    expect(mutate).toHaveBeenCalledWith(['o1', 'o2'])
  })

  it('says it is opening the gateway while the payment is prepared', async () => {
    isPending.value = true
    const { wrapper } = await mountView()

    expect(wrapper.get('h1').text()).toBe('Pago con tarjeta')
    expect(wrapper.get('[role="status"]').text()).toContain('Abriendo la pasarela de pago')
  })

  it('mounts the gateway box with the total the server set', async () => {
    setupGateway()
    intentData.value = { provider: 'payphone', payload: { amount: 900, currency: 'USD' } }
    const { wrapper } = await mountView()

    expect(wrapper.find('.gateway-checkout').exists()).toBe(true)
    expect(wrapper.get('.payment-box__amount').text()).toBe('$9,00')
    expect(wrapper.text()).not.toContain('Abriendo la pasarela de pago')
  })

  it('says nothing was charged when the payment could not be opened, and retries', async () => {
    intentError.value = new AxiosError('Network Error', 'ERR_NETWORK')
    const { wrapper } = await mountView()

    expect(wrapper.text()).toContain('No pudimos abrir el pago')
    expect(wrapper.text()).toContain('No se hizo ningún cargo.')
    await buttonNamed(wrapper, 'Reintentar')!.trigger('click')

    expect(mutate).toHaveBeenCalledTimes(2)
    expect(mutate).toHaveBeenLastCalledWith(['o1', 'o2'])
  })

  it('offers to pay by transfer instead when the payment could not be opened', async () => {
    intentError.value = new AxiosError('Network Error', 'ERR_NETWORK')
    const { wrapper } = await mountView()

    await buttonNamed(wrapper, 'Pagar por transferencia')!.trigger('click')

    expect(payByTransfer).toHaveBeenCalledTimes(1)
  })

  it('shows one problem at a time: a failed switch to transfer takes the place of the first', async () => {
    intentError.value = new AxiosError('Network Error', 'ERR_NETWORK')
    transferProblem.value = 'network'
    const { wrapper } = await mountView()

    expect(wrapper.findAll('[role="alert"]')).toHaveLength(1)
    expect(wrapper.text()).not.toContain('No pudimos abrir el pago')
    expect(wrapper.get('[data-test="checkout-problem"]').text()).toContain('No se pudo completar')
    expect(buttonNamed(wrapper, 'Pagar por transferencia')).toBeDefined()
  })

  it('remembers the event of the orders for the way back from the gateway', async () => {
    await mountView()

    expect(cardPaymentEvent(['o1', 'o2'])).toBe('e1')
  })

  it('treats a gateway that fails to set up like a payment that could not open', async () => {
    setupGateway()
    intentData.value = { provider: 'payphone', payload: { amount: 900, currency: 'USD' } }
    const { component, wrapper } = await mountView()

    component.findComponent(CheckoutStub).vm.$emit('setup-failed', new Error('sdk'))
    await flushPromises()

    expect(wrapper.text()).toContain('No pudimos abrir el pago')
    expect(wrapper.find('.gateway-checkout').exists()).toBe(false)
  })

  it('treats an unknown gateway like a payment that could not open', async () => {
    findPaymentGateway.mockReturnValue(undefined)
    intentData.value = { provider: 'other', payload: {} }
    const { wrapper } = await mountView()

    expect(wrapper.text()).toContain('No pudimos abrir el pago')
  })

  it('shows the not found state without orders in the address', async () => {
    routeQuery.value = { orders: ',,' }
    const { wrapper } = await mountView()

    expect(wrapper.find('[data-test="not-found"]').exists()).toBe(true)
    expect(mutate).not.toHaveBeenCalled()
  })

  it.each([403, 404])(
    'shows the not found state for orders that are not the buyer’s (%s)',
    async (status) => {
      intentError.value = httpError(status)
      const { wrapper } = await mountView()

      expect(wrapper.find('[data-test="not-found"]').exists()).toBe(true)
    },
  )

  it('says the order can no longer be paid by card, and leads to Mis fotos', async () => {
    intentError.value = httpError(422, 'Este pedido ya fue pagado.')
    const { wrapper } = await mountView()

    expect(wrapper.text()).toContain('Este pedido ya no se puede pagar con tarjeta')
    expect(wrapper.text()).toContain('Este pedido ya fue pagado.')
    expect(buttonNamed(wrapper, 'Reintentar')).toBeUndefined()
    await buttonNamed(wrapper, 'Ir a Mis fotos')!.trigger('click')
    expect(push).toHaveBeenCalledWith({ name: 'account-orders' })
  })

  it('says an order paid by transfer is paid that way, and leads to that order', async () => {
    const response = {
      status: 422,
      data: {
        error: { code: 'BUSINESS_RULE', messageKey: 'payment.order_is_transfer', message: 'x' },
      },
      headers: {},
      config: {},
    } as AxiosResponse
    intentError.value = new AxiosError('failed', 'ERR_BAD_REQUEST', undefined, undefined, response)
    const { wrapper } = await mountView()

    expect(wrapper.get('h2, .empty-state__title').text()).toBe(
      'Este pedido se paga por transferencia',
    )
    expect(wrapper.text()).not.toContain('ya no se puede pagar con tarjeta')
    await buttonNamed(wrapper, 'Ver el pedido')!.trigger('click')
    expect(push).toHaveBeenCalledWith('/account/orders/o1')
  })

  it('goes back to the order of the event', async () => {
    const { wrapper } = await mountView()

    await wrapper.get('[aria-label="Volver al pedido"]').trigger('click')

    expect(push).toHaveBeenCalledWith('/checkout/e1')
  })

  it('goes back to the gallery when the event is not known', async () => {
    routeQuery.value = { orders: 'o1' }
    const { wrapper } = await mountView()

    await wrapper.get('[aria-label="Volver al pedido"]').trigger('click')

    expect(push).toHaveBeenCalledWith('/gallery')
  })
})
