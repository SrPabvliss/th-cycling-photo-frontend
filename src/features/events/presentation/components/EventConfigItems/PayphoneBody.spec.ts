import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

vi.mock('@/features/tenant-profile/composables/mutations/use-verify-payout-receiver', () => ({
  useVerifyPayoutReceiver: () => ({
    mutate: vi.fn(),
    isPending: ref(false),
    data: ref(undefined),
    error: ref(null),
    reset: vi.fn(),
  }),
}))

vi.mock('intl-tel-input/vueWithUtils', () => ({
  default: { name: 'IntlTelInput', template: '<input data-test="intl-tel-input" />' },
}))

import PayphoneBody from './PayphoneBody.vue'

function mountBody(props: Partial<InstanceType<typeof PayphoneBody>['$props']> = {}) {
  return mount(PayphoneBody, {
    props: {
      hasProfileValue: true,
      profileLabel: '987654321',
      useProfile: false,
      saveToProfile: false,
      draft: { phone: '', verification: 'idle' },
      ...props,
    },
  })
}

describe('PayphoneBody', () => {
  it('lets someone who manages payouts type another number for the event', () => {
    const wrapper = mountBody()

    expect(wrapper.text()).toContain('Usar otra solo para este evento')
    expect(wrapper.find('[data-test="payphone-input"]').exists()).toBe(true)
  })

  it('never shows the number field to someone who cannot manage payouts', () => {
    const wrapper = mountBody({ allowsNewData: false, currentLabel: '911112222' })

    expect(wrapper.text()).not.toContain('Usar otra solo para este evento')
    expect(wrapper.find('[data-test="source-choice-new"]').text()).toContain(
      'Mantener la de este evento',
    )
    expect(wrapper.find('[data-test="payphone-input"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="payout-locked-note"]').text()).toContain(
      'lo hace un administrador',
    )
  })
})
