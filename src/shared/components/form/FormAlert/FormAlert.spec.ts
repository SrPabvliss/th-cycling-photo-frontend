import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import FormAlert from './FormAlert.vue'

describe('FormAlert', () => {
  it('announces a bad message at once', () => {
    const wrapper = mount(FormAlert, { props: { tone: 'bad', title: 'No pudimos guardar' } })

    expect(wrapper.attributes('role')).toBe('alert')
    expect(wrapper.text()).toContain('No pudimos guardar')
  })

  it('announces at once that something did not load, in the amber tone', () => {
    const wrapper = mount(FormAlert, { props: { tone: 'warn', title: 'No pudimos cargar' } })

    expect(wrapper.attributes('role')).toBe('alert')
    expect(wrapper.classes()).toContain('form-alert--warn')
  })

  it('leads with the warning sign when something went wrong, and the info sign otherwise', () => {
    const bad = mount(FormAlert, { props: { tone: 'bad', title: 'No pudimos guardar' } })
    const warn = mount(FormAlert, { props: { tone: 'warn', title: 'No pudimos cargar' } })
    const info = mount(FormAlert, { props: { tone: 'info', title: 'Factura anulada' } })

    expect(bad.get('svg').attributes('aria-hidden')).toBe('true')
    expect(bad.get('svg').attributes('data-icon')).toBe('warn')
    expect(warn.get('svg').attributes('data-icon')).toBe('warn')
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
  it('puts the title on one line and the detail under it, as written', () => {
    const wrapper = mount(FormAlert, {
      props: {
        tone: 'warn',
        title: 'No pudimos mostrar las carreras',
        text: 'Vuelve a intentarlo en un momento.',
      },
    })

    expect(wrapper.get('.form-alert__title').text()).toBe('No pudimos mostrar las carreras')
    expect(wrapper.get('.form-alert__text').text()).toBe('Vuelve a intentarlo en un momento.')
    expect(wrapper.get('.form-alert__title').element.nextElementSibling).toBe(
      wrapper.get('.form-alert__text').element,
    )
  })

  it('leaves the detail line out when there is none', () => {
    const wrapper = mount(FormAlert, { props: { tone: 'info', title: 'Factura anulada' } })

    expect(wrapper.get('.form-alert__title').text()).toBe('Factura anulada')
    expect(wrapper.find('.form-alert__text').exists()).toBe(false)
  })

  it('puts the retry and any other way out beside the text, not under it', () => {
    const wrapper = mount(FormAlert, {
      props: { tone: 'warn', title: 'No pudimos cargar', onRetry: vi.fn() },
      slots: { actions: '<a href="/x">Ir a Mis fotos</a>', default: '<p class="more">Más</p>' },
    })

    const body = wrapper.get('.form-alert__body')
    const actions = wrapper.get('.form-alert__actions')
    expect(body.find('button').exists()).toBe(false)
    expect(body.find('.more').exists()).toBe(true)
    expect(actions.find('a').text()).toBe('Ir a Mis fotos')
    expect(actions.find('button').text()).toBe('Reintentar')
    expect(actions.find('button').classes()).toContain('form-alert__out')
    expect(body.element.nextElementSibling).toBe(actions.element)
  })

  it('leaves no action box when there is nothing to do', () => {
    const wrapper = mount(FormAlert, { props: { tone: 'info', title: 'Factura anulada' } })

    expect(wrapper.find('.form-alert__actions').exists()).toBe(false)
  })
})
