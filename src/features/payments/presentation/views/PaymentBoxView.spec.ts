import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

const push = vi.fn()
const replace = vi.fn()
const routeQuery = ref<Record<string, string>>({})

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: routeQuery.value }),
  useRouter: () => ({ push, replace }),
}))

vi.mock('@/core/layout/public/PublicLayout.vue', () => ({
  default: { name: 'PublicLayout', template: '<div><slot /></div>' },
}))

const mutate = vi.fn()
const intentData = ref<{ provider: string; payload: Record<string, unknown> } | undefined>(
  undefined,
)
const intentError = ref<unknown>(undefined)
const isPending = ref(false)

vi.mock('@/features/payments/composables/mutations/use-create-payment-intent', () => ({
  useCreatePaymentIntent: () => ({
    mutate,
    data: intentData,
    error: intentError,
    isPending,
  }),
}))

const CheckoutStub = { name: 'GatewayCheckout', template: '<div class="gateway-checkout" />' }

const findPaymentGateway = vi.fn()
vi.mock('@/features/payments/gateways/registry', () => ({
  findPaymentGateway: (provider: string) => findPaymentGateway(provider),
}))

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

beforeEach(() => {
  push.mockClear()
  replace.mockClear()
  mutate.mockClear()
  findPaymentGateway.mockReset()
  routeQuery.value = {}
  intentData.value = undefined
  intentError.value = undefined
  isPending.value = false
  setupGateway()
})

function mountView() {
  return mount(PaymentBoxView)
}

describe('PaymentBoxView', () => {
  it('redirects to the cart when there are no order ids in the query', async () => {
    routeQuery.value = {}

    mountView()
    await flushPromises()

    expect(replace).toHaveBeenCalledWith({ name: 'cart-checkout' })
    expect(mutate).not.toHaveBeenCalled()
  })

  it('redirects to the cart when the orders query is only commas', async () => {
    routeQuery.value = { orders: ',,' }

    mountView()
    await flushPromises()

    expect(replace).toHaveBeenCalledWith({ name: 'cart-checkout' })
  })

  it('creates an intent for the ids found in the query and renders the gateway box', async () => {
    routeQuery.value = { orders: 'order-1,order-2' }
    mutate.mockImplementation(() => {
      intentData.value = { provider: 'payphone', payload: { amount: 2500, currency: 'USD' } }
    })

    const wrapper = mountView()
    await flushPromises()

    expect(mutate).toHaveBeenCalledWith(['order-1', 'order-2'])
    expect(wrapper.findComponent(CheckoutStub).exists()).toBe(true)
    expect(wrapper.text()).toContain('$25.00')
    expect(replace).not.toHaveBeenCalled()
  })

  it('shows the path to Mis compras on a 422 and hides the retry button', async () => {
    routeQuery.value = { orders: 'order-1' }
    mutate.mockImplementation(() => {
      intentError.value = {
        isAxiosError: true,
        response: { status: 422, data: { error: { message: 'Esta compra ya fue pagada.' } } },
      }
    })

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('Esta compra ya fue pagada.')
    expect(wrapper.find('[data-test="go-to-orders"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="retry"]').exists()).toBe(false)
  })

  it('shows a brief message and a cart button on 403 and 404', async () => {
    routeQuery.value = { orders: 'order-1' }
    mutate.mockImplementation(() => {
      intentError.value = {
        isAxiosError: true,
        response: { status: 404, data: { error: { message: 'No encontramos esa orden.' } } },
      }
    })

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('No encontramos esa orden.')
    expect(wrapper.find('[data-test="go-to-cart"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="retry"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="go-to-orders"]').exists()).toBe(false)
  })

  it('offers a retry button on network or server errors', async () => {
    routeQuery.value = { orders: 'order-1' }
    mutate.mockImplementation(() => {
      intentError.value = { isAxiosError: true, response: undefined }
    })

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('[data-test="retry"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="go-to-orders"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="go-to-cart"]').exists()).toBe(false)

    await wrapper.get('[data-test="retry"]').trigger('click')

    expect(mutate).toHaveBeenCalledTimes(2)
    expect(mutate).toHaveBeenLastCalledWith(['order-1'])
  })
})
