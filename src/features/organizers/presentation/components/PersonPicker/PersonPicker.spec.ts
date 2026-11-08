import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import type { IPickablePerson } from '../../../types/responses/pickable-person.response'
import PersonPicker from './PersonPicker.vue'

function person(id: string, name: string): IPickablePerson {
  return {
    id,
    name,
    email: `${id}@titantv.test`,
    since: new Date(2026, 0, 10),
    emailVerified: true,
    hasOrganizer: false,
    organizerName: null,
  }
}

// jsdom has no layout, so it does not implement scrollIntoView.
Element.prototype.scrollIntoView = vi.fn()

const ANA = person('ana', 'Ana Paredes')
const LUIS = person('luis', 'Luis Mena')

function mountPicker(props: Partial<InstanceType<typeof PersonPicker>['$props']> = {}) {
  return mount(PersonPicker, {
    props: { picked: null, users: [], search: '', ...props },
  })
}

async function focusSearch(wrapper: ReturnType<typeof mountPicker>) {
  const input = wrapper.find('[data-test="person-search-input"]')
  await input.trigger('focus')
  return input
}

describe('PersonPicker', () => {
  it('opens the floating list only while the search is focused', async () => {
    const wrapper = mountPicker({ search: 'an', users: [ANA, LUIS] })

    expect(wrapper.find('[data-test="person-picker-list"]').exists()).toBe(false)

    await focusSearch(wrapper)
    expect(wrapper.find('[data-test="person-picker-list"]').exists()).toBe(true)
  })

  it('picks the person under the pointer', async () => {
    const wrapper = mountPicker({ search: 'lu', users: [ANA, LUIS] })
    await focusSearch(wrapper)

    await wrapper.find('[data-test="person-option-luis"]').trigger('mousedown')

    expect(wrapper.emitted('pick')).toEqual([[LUIS]])
  })

  it('moves through the results with the arrows and picks with enter', async () => {
    const wrapper = mountPicker({ search: 'an', users: [ANA, LUIS] })
    const input = await focusSearch(wrapper)

    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('pick')).toEqual([[LUIS]])
  })

  it('wraps around from the first result to the last one', async () => {
    const wrapper = mountPicker({ search: 'an', users: [ANA, LUIS] })
    const input = await focusSearch(wrapper)

    await input.trigger('keydown', { key: 'ArrowUp' })
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('pick')).toEqual([[LUIS]])
  })

  it('closes the list with escape', async () => {
    const wrapper = mountPicker({ search: 'an', users: [ANA] })
    const input = await focusSearch(wrapper)

    await input.trigger('keydown', { key: 'Escape' })

    expect(wrapper.find('[data-test="person-picker-list"]').exists()).toBe(false)
  })

  it('does not claim nobody matched before the search is long enough to run', async () => {
    const wrapper = mountPicker({ search: 'a', users: [] })
    await focusSearch(wrapper)

    expect(wrapper.text()).not.toContain('Nadie con ese nombre')
  })

  it('says nobody matched once a real search came back empty', async () => {
    const wrapper = mountPicker({ search: 'zz', users: [] })
    await focusSearch(wrapper)

    expect(wrapper.text()).toContain('Nadie con ese nombre')
  })

  it('shows the picked person with a way to choose someone else', async () => {
    const wrapper = mountPicker({ picked: ANA })

    expect(wrapper.find('[data-test="picked-person"]').text()).toContain('Ana Paredes')
    await wrapper.find('[data-test="picked-person-clear"]').trigger('click')
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  it('does not let a locked holder be swapped', () => {
    const wrapper = mountPicker({ picked: ANA, locked: true })

    expect(wrapper.find('[data-test="picked-person-clear"]').exists()).toBe(false)
  })
})
