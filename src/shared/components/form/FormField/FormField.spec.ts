import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'

import FormField from './FormField.vue'

function mountField(props: { error?: string; hint?: string }) {
  return mount(FormField, {
    props: { id: 'f-email', label: 'Correo', ...props },
    slots: {
      default: (slot: { id: string; describedby?: string; invalid?: boolean }) =>
        h('input', {
          id: slot.id,
          'aria-describedby': slot.describedby,
          'aria-invalid': slot.invalid,
        }),
    },
  })
}

describe('FormField', () => {
  it('labels the control', () => {
    const wrapper = mountField({})

    expect(wrapper.get('label').attributes('for')).toBe('f-email')
    expect(wrapper.get('input').attributes('aria-invalid')).toBeUndefined()
    expect(wrapper.get('input').attributes('aria-describedby')).toBeUndefined()
  })

  it('ties the hint to the control', () => {
    const wrapper = mountField({ hint: 'Aquí te escribimos.' })

    expect(wrapper.get('input').attributes('aria-describedby')).toBe('f-email-hint')
    expect(wrapper.get('#f-email-hint').text()).toBe('Aquí te escribimos.')
  })

  it('marks the control invalid and ties the error first', () => {
    const wrapper = mountField({ error: 'Escribe tu correo.', hint: 'Ayuda' })

    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('input').attributes('aria-describedby')).toBe('f-email-error f-email-hint')
    expect(wrapper.get('#f-email-error').text()).toBe('Escribe tu correo.')
  })
})
