import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import PhotoPriceStrip from './PhotoPriceStrip.vue'

describe('PhotoPriceStrip', () => {
  it('renders the formatted unit price', () => {
    const w = mount(PhotoPriceStrip, { props: { unitPrice: 4, currency: 'USD' } })
    expect(w.get('.price-strip__now').text()).toContain('$4.00')
  })

  it('strikes through the base price when discounted', () => {
    const w = mount(PhotoPriceStrip, { props: { unitPrice: 3, basePrice: 4, currency: 'USD' } })
    expect(w.get('.price-strip__was').text()).toContain('$4.00')
    expect(w.get('.price-strip__now').text()).toContain('$3.00')
  })

  it('hides the base price when not discounted', () => {
    const w = mount(PhotoPriceStrip, { props: { unitPrice: 4, basePrice: 4, currency: 'USD' } })
    expect(w.find('.price-strip__was').exists()).toBe(false)
  })

  it('shows a placeholder while loading', () => {
    const w = mount(PhotoPriceStrip, { props: { unitPrice: 4, currency: 'USD', isLoading: true } })
    expect(w.text()).toContain('…')
  })

  it('pulses when the unit price drops', async () => {
    const w = mount(PhotoPriceStrip, { props: { unitPrice: 4, currency: 'USD' } })
    await w.setProps({ unitPrice: 3 })
    await nextTick() // flush watch
    await nextTick() // flush inner nextTick that re-adds pulse class
    expect(w.classes()).toContain('price-strip--pulse')
  })

  it('does not pulse when the price rises', async () => {
    const w = mount(PhotoPriceStrip, { props: { unitPrice: 3, currency: 'USD' } })
    await w.setProps({ unitPrice: 4 })
    await nextTick()
    expect(w.classes()).not.toContain('price-strip--pulse')
  })
})
