import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import FormAlert from './FormAlert.vue'

describe('FormAlert', () => {
  it('announces a bad message at once', () => {
    const wrapper = mount(FormAlert, { props: { tone: 'bad', title: 'No pudimos guardar' } })

    expect(wrapper.attributes('role')).toBe('alert')
    expect(wrapper.text()).toContain('No pudimos guardar')
  })

  it('leads with the warning sign when something went wrong, and the info sign otherwise', () => {
    const bad = mount(FormAlert, { props: { tone: 'bad', title: 'No pudimos cargar' } })
    const info = mount(FormAlert, { props: { tone: 'info', title: 'Factura anulada' } })

    expect(bad.get('svg').attributes('aria-hidden')).toBe('true')
    expect(bad.get('svg').attributes('data-icon')).toBe('warn')
    expect(info.get('svg').attributes('data-icon')).toBe('info')
    expect(info.attributes('role')).toBeUndefined()
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

describe('FormAlert layout', () => {
  it('says the title and the detail as one sentence block, the title first', () => {
    const wrapper = mount(FormAlert, {
      props: {
        tone: 'bad',
        title: 'No pudimos cargar las carreras',
        text: 'Puede ser tu conexión.',
      },
    })

    const message = wrapper.get('.form-alert__message')
    expect(message.element.tagName).toBe('P')
    expect(message.text().replace(/\s+/g, ' ')).toBe(
      'No pudimos cargar las carreras. Puede ser tu conexión.',
    )
    expect(message.get('strong').text()).toBe('No pudimos cargar las carreras.')
  })

  it('keeps the title as it is when there is no detail, or when it already ends a sentence', () => {
    const alone = mount(FormAlert, { props: { tone: 'info', title: 'Factura anulada' } })
    const asked = mount(FormAlert, {
      props: { tone: 'bad', title: '¿Seguimos?', text: 'Puede ser tu conexión.' },
    })

    expect(alone.get('.form-alert__message').text()).toBe('Factura anulada')
    expect(asked.get('strong').text()).toBe('¿Seguimos?')
  })

  it('puts the retry and any other way out beside the text, not under it', () => {
    const wrapper = mount(FormAlert, {
      props: { tone: 'bad', title: 'No pudimos cargar', onRetry: vi.fn() },
      slots: { actions: '<a href="/x">Ir a Mis fotos</a>', default: '<p class="more">Más</p>' },
    })

    const body = wrapper.get('.form-alert__body')
    const actions = wrapper.get('.form-alert__actions')
    expect(body.find('button').exists()).toBe(false)
    expect(body.find('.more').exists()).toBe(true)
    expect(actions.find('a').text()).toBe('Ir a Mis fotos')
    expect(actions.find('button').text()).toBe('Reintentar')
    expect(body.element.nextElementSibling).toBe(actions.element)
  })

  it('leaves no action box when there is nothing to do', () => {
    const wrapper = mount(FormAlert, { props: { tone: 'info', title: 'Factura anulada' } })

    expect(wrapper.find('.form-alert__actions').exists()).toBe(false)
  })
})
