import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import BillingCorrectionForm from './BillingCorrectionForm.vue'

const createAccount = vi.fn()

vi.mock('@/features/account/composables/mutations/use-record-invoice-consent', () => ({
  useRecordInvoiceConsent: () => ({ mutateAsync: vi.fn(), isPending: ref(false) }),
}))
vi.mock('@/features/account/composables/mutations/use-create-billing-account', () => ({
  useCreateBillingAccount: () => ({ mutateAsync: createAccount, isPending: ref(false) }),
}))

const initial = {
  idType: 'ruc' as const,
  idNumber: '1790012345001',
  legalName: 'Bicicletas SA',
  email: 'facturas@bicis.com',
  address: 'Av. Amazonas',
}

function mountForm(extra: Record<string, unknown> = {}) {
  return mount(BillingCorrectionForm, {
    props: { initial, submitLabel: 'Enviar corrección', ...extra },
  })
}

const alertOf = (wrapper: ReturnType<typeof mountForm>) =>
  wrapper.find('.billing-correction-form__alert')

describe('BillingCorrectionForm', () => {
  it('starts from the invoiced data and asks no consent', () => {
    const wrapper = mountForm()
    const value = (selector: string) => (wrapper.find(selector).element as HTMLInputElement).value

    expect(value('[data-test="billing-id-number"] input')).toBe('1790012345001')
    expect(value('[data-test="billing-legal-name"] input')).toBe('Bicicletas SA')
    expect(value('[data-test="billing-email"] input')).toBe('facturas@bicis.com')
    expect(value('[data-test="billing-address"] input')).toBe('Av. Amazonas')
    expect(wrapper.find('[data-test="billing-consent"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="billing-submit"]').text()).toContain('Enviar corrección')
  })

  it('hands the correction over instead of creating an account', async () => {
    const wrapper = mountForm()

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(createAccount).not.toHaveBeenCalled()
    expect(wrapper.emitted('submit')).toEqual([[initial]])
  })

  it('shows a rejected identification under the number and the rest in the alert', async () => {
    const wrapper = mountForm({
      serverError: {
        message: 'RUC no registrado',
        messageKey: 'billing.identification_invalid',
        fields: null,
      },
    })
    expect(wrapper.text()).toContain('RUC no registrado')
    expect(alertOf(wrapper).exists()).toBe(false)

    await wrapper.setProps({
      serverError: { message: 'Ya no se puede corregir', messageKey: null, fields: null },
    })
    expect(alertOf(wrapper).text()).toContain('Ya no se puede corregir')
  })

  it('cancels', async () => {
    const wrapper = mountForm()

    const buttons = wrapper.findAll('button')
    await buttons[buttons.length - 1]!.trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })
})
