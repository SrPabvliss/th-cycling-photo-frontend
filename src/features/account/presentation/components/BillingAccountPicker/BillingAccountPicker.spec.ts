import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import BillingAccountPicker from './BillingAccountPicker.vue'

const ACCOUNT = {
  id: 'b1',
  idType: 'national_id' as const,
  idNumber: '1710034065',
  legalName: 'Juan Pérez',
  email: 'juan@correo.com',
  address: null,
  isDefault: true,
}

describe('BillingAccountPicker', () => {
  it('says above its button why the last choice did not go through', () => {
    const wrapper = mount(BillingAccountPicker, {
      props: {
        accounts: [ACCOUNT],
        selectedId: 'b1',
        isSaving: false,
        problem: { title: 'No se pudo completar', text: 'Parece un problema de conexión.' },
      },
    })

    const alert = wrapper.get('.form-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('No se pudo completar')
    expect(
      alert.element.compareDocumentPosition(
        wrapper.get('[data-test="billing-picker-use"]').element,
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('says nothing without a problem', () => {
    const wrapper = mount(BillingAccountPicker, {
      props: { accounts: [ACCOUNT], selectedId: 'b1', isSaving: false },
    })

    expect(wrapper.find('.form-alert').exists()).toBe(false)
  })
})
