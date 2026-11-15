import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import PasswordRules from './PasswordRules.vue'

const items = (value: string) =>
  mount(PasswordRules, { props: { value } })
    .findAll('li')
    .map((item) => ({ text: item.text(), met: item.attributes('data-met') }))

describe('PasswordRules', () => {
  it('lists the three requirements, all pending for an empty value', () => {
    const wrapper = mount(PasswordRules, { props: { value: '' } })

    expect(wrapper.get('ul').attributes('aria-label')).toBe('Requisitos de la contraseña')
    expect(items('')).toEqual([
      { text: '8 caracteres o más pendiente', met: 'false' },
      { text: 'Una letra pendiente', met: 'false' },
      { text: 'Un número pendiente', met: 'false' },
    ])
  })

  it('marks each requirement met, in words and not only by colour', () => {
    expect(items('ñ1')).toEqual([
      { text: '8 caracteres o más pendiente', met: 'false' },
      { text: 'Una letra cumplido', met: 'true' },
      { text: 'Un número cumplido', met: 'true' },
    ])
    expect(items('abcdefg1').every((item) => item.met === 'true')).toBe(true)
  })
})
