import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import ProgressCount from './ProgressCount.vue'

describe('ProgressCount', () => {
  it('says how far along the work is', () => {
    const wrapper = mount(ProgressCount, { props: { done: 3, total: 8, label: 'Descargando' } })
    const bar = wrapper.get('[role="progressbar"]')

    expect(wrapper.text()).toContain('Descargando 3 de 8')
    expect(bar.attributes('aria-valuenow')).toBe('3')
    expect(bar.attributes('aria-valuemin')).toBe('0')
    expect(bar.attributes('aria-valuemax')).toBe('8')
  })

  it('never counts past the total', () => {
    const wrapper = mount(ProgressCount, { props: { done: 9, total: 8, label: 'Descargando' } })

    expect(wrapper.text()).toContain('Descargando 8 de 8')
    expect(wrapper.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('8')
  })

  it('never counts below zero', () => {
    const wrapper = mount(ProgressCount, { props: { done: -2, total: 8, label: 'Descargando' } })

    expect(wrapper.text()).toContain('Descargando 0 de 8')
  })

  it('shows an empty bar when there is nothing to count', () => {
    const wrapper = mount(ProgressCount, { props: { done: 0, total: 0, label: 'Descargando' } })

    expect(wrapper.get('.progress-count__fill').attributes('style')).toContain('width: 0%')
  })

  it('leaves room for a way out', () => {
    const wrapper = mount(ProgressCount, {
      props: { done: 1, total: 2, label: 'Descargando' },
      slots: { action: '<button>Cancelar</button>' },
    })

    expect(wrapper.get('button').text()).toBe('Cancelar')
  })
})
