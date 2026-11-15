import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import EmptyState from './EmptyState.vue'
import { ILLUSTRATIONS, type IllustrationKey } from './illustrations'

describe('EmptyState', () => {
  it('shows the title, the text and the actions', () => {
    const wrapper = mount(EmptyState, {
      props: { title: 'Te saliste del camino', text: 'Esta página no existe o cambió de lugar.' },
      slots: { actions: '<button>Ir al inicio</button>' },
    })

    expect(wrapper.get('h2').text()).toBe('Te saliste del camino')
    expect(wrapper.text()).toContain('Esta página no existe o cambió de lugar.')
    expect(wrapper.get('.empty-state__actions button').text()).toBe('Ir al inicio')
  })

  it('leaves out the text and the actions it was not given', () => {
    const wrapper = mount(EmptyState, { props: { title: 'Sin resultados' } })

    expect(wrapper.find('.empty-state__text').exists()).toBe(false)
    expect(wrapper.find('.empty-state__actions').exists()).toBe(false)
  })

  it('makes the title the main heading of the page when asked', () => {
    const wrapper = mount(EmptyState, {
      props: { title: 'Te saliste del camino', headingLevel: 1 },
    })

    expect(wrapper.get('h1').text()).toBe('Te saliste del camino')
    expect(wrapper.find('h2').exists()).toBe(false)
  })

  it('draws the illustration, hidden from assistive technology', () => {
    const wrapper = mount(EmptyState, {
      props: { title: 'Te saliste del camino', illustration: 'fueraDelCamino' },
    })
    const drawing = wrapper.get('svg.empty-state__illustration')

    expect(drawing.attributes('aria-hidden')).toBe('true')
    expect(drawing.element.children.length).toBeGreaterThan(0)
  })

  it('draws nothing, and does not break, for an illustration it does not know', () => {
    const wrapper = mount(EmptyState, {
      props: { title: 'Algo', illustration: 'noExiste' as IllustrationKey },
    })

    expect(wrapper.find('svg').exists()).toBe(false)
    expect(wrapper.get('h2').text()).toBe('Algo')
  })
})

describe('illustrations', () => {
  it('has the drawings of the status pages', () => {
    expect(Object.keys(ILLUSTRATIONS)).toEqual(
      expect.arrayContaining(['fueraDelCamino', 'fallaMecanica', 'enlaceRoto', 'errorCarga']),
    )
  })

  it('has the drawings of the error states', () => {
    expect(Object.keys(ILLUSTRATIONS)).toEqual(
      expect.arrayContaining(['sinConexion', 'tardando', 'sesionVencida']),
    )
  })

  it.each(Object.entries(ILLUSTRATIONS))('%s takes every color from a token', (_key, markup) => {
    expect(markup).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(markup).not.toContain('rgb(')
    expect(markup).not.toContain('<svg')
    expect(markup).toContain('var(--tt-')
  })

  it('counts as a problem on the client screen only when it says it is one', async () => {
    const { hasScreenProblem } = await import('@/core/layout/client/screen-problem')
    const host = document.createElement('main')
    host.className = 'client-layout__main'
    document.body.appendChild(host)

    const plain = mount(EmptyState, { props: { title: 'Todavía no tienes fotos' }, attachTo: host })
    await nextTick()
    expect(hasScreenProblem.value).toBe(false)
    plain.unmount()

    const problem = mount(EmptyState, {
      props: { title: 'Este enlace ya venció', problem: true },
      attachTo: host,
    })
    await nextTick()
    expect(hasScreenProblem.value).toBe(true)
    problem.unmount()
    expect(hasScreenProblem.value).toBe(false)
  })
})
