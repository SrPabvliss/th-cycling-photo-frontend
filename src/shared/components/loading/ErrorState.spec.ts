import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import ErrorState from './ErrorState.vue'

const what = 'los eventos'

describe('ErrorState', () => {
  it('says what did not show, with the drawing of its cause, as an alert', () => {
    const wrapper = mount(ErrorState, { props: { what } })

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.get('.error-state__title').text()).toBe('No pudimos mostrar los eventos')
    expect(wrapper.get('.error-state__text').text()).toBe('Vuelve a intentarlo en un momento.')
    expect(wrapper.get('svg').attributes('data-illustration')).toBe('errorCarga')
    expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true')
  })

  it('takes words and drawing from the cause', () => {
    const server = mount(ErrorState, { props: { what, kind: 'server' } })
    const slow = mount(ErrorState, { props: { what, kind: 'timeout' } })

    expect(server.get('svg').attributes('data-illustration')).toBe('fallaMecanica')
    expect(slow.get('.error-state__title').text()).toBe('Está tardando más de lo normal')
    expect(slow.get('svg').attributes('data-illustration')).toBe('tardando')
  })

  it('without network, waits with no button and only tells, not alerts', () => {
    const wrapper = mount(ErrorState, { props: { what, kind: 'offline' } })

    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    expect(wrapper.get('.error-state__text').text()).toBe(
      'Los eventos aparecerán cuando vuelvas a tener conexión.',
    )
  })

  it('still takes its own title and text', () => {
    const wrapper = mount(ErrorState, {
      props: {
        what: 'tus compras',
        title: 'No pudimos mostrar tus compras',
        text: 'Tus fotos están a salvo.',
      },
    })

    expect(wrapper.get('.error-state__title').text()).toBe('No pudimos mostrar tus compras')
    expect(wrapper.get('.error-state__text').text()).toBe('Tus fotos están a salvo.')
  })

  it('keeps the words of the cause when it is not one the screen can name better', () => {
    const wrapper = mount(ErrorState, {
      props: {
        what: 'tu pedido',
        kind: 'offline',
        title: 'No pudimos mostrar tu pedido',
        text: 'Tu pedido está guardado.',
      },
    })

    expect(wrapper.get('.error-state__title').text()).toBe('Sin conexión a internet')
    expect(wrapper.get('.error-state__text').text()).toBe(
      'Tu pedido aparecerá cuando vuelvas a tener conexión.',
    )
  })

  it('stacks in a centred column when it is all the screen has', () => {
    const wrapper = mount(ErrorState, { props: { what, stacked: true } })

    expect(wrapper.classes()).toContain('error-state--stacked')
  })

  it('asks to retry when the button is pressed', async () => {
    const wrapper = mount(ErrorState, { props: { what } })

    await wrapper.get('button').trigger('click')

    expect(wrapper.get('button').text()).toBe('Reintentar')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('blocks the button while a retry is on its way', async () => {
    const wrapper = mount(ErrorState, { props: { what, retrying: true } })
    const button = wrapper.get('button')

    await button.trigger('click')

    expect(button.attributes('disabled')).toBeDefined()
    expect(wrapper.emitted('retry')).toBeUndefined()
  })
})
