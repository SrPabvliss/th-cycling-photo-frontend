import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { IBankTransferDraft } from '../../../composables/use-configuration-items'
import BankTransferBody from './BankTransferBody.vue'

const EMPTY_DRAFT: IBankTransferDraft = {
  bankName: '',
  accountNumber: '',
  accountType: '',
  accountHolder: '',
  holderIdentification: '',
}

function mountBody(props: Partial<InstanceType<typeof BankTransferBody>['$props']> = {}) {
  return mount(BankTransferBody, {
    props: {
      hasProfileValue: true,
      profileLabel: 'Banco Pichincha · 2100458899',
      useProfile: true,
      saveToProfile: false,
      draft: EMPTY_DRAFT,
      ...props,
    },
  })
}

describe('BankTransferBody', () => {
  it('lets someone who manages payouts type another account for the event', async () => {
    const wrapper = mountBody({ useProfile: false })

    expect(wrapper.find('[data-test="source-choice-new"]').text()).toContain(
      'Usar otra solo para este evento',
    )
    expect(wrapper.find('[data-test="bank-account-number"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="payout-locked-note"]').exists()).toBe(false)
  })

  it('offers only the profile account to someone who cannot manage payouts', () => {
    const wrapper = mountBody({ useProfile: false, allowsNewData: false })

    expect(wrapper.text()).not.toContain('Usar otra solo para este evento')
    expect(wrapper.find('[data-test="source-choice-profile"]').text()).toContain(
      'Usar la del perfil',
    )
    expect(wrapper.find('[data-test="source-choice-new"]').text()).toContain(
      'No usar en este evento',
    )
    expect(wrapper.find('[data-test="bank-account-number"]').exists()).toBe(false)
  })

  it("offers to keep the event's own account instead of typing a new one", () => {
    const wrapper = mountBody({
      useProfile: false,
      allowsNewData: false,
      currentLabel: 'Banco Guayaquil · 9988776655',
    })

    expect(wrapper.find('[data-test="source-choice-new"]').text()).toContain(
      'Mantener la de este evento',
    )
    expect(wrapper.find('[data-test="bank-account-number"]').exists()).toBe(false)
  })

  it('asks for an admin when the profile has no account to use', () => {
    const wrapper = mountBody({ hasProfileValue: false, useProfile: false, allowsNewData: false })

    expect(wrapper.find('[data-test="source-choice"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="payout-locked-note"]').text()).toContain(
      'Pídele a un administrador que lo configure.',
    )
    expect(wrapper.find('[data-test="bank-account-number"]').exists()).toBe(false)
  })
})
