import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { IBillingAccount } from '@/features/account/types/responses/billing-account.response'
import BillingCard from './BillingCard.vue'

const account: IBillingAccount = {
  id: 'ba-1',
  idType: 'national_id',
  idNumber: '1710034065',
  legalName: 'Juan Pérez',
  email: 'juan@correo.com',
  address: null,
  isDefault: true,
}

describe('BillingCard', () => {
  it('asks for billing data when the buyer has no account yet', async () => {
    const wrapper = mount(BillingCard, {
      props: { accounts: [], selectedId: null, needsConsent: false, consented: false },
    })

    expect(wrapper.text()).toContain('Necesitamos tus datos para enviarte la factura electrónica.')
    await wrapper.find('[data-test="billing-add"]').trigger('click')

    expect(wrapper.emitted('add')).toHaveLength(1)
  })

  it('shows who the invoice goes to and lets the buyer change it', async () => {
    const wrapper = mount(BillingCard, {
      props: { accounts: [account], selectedId: 'ba-1', needsConsent: false, consented: false },
    })

    expect(wrapper.text()).toContain('Juan Pérez')
    expect(wrapper.text()).toContain('Cédula 1710034065')
    expect(wrapper.text()).toContain('juan@correo.com')
    await wrapper.find('[data-test="billing-change"]').trigger('click')

    expect(wrapper.emitted('change')).toHaveLength(1)
  })

  it('asks again for the consent when the buyer has accounts but no consent', async () => {
    const wrapper = mount(BillingCard, {
      props: { accounts: [account], selectedId: 'ba-1', needsConsent: true, consented: false },
    })

    await wrapper.find('[data-test="billing-card-consent"]').trigger('click')

    expect(wrapper.emitted('update:consented')).toEqual([[true]])
  })
})
