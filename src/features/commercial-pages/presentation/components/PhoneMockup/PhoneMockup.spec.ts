import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import PhoneMockup from './PhoneMockup.vue'

describe('PhoneMockup', () => {
  it('is decoration only', () => {
    const wrapper = mount(PhoneMockup, { props: { blocks: [{ kind: 'bar' }] } })

    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })

  it('carries a short label for a piece that must fit a narrow phone, hidden until asked for', () => {
    const wrapper = mount(PhoneMockup, {
      props: {
        blocks: [{ kind: 'mark', shape: 'strip', text: 'Presenta: tu marca', short: 'Tu marca' }],
      },
    })

    const labels = wrapper.findAll('.phone-mockup__label')
    expect(labels.map((label) => label.text())).toEqual(['Presenta: tu marca', 'Tu marca'])
    expect(labels[1]!.classes()).toContain('phone-mockup__label--short')
  })

  it('writes a piece without a short label as it is', () => {
    const wrapper = mount(PhoneMockup, {
      props: { blocks: [{ kind: 'mark', shape: 'band', text: 'Tu marca aquí' }] },
    })

    expect(wrapper.find('.phone-mockup__mark').text()).toBe('Tu marca aquí')
    expect(wrapper.find('.phone-mockup__label').exists()).toBe(false)
  })
})
