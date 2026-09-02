import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import FirstRun from './FirstRun.vue'

describe('FirstRun', () => {
  it('offers the organizer a way to create their first event', async () => {
    const wrapper = mount(FirstRun, { props: { role: 'organizer', canCreate: true } })

    const action = wrapper.find('[data-test="create-first-event"]')
    expect(action.exists()).toBe(true)

    await action.trigger('click')
    expect(wrapper.emitted('create')).toHaveLength(1)
  })

  it('addresses the organizer directly instead of talking about organizers', () => {
    const wrapper = mount(FirstRun, { props: { role: 'organizer', canCreate: true } })

    expect(wrapper.text()).not.toContain('un organizador')
  })

  it('hides the action when the organizer has no slot left', () => {
    const wrapper = mount(FirstRun, { props: { role: 'organizer', canCreate: false } })

    expect(wrapper.find('[data-test="create-first-event"]').exists()).toBe(false)
  })

  it('also lets platform staff create the first event of the platform', () => {
    const wrapper = mount(FirstRun, { props: { role: 'titan', canCreate: true } })

    expect(wrapper.find('[data-test="create-first-event"]').exists()).toBe(true)
  })
})

describe('FirstRun wording for the platform', () => {
  it('does not tell platform staff to wait when they can create the event themselves', () => {
    const wrapper = mount(FirstRun, { props: { role: 'titan', canCreate: true } })

    expect(wrapper.text()).toContain('Crea el primero')
  })

  it('keeps the waiting wording when the platform cannot create', () => {
    const wrapper = mount(FirstRun, { props: { role: 'titan', canCreate: false } })

    expect(wrapper.text()).toContain('Cuando un organizador con cupo')
  })
})
