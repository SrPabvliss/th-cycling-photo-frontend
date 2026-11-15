import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import BusyNote from './BusyNote.vue'

describe('BusyNote', () => {
  it('announces what is going on as a status', () => {
    const wrapper = mount(BusyNote, { props: { text: 'Confirmando tu pago' } })

    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.text()).toBe('Confirmando tu pago')
  })

  it('comes in two sizes, medium by default', () => {
    expect(mount(BusyNote, { props: { text: 'Abriendo' } }).classes()).toContain('busy-note--m')
    expect(mount(BusyNote, { props: { text: 'Abriendo', size: 's' } }).classes()).toContain(
      'busy-note--s',
    )
  })
})
