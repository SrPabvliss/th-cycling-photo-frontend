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

  it('breaks a long email at the @ rather than leaving a letter alone on a line', () => {
    const long = { ...account, email: 'comprador.prueba.9e7449@example.test' }
    const wrapper = mount(BillingCard, {
      props: { accounts: [long], selectedId: 'ba-1', needsConsent: false, consented: false },
    })

    const line = wrapper.get('[data-test="billing-email"]')
    expect(line.text()).toBe('comprador.prueba.9e7449@example.test')
    expect(line.html()).toMatch(/comprador\.prueba\.9e7449<wbr[^>]*>@example\.test/)
    expect(line.classes()).toContain('billing-card__email')
  })

  it('asks again for the consent when the buyer has accounts but no consent', async () => {
    const wrapper = mount(BillingCard, {
      props: { accounts: [account], selectedId: 'ba-1', needsConsent: true, consented: false },
    })

    await wrapper.find('[data-test="billing-card-consent"] input').setValue(true)

    expect(wrapper.emitted('update:consented')).toEqual([[true]])
  })

  it('has no consent box when the consent was given', () => {
    const wrapper = mount(BillingCard, {
      props: { accounts: [account], selectedId: 'ba-1', needsConsent: false, consented: false },
    })

    expect(wrapper.find('[data-test="billing-card-consent"]').exists()).toBe(false)
  })
})
