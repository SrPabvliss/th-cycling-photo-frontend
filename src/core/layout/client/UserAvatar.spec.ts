import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import UserAvatar from './UserAvatar.vue'

describe('UserAvatar', () => {
  it('shows the initial of the name', () => {
    const wrapper = mount(UserAvatar, { props: { name: 'María Pérez' } })

    expect(wrapper.text()).toBe('M')
    expect(wrapper.find('svg').exists()).toBe(false)
  })

  it.each([null, undefined, '', '   ', '🚴'])(
    'shows a person, never an empty circle, when the name gives no initial (%j)',
    (name) => {
      const wrapper = mount(UserAvatar, { props: { name } })

      expect(wrapper.text()).toBe('')
      expect(wrapper.find('svg').exists()).toBe(true)
    },
  )

  it('is decoration: whoever holds it gives the accessible name', () => {
    expect(mount(UserAvatar, { props: { name: 'Ana' } }).attributes('aria-hidden')).toBe('true')
  })

  it('comes in two sizes, small by default', () => {
    expect(mount(UserAvatar).classes()).toContain('user-avatar--s')
    expect(mount(UserAvatar, { props: { size: 'm' } }).classes()).toContain('user-avatar--m')
  })
})
