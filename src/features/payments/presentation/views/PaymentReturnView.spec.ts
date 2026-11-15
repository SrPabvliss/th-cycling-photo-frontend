import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import type { PaymentOutcome } from '../../utils/payment-outcome'
import { rememberCardPaymentEvent } from '../../utils/card-payment-event'
import PaymentReturnView from './PaymentReturnView.vue'

const outcome = ref<PaymentOutcome>('confirming')
const orderIds = ref<string[]>([])
const retry = vi.fn()
const isAsking = ref(true)
const refundReason = ref<string | null>(null)

const payByTransfer = vi.fn()
const isSwitching = ref(false)
const switchProblem = ref<string | null>(null)
vi.mock('../../composables/use-declined-actions', () => ({
  useDeclinedActions: () => ({ payByTransfer, isSwitching, problem: switchProblem }),
}))

vi.mock('../../composables/use-payment-return', () => ({
  usePaymentReturn: () => ({ outcome, orderIds, retry, isAsking, refundReason }),
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
    payByTransfer.mockReset()
    isSwitching.value = false
    switchProblem.value = null
    sessionStorage.clear()
    retry.mockReset()
    refundReason.value = null
  })
  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
  })

  it('carries no advertising, confirming or declined', async () => {
    const confirming = await mountView()
    expect(
      confirming
        .find('[aria-label="Espacio publicitario"], .house-spot, .season-bar, .presenter-strip')
        .exists(),
    ).toBe(false)

    outcome.value = 'declined'
    await flushPromises()
    expect(confirming.text()).not.toBe('')
    expect(
      confirming
        .find('[aria-label="Espacio publicitario"], .house-spot, .season-bar, .presenter-strip')
        .exists(),
    ).toBe(false)
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

  it('offers another card, transfer, or the way back to the order of the event', async () => {
    outcome.value = 'declined'
    orderIds.value = ['o1', 'o2']
    rememberCardPaymentEvent(['o1', 'o2'], 'e1')
    const wrapper = await mountView()

    const link = (name: string) =>
      wrapper
        .findAll('a')
        .find((each) => each.text().trim() === name)
        ?.attributes('href')
    expect(link('Intentar con otra tarjeta')).toBe('/checkout/payment?orders=o1,o2&evento=e1')
    expect(link('Volver al pedido')).toBe('/checkout/e1')

    await wrapper
      .findAll('button')
      .find((each) => each.text().trim() === 'Pagar por transferencia')!
      .trigger('click')
    expect(payByTransfer).toHaveBeenCalledTimes(1)
  })

  // Opened in another tab, the event is not known: the order itself is (H-TJ-05).
  it('leads back to the order detail when the event is not known', async () => {
    outcome.value = 'declined'
    orderIds.value = ['o1']
    const wrapper = await mountView()

    const back = wrapper.findAll('a').find((each) => each.text().trim() === 'Volver al pedido')
    expect(back?.attributes('href')).toBe('/account/orders/o1')
    const again = wrapper
      .findAll('a')
      .find((each) => each.text().trim() === 'Intentar con otra tarjeta')
    expect(again?.attributes('href')).toBe('/checkout/payment?orders=o1')
  })

  it('shows the transfer switch busy, and its problem next to it', async () => {
    outcome.value = 'declined'
    orderIds.value = ['o1']
    isSwitching.value = true
    switchProblem.value = 'network'
    const wrapper = await mountView()

    const button = wrapper
      .findAll('button')
      .find((each) => each.text().includes('Pagar por transferencia'))!
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.attributes('aria-busy')).toBe('true')
    expect(wrapper.get('[role="alert"]').text()).toContain('Parece un problema de conexión.')
  })

  it('offers to retry when the payment could not be asked about', async () => {
    outcome.value = 'failed'
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('No pudimos confirmar tu pago')
    expect(wrapper.text()).toContain('No se cobra dos veces.')
    await wrapper
      .findAll('button')
      .find((each) => each.text().includes('Reintentar'))!
      .trigger('click')
    expect(retry).toHaveBeenCalled()
  })

  it('offers a way out besides retrying when the payment could not be confirmed', async () => {
    outcome.value = 'failed'
    const wrapper = await mountView()

    expect(
      wrapper
        .findAll('a')
        .find((link) => link.text() === 'Ir a Mis fotos')
        ?.attributes('href'),
    ).toBe('/account/orders')
  })

  describe('cancelled at the gateway', () => {
    it('says it was cancelled and nothing was charged, and offers to pay again, by transfer, or go back', async () => {
      outcome.value = 'cancelled'
      orderIds.value = ['o1']
      rememberCardPaymentEvent(['o1'], 'e1')
      const wrapper = await mountView()

      expect(wrapper.get('h1').text()).toBe('Cancelaste el pago')
      expect(wrapper.text()).toContain('No se hizo ningún cargo.')
      expect(wrapper.text()).not.toContain('No se cobra dos veces')
      const again = wrapper.findAll('a').find((link) => link.text() === 'Intentar pagar de nuevo')!
      expect(again.attributes('href')).toBe('/checkout/payment?orders=o1&evento=e1')
      await wrapper
        .findAll('button')
        .find((each) => each.text() === 'Pagar por transferencia')!
        .trigger('click')
      expect(payByTransfer).toHaveBeenCalled()
      expect(
        wrapper
          .findAll('a')
          .find((link) => link.text() === 'Volver al pedido')
          ?.attributes('href'),
      ).toBe('/checkout/e1')
      expect(wrapper.findAll('button').some((each) => each.text().includes('Reintentar'))).toBe(
        false,
      )
    })

    it('leads to Mis fotos when its orders are not known', async () => {
      outcome.value = 'cancelled'
      const wrapper = await mountView()

      expect(wrapper.get('h1').text()).toBe('Cancelaste el pago')
      expect(wrapper.findAll('a').map((link) => link.text())).toContain('Ir a Mis fotos')
      expect(wrapper.text()).not.toContain('Intentar pagar de nuevo')
    })
  })

  it.each([
    [
      'order_paid',
      'Cuando llegó el cobro, el pedido ya estaba pagado. Titan TV te devolverá ese dinero.',
    ],
    [
      'order_cancelled',
      'Cuando llegó el cobro, el pedido se había cancelado. Titan TV te devolverá ese dinero.',
    ],
    [
      'order_gifted',
      'Cuando llegó el cobro, el pedido ya era gratis. Titan TV te devolverá ese dinero.',
    ],
  ])(
    'says a charge for an order that no longer took it (%s) is given back, and leads to Mis fotos',
    async (reason, text) => {
      outcome.value = 'refunded'
      refundReason.value = reason
      const wrapper = await mountView()

      expect(wrapper.get('h1').text()).toBe('Recibimos tu pago, pero este pedido ya no lo admitía')
      expect(wrapper.text()).toContain(text)
      expect(wrapper.find('[data-illustration="transferencia"]').exists()).toBe(true)
      expect(
        wrapper
          .findAll('a')
          .find((link) => link.text() === 'Ir a Mis fotos')
          ?.attributes('href'),
      ).toBe('/account/orders')
      expect(wrapper.find('.form-alert--bad, [role="alert"]').exists()).toBe(false)
    },
  )
})
