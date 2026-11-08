import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import type { IPickablePerson } from '../../types/responses/pickable-person.response'

const mutate = vi.fn()

vi.mock('../../composables/mutations/use-issue-contract', () => ({
  useIssueContract: () => ({ mutate, isPending: ref(false) }),
}))

const searchResults = ref<IPickablePerson[]>([])

vi.mock('../../composables/queries/use-search-users', () => ({
  MIN_SEARCH_LENGTH: 2,
  useSearchUsersQuery: () => ({ data: searchResults, isFetching: ref(false) }),
}))

vi.mock('@/core/ui/discrete-api', () => ({ message: { error: vi.fn() } }))

import IssueContractModal from './IssueContractModal.vue'

const ANA: IPickablePerson = {
  id: 'ana',
  name: 'Ana Paredes',
  email: 'ana@titantv.test',
  since: new Date(2026, 0, 10),
  emailVerified: true,
  hasOrganizer: false,
  organizerName: null,
}

// jsdom has no layout, so it does not implement scrollIntoView.
Element.prototype.scrollIntoView = vi.fn()

const ModalStub = {
  name: 'Modal',
  template: '<div><slot name="header" /><slot /><slot name="footer" /></div>',
}

const DatePickerStub = {
  name: 'DatePicker',
  props: ['isDateDisabled', 'formattedValue'],
  emits: ['update:formatted-value'],
  template: '<input data-test="valid-until" />',
}

function mountModal() {
  return mount(IssueContractModal, {
    props: { mode: 'new' },
    global: { stubs: { Modal: ModalStub, DatePicker: DatePickerStub } },
  })
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 10, 7, 21, 30))
  mutate.mockClear()
  searchResults.value = [ANA]
})

afterEach(() => {
  vi.useRealTimers()
})

describe('IssueContractModal', () => {
  it('lets the contract end today but never on a day that already passed', () => {
    const picker = mountModal().findComponent(DatePickerStub)
    const isDisabled = picker.props('isDateDisabled') as (timestamp: number) => boolean

    expect(isDisabled(new Date(2026, 10, 6).getTime())).toBe(true)
    expect(isDisabled(new Date(2026, 10, 7).getTime())).toBe(false)
    expect(isDisabled(new Date(2026, 11, 31).getTime())).toBe(false)
  })

  it('keeps the chosen person instead of undoing the pick', async () => {
    const wrapper = mountModal()
    const input = wrapper.find('[data-test="person-search-input"]')
    await input.setValue('an')
    await input.trigger('focus')

    await wrapper.find('[data-test="person-option-ana"]').trigger('mousedown')

    expect(wrapper.find('[data-test="picked-person"]').text()).toContain('Ana Paredes')
  })

  it('sends the chosen day as yyyy-MM-dd once the form is complete', async () => {
    const wrapper = mountModal()
    const input = wrapper.find('[data-test="person-search-input"]')
    await input.setValue('an')
    await input.trigger('focus')
    await wrapper.find('[data-test="person-option-ana"]').trigger('mousedown')

    await wrapper.find('[data-test="commercial-name"]').setValue('Andes Bike Photo')
    wrapper
      .findAllComponents({ name: 'InputNumber' })
      .forEach((field, index) => field.vm.$emit('update:value', index === 0 ? 5 : 2000))
    wrapper.findComponent(DatePickerStub).vm.$emit('update:formatted-value', '2026-12-31')
    await wrapper.vm.$nextTick()

    await wrapper.find('[data-test="issue-contract-form"]').trigger('submit')

    expect(mutate).toHaveBeenCalledWith(
      {
        ownerEmail: 'ana@titantv.test',
        commercialName: 'Andes Bike Photo',
        eventsTotal: 5,
        photosPerEvent: 2000,
        validUntil: '2026-12-31',
      },
      expect.any(Object),
    )
  })
})
