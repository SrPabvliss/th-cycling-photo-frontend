import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import type { MyOrderState } from '../../../types/responses/my-order.response'
import OrderStatePill from './OrderStatePill.vue'

describe('OrderStatePill', () => {
  it.each<[MyOrderState, string]>([
    ['ready', 'Lista para descargar'],
    ['in_process', 'Esperando pago'],
    ['confirming', 'Confirmando pago'],
    ['cancelled', 'Cancelada'],
    ['gifted', 'Regalo del organizador'],
  ])('says %s in words', (state, text) => {
    const wrapper = mount(OrderStatePill, { props: { state } })

    expect(wrapper.text()).toBe(text)
    expect(wrapper.attributes('data-state')).toBe(state)
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})
