import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { AxiosError } from 'axios'

import LoadBoundary from './LoadBoundary.vue'

type Status = 'pending' | 'error' | 'success'

const slots = {
  skeleton: '<p data-test="skeleton">esqueleto</p>',
  empty: '<p data-test="empty">Todavía no hay nada</p>',
  default: '<p data-test="content">contenido</p>',
}

function mountBoundary(props: {
  status: Status
  empty?: boolean
  refreshing?: boolean
  error?: unknown
  stacked?: boolean
}) {
  return mount(LoadBoundary, { props: { what: 'los eventos', ...props }, slots })
}

describe('LoadBoundary', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('paints nothing while a pending load is still fast', () => {
    const wrapper = mountBoundary({ status: 'pending' })

    expect(wrapper.find('[data-test="skeleton"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="content"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="empty"]').exists()).toBe(false)
  })

  it('paints the skeleton and says it is busy once the load takes long', async () => {
    const wrapper = mountBoundary({ status: 'pending' })

    await vi.advanceTimersByTimeAsync(400)

    expect(wrapper.find('[data-test="skeleton"]').exists()).toBe(true)
    expect(wrapper.attributes('aria-busy')).toBe('true')
  })

  it('keeps the skeleton for its minimum time when the data lands right after it shows', async () => {
    const wrapper = mountBoundary({ status: 'pending' })
    await vi.advanceTimersByTimeAsync(400)

    await wrapper.setProps({ status: 'success' })
    await vi.advanceTimersByTimeAsync(100)
    expect(wrapper.find('[data-test="skeleton"]').exists()).toBe(true)

    await vi.advanceTimersByTimeAsync(300)
    expect(wrapper.find('[data-test="skeleton"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="content"]').exists()).toBe(true)
  })

  it('paints the error with a way to retry', async () => {
    const wrapper = mountBoundary({ status: 'error' })

    expect(wrapper.text()).toContain('No pudimos mostrar los eventos')
    expect(wrapper.find('[data-test="empty"]').exists()).toBe(false)

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('passes its own error copy on', () => {
    const wrapper = mount(LoadBoundary, {
      props: {
        status: 'error',
        what: 'los eventos',
        errorTitle: 'No pudimos cargar los eventos',
        errorText: 'Otra vez.',
      },
      slots,
    })

    expect(wrapper.text()).toContain('No pudimos cargar los eventos')
    expect(wrapper.text()).toContain('Otra vez.')
  })

  it('blocks the retry button while the retry is on its way', () => {
    const wrapper = mountBoundary({ status: 'error', refreshing: true })

    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  })

  it('paints the empty slot, and no error, when the load worked and there is nothing', () => {
    const wrapper = mountBoundary({ status: 'success', empty: true })

    expect(wrapper.find('[data-test="empty"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('No pudimos mostrar')
    expect(wrapper.find('[data-test="content"]').exists()).toBe(false)
  })

  it('paints the content when the load worked', () => {
    const wrapper = mountBoundary({ status: 'success' })

    expect(wrapper.find('[data-test="content"]').exists()).toBe(true)
    expect(wrapper.attributes('aria-busy')).toBeUndefined()
  })

  it('keeps the content mounted and marks it busy while it refreshes', () => {
    const wrapper = mountBoundary({ status: 'success', refreshing: true })

    expect(wrapper.find('[data-test="content"]').exists()).toBe(true)
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.find('.load-boundary__content--refreshing').exists()).toBe(true)
  })

  it('never paints the empty slot on the way from an error to a new attempt', async () => {
    const wrapper = mountBoundary({ status: 'error' })

    await wrapper.setProps({ status: 'pending' })
    expect(wrapper.find('[data-test="empty"]').exists()).toBe(false)

    await vi.advanceTimersByTimeAsync(200)
    expect(wrapper.find('[data-test="empty"]').exists()).toBe(false)

    await vi.advanceTimersByTimeAsync(200)
    expect(wrapper.find('[data-test="empty"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="skeleton"]').exists()).toBe(true)
  })

  it('tells the cause of the error it was given', () => {
    const wrapper = mountBoundary({
      status: 'error',
      error: new AxiosError('timeout', 'ECONNABORTED'),
    })

    expect(wrapper.text()).toContain('Está tardando más de lo normal')
  })

  it('passes the stacked look on', () => {
    const wrapper = mountBoundary({ status: 'error', stacked: true })

    expect(wrapper.find('.error-state--stacked').exists()).toBe(true)
  })

  it('keeps the height of the skeleton when the load fails, so nothing jumps', async () => {
    const wrapper = mountBoundary({ status: 'pending' })
    await vi.advanceTimersByTimeAsync(400)
    Object.defineProperty(wrapper.element, 'offsetHeight', { configurable: true, value: 180 })

    await wrapper.setProps({ status: 'error' })
    await vi.advanceTimersByTimeAsync(400)

    expect(wrapper.get('.error-state').attributes('style')).toContain('min-block-size: 180px')
  })

  it('sets no height when nothing was painted before the error', () => {
    const wrapper = mountBoundary({ status: 'error' })

    expect(wrapper.get('.error-state').attributes('style')).toBeUndefined()
  })
})
