import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import ProfileSection from './ProfileSection.vue'

function mountSection(open: boolean, meta?: string) {
  return mount(ProfileSection, {
    props: { id: 'tels', title: 'Teléfonos', icon: 'phone', meta, metaTone: 'muted', open },
    slots: { default: '<p class="body">Lista</p>' },
  })
}

describe('ProfileSection', () => {
  it('is a button that says whether it is open and what it controls', () => {
    const wrapper = mountSection(false, '2 números')

    const head = wrapper.get('button')
    expect(head.text()).toContain('Teléfonos')
    expect(head.text()).toContain('2 números')
    expect(head.attributes('aria-expanded')).toBe('false')
    expect(head.attributes('aria-controls')).toBe('perfil-tels')
  })

  it('mounts its body only while open', () => {
    expect(mountSection(false).find('.body').exists()).toBe(false)

    const open = mountSection(true)
    expect(open.get('button').attributes('aria-expanded')).toBe('true')
    expect(open.get('#perfil-tels').find('.body').exists()).toBe(true)
  })

  it('asks to open and to close', async () => {
    const closed = mountSection(false)
    await closed.get('button').trigger('click')
    expect(closed.emitted('update:open')).toEqual([[true]])

    const open = mountSection(true)
    await open.get('button').trigger('click')
    expect(open.emitted('update:open')).toEqual([[false]])
  })
})
