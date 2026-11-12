import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import ErrorState from './ErrorState.vue'

describe('ErrorState', () => {
  it('says what failed with its default copy, as an alert', () => {
    const wrapper = mount(ErrorState)

    expect(wrapper.attributes('role')).toBe('alert')
    expect(wrapper.text()).toContain('No pudimos cargar esto')
    expect(wrapper.text()).toContain('Puede ser tu conexión.')
  })

  it('takes its own title and text', () => {
    const wrapper = mount(ErrorState, {
      props: { title: 'No pudimos cargar los eventos', text: 'Inténtalo de nuevo.' },
    })

    expect(wrapper.text()).toContain('No pudimos cargar los eventos')
    expect(wrapper.text()).toContain('Inténtalo de nuevo.')
  })

  it('asks to retry when the button is pressed', async () => {
    const wrapper = mount(ErrorState)

    await wrapper.get('button').trigger('click')

    expect(wrapper.get('button').text()).toBe('Reintentar')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('blocks the button while a retry is on its way', async () => {
    const wrapper = mount(ErrorState, { props: { retrying: true } })
    const button = wrapper.get('button')

    await button.trigger('click')

    expect(button.attributes('disabled')).toBeDefined()
    expect(wrapper.emitted('retry')).toBeUndefined()
  })
})
