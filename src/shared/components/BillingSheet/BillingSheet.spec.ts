import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import BillingSheet from './BillingSheet.vue'

vi.mock('@vueuse/core', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@vueuse/core')>()),
  useMediaQuery: () => ref(true),
}))

afterEach(() => {
  document.documentElement.style.overflow = ''
})

describe('BillingSheet', () => {
  it('locks the page scroll while the mobile sheet is open and releases it on close', async () => {
    const wrapper = mount(BillingSheet, { props: { title: '¿A nombre de quién?' } })
    await wrapper.vm.$nextTick()

    expect(document.documentElement.style.overflow).toBe('hidden')

    wrapper.unmount()

    expect(document.documentElement.style.overflow).toBe('')
  })
})
