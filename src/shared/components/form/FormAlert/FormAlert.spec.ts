import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import FormAlert from './FormAlert.vue'

describe('FormAlert', () => {
  it('announces a bad message at once', () => {
    const wrapper = mount(FormAlert, { props: { tone: 'bad', title: 'No pudimos guardar' } })

    expect(wrapper.attributes('role')).toBe('alert')
    expect(wrapper.text()).toContain('No pudimos guardar')
  })

  it('offers no retry unless someone listens for it', () => {
    const wrapper = mount(FormAlert, { props: { tone: 'bad', title: 'No pudimos cargar' } })

    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('offers to retry when asked to', async () => {
    const onRetry = vi.fn()
    const wrapper = mount(FormAlert, {
      props: { tone: 'bad', title: 'No pudimos cargar', text: 'Puede ser tu conexión.', onRetry },
    })

    const retry = wrapper.get('button')
    expect(retry.text()).toBe('Reintentar')
    expect(retry.attributes('type')).toBe('button')

    await retry.trigger('click')
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('takes no more presses while a retry is on its way', () => {
    const wrapper = mount(FormAlert, {
      props: { tone: 'bad', title: 'No pudimos cargar', retrying: true, onRetry: vi.fn() },
    })

    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
    expect(wrapper.get('button').attributes('aria-busy')).toBe('true')
  })
})
