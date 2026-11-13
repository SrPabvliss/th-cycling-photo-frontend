import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import BillingSheet from './BillingSheet.vue'

const isMobile = vi.hoisted(() => ({ value: true }))
vi.mock('@vueuse/core', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@vueuse/core')>()),
  useMediaQuery: () => ref(isMobile.value),
}))

afterEach(() => {
  document.documentElement.style.overflow = ''
  isMobile.value = true
})

describe('BillingSheet', () => {
  it('closes from a button named "Cerrar" on a phone', () => {
    const wrapper = mount(BillingSheet, { props: { title: 'Datos de facturación' } })

    expect(wrapper.get('.billing-sheet__close').attributes('aria-label')).toBe('Cerrar')
  })

  it('closes from a button named "Cerrar" from 768 px too', async () => {
    isMobile.value = false
    const modal = {
      name: 'Modal',
      props: ['show', 'closable', 'title'],
      template: '<div><slot name="header-extra" /><slot /></div>',
    }
    const wrapper = mount(BillingSheet, {
      props: { title: 'Datos de facturación' },
      global: { stubs: { Modal: modal } },
    })

    expect(wrapper.findComponent({ name: 'Modal' }).props('closable')).toBe(false)
    await wrapper.get('button[aria-label="Cerrar"]').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('locks the page scroll while the mobile sheet is open and releases it on close', async () => {
    const wrapper = mount(BillingSheet, { props: { title: '¿A nombre de quién?' } })
    await wrapper.vm.$nextTick()

    expect(document.documentElement.style.overflow).toBe('hidden')

    wrapper.unmount()

    expect(document.documentElement.style.overflow).toBe('')
  })
})
