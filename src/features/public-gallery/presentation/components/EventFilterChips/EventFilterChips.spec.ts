import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import EventFilterChips from './EventFilterChips.vue'

const eventTypes = [
  { id: 3, name: 'Downhill' },
  { id: 5, name: 'Enduro' },
]

const pressed = (wrapper: ReturnType<typeof mount>) =>
  wrapper
    .findAll('button')
    .filter((button) => button.attributes('aria-pressed') === 'true')
    .map((button) => button.text())

describe('EventFilterChips', () => {
  it('offers every event, those with photos, and one chip per event type', () => {
    const wrapper = mount(EventFilterChips, { props: { eventTypes, modelValue: 'all' } })

    expect(wrapper.findAll('button').map((button) => button.text())).toEqual([
      'Todos',
      'Con fotos',
      'Downhill',
      'Enduro',
    ])
  })

  it('has only the two fixed chips when there are no event types', () => {
    const wrapper = mount(EventFilterChips, { props: { eventTypes: [], modelValue: 'all' } })

    expect(wrapper.findAll('button')).toHaveLength(2)
  })

  it.each([
    ['all', 'Todos'],
    ['photos', 'Con fotos'],
    [5, 'Enduro'],
  ] as const)('marks only the chosen chip as pressed (%s)', (modelValue, label) => {
    const wrapper = mount(EventFilterChips, { props: { eventTypes, modelValue } })

    expect(pressed(wrapper)).toEqual([label])
    expect(wrapper.findAll('button').every((button) => button.attributes('aria-pressed'))).toBe(
      true,
    )
  })

  it('asks for the chip that was tapped', async () => {
    const wrapper = mount(EventFilterChips, { props: { eventTypes, modelValue: 'all' } })

    await wrapper.findAll('button')[2]!.trigger('click')
    await wrapper.findAll('button')[1]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[3], ['photos']])
  })

  it('is a labelled group of plain buttons', () => {
    const wrapper = mount(EventFilterChips, { props: { eventTypes, modelValue: 'all' } })

    expect(wrapper.attributes('role')).toBe('group')
    expect(wrapper.attributes('aria-label')).toBe('Filtrar eventos')
    expect(
      wrapper.findAll('button').every((button) => button.attributes('type') === 'button'),
    ).toBe(true)
  })
})
