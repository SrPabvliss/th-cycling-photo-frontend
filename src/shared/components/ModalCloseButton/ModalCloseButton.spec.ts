import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import ModalCloseButton from './ModalCloseButton.vue'

describe('ModalCloseButton', () => {
  it('is named in Spanish and asks to close', async () => {
    const wrapper = mount(ModalCloseButton)

    const button = wrapper.get('button')
    expect(button.attributes('aria-label')).toBe('Cerrar')
    expect(button.attributes('type')).toBe('button')

    await button.trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
