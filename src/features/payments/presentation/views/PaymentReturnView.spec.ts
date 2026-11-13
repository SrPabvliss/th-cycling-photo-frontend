import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import type { PaymentOutcome } from '../../utils/payment-outcome'
import PaymentReturnView from './PaymentReturnView.vue'

const outcome = ref<PaymentOutcome>('confirming')
const orderIds = ref<string[]>([])
const retry = vi.fn()
const isAsking = ref(true)

vi.mock('../../composables/use-payment-return', () => ({
  usePaymentReturn: () => ({ outcome, orderIds, retry, isAsking }),
}))

const mounted: { unmount(): void }[] = []

async function mountView() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:any(.*)*', component: { render: () => null } }],
  })
  await router.push('/checkout/payphone/return?id=1&clientTransactionId=tx')
  mounted.push(mount(PaymentReturnView, { attachTo: document.body, global: { plugins: [router] } }))
  await flushPromises()
  return new DOMWrapper(document.body)
}

describe('PaymentReturnView', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    outcome.value = 'confirming'
    orderIds.value = []
    isAsking.value = true
    retry.mockReset()
  })
  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
  })

  it('asks the buyer to stay while the payment is confirmed', async () => {
    const wrapper = await mountView()

    expect(wrapper.get('h1').text()).toBe('Confirmando tu pago')
    expect(wrapper.text()).toContain('No cierres esta página. Tarda unos segundos.')
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
  })

  it('says it is taking longer, that nothing is charged twice, and leads to the order', async () => {
    outcome.value = 'late'
    orderIds.value = ['o1']
    const wrapper = await mountView()

    expect(wrapper.get('h1').text()).toBe('Seguimos confirmando tu pago')
    expect(wrapper.text()).toContain(
      'Está tardando más de lo normal. No se cobra dos veces. Puedes salir de esta página: el pedido queda en Mis fotos y te avisamos por correo.',
    )
    expect(wrapper.text()).not.toContain('Pago confirmado')
    const link = wrapper.findAll('a').find((each) => each.text().trim() === 'Ver mi pedido')
    expect(link?.attributes('href')).toBe('/account/orders/o1')
  })

  it('stops the spinner, keeping the words and the way to the order, once it stops asking', async () => {
    outcome.value = 'late'
    orderIds.value = ['o1']
    isAsking.value = false
    const wrapper = await mountView()

    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(false)
    expect(wrapper.get('h1').text()).toBe('Seguimos confirmando tu pago')
    expect(wrapper.text()).toContain('No se cobra dos veces.')
    expect(wrapper.findAll('a').some((each) => each.text().trim() === 'Ver mi pedido')).toBe(true)
  })

  it('says the card could not be charged, and that nothing was', async () => {
    outcome.value = 'declined'
    const wrapper = await mountView()

    expect(wrapper.get('h1').text()).toBe('No se pudo cobrar tu tarjeta')
    expect(wrapper.text()).toContain('No se hizo ningún cargo. Tus fotos siguen en el carrito.')
  })

  it('offers to retry when the payment could not be asked about', async () => {
    outcome.value = 'failed'
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('No pudimos confirmar tu pago')
    expect(wrapper.text()).toContain('Puede ser tu conexión. No se cobra dos veces.')
    await wrapper
      .findAll('button')
      .find((each) => each.text().includes('Reintentar'))!
      .trigger('click')
    expect(retry).toHaveBeenCalled()
  })
})
