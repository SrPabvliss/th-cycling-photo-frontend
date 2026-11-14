import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'

const online = ref(true)
vi.mock('@/core/network/use-online', () => ({ useOnline: () => online }))

import OfflineStrip, { BACK_ONLINE_MS } from './OfflineStrip.vue'

describe('OfflineStrip', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    online.value = true
  })
  afterEach(() => vi.useRealTimers())

  it('says nothing while there is network, but keeps its live region ready', () => {
    const wrapper = mount(OfflineStrip)

    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.text()).toBe('')
    expect(wrapper.classes()).not.toContain('offline-strip--open')
  })

  it('says the screen shows what was loaded last when the network goes', async () => {
    const wrapper = mount(OfflineStrip)

    online.value = false
    await nextTick()

    expect(wrapper.classes()).toContain('offline-strip--open')
    expect(wrapper.text()).toBe('Sin conexión. Estás viendo lo último que se cargó.')
  })

  it('shows it at once when the page opens without network', () => {
    online.value = false
    const wrapper = mount(OfflineStrip)

    expect(wrapper.text()).toBe('Sin conexión. Estás viendo lo último que se cargó.')
  })

  it('says the network is back, in the success tone, for two seconds and then goes', async () => {
    online.value = false
    const wrapper = mount(OfflineStrip)

    online.value = true
    await nextTick()
    expect(wrapper.text()).toBe('Conexión restablecida')
    expect(wrapper.classes()).toContain('offline-strip--back')
    expect(BACK_ONLINE_MS).toBe(2000)

    await vi.advanceTimersByTimeAsync(BACK_ONLINE_MS)
    expect(wrapper.classes()).not.toContain('offline-strip--open')
  })

  it('stays when the network goes again before the two seconds end', async () => {
    online.value = false
    const wrapper = mount(OfflineStrip)
    online.value = true
    await nextTick()

    online.value = false
    await nextTick()
    await vi.advanceTimersByTimeAsync(BACK_ONLINE_MS)

    expect(wrapper.text()).toBe('Sin conexión. Estás viendo lo último que se cargó.')
  })
})
