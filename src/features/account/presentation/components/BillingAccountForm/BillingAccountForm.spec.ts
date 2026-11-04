import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import BillingAccountForm from './BillingAccountForm.vue'

const calls: string[] = []
const recordConsents = vi.fn(async () => {
  calls.push('consent')
})
const createAccount = vi.fn(async () => {
  calls.push('create')
  return { id: 'ba-new' }
})

vi.mock('@/features/account/composables/mutations/use-record-invoice-consent', () => ({
  useRecordInvoiceConsent: () => ({ mutateAsync: recordConsents, isPending: ref(false) }),
}))

vi.mock('@/features/account/composables/mutations/use-create-billing-account', () => ({
  useCreateBillingAccount: () => ({ mutateAsync: createAccount, isPending: ref(false) }),
}))

afterEach(() => {
  calls.length = 0
  recordConsents.mockClear()
  createAccount.mockClear()
})

function mountForm(needsConsent: boolean) {
  return mount(BillingAccountForm, {
    props: { needsConsent, prefill: { legalName: 'Juan Pérez', email: 'juan@correo.com' } },
  })
}

async function fillIdNumber(wrapper: ReturnType<typeof mountForm>, value: string) {
  await wrapper.find('[data-test="billing-id-number"] input').setValue(value)
}

async function submit(wrapper: ReturnType<typeof mountForm>) {
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe('BillingAccountForm', () => {
  it('prefills the name and the email from the profile', () => {
    const wrapper = mountForm(true)

    expect(
      (wrapper.find('[data-test="billing-legal-name"] input').element as HTMLInputElement).value,
    ).toBe('Juan Pérez')
    expect(
      (wrapper.find('[data-test="billing-email"] input').element as HTMLInputElement).value,
    ).toBe('juan@correo.com')
  })

  it('does not save while the consent box is unchecked', async () => {
    const wrapper = mountForm(true)
    await fillIdNumber(wrapper, '1710034065')

    await submit(wrapper)

    expect(recordConsents).not.toHaveBeenCalled()
    expect(createAccount).not.toHaveBeenCalled()
  })

  it('records the consent before saving the account and reports the new id', async () => {
    const wrapper = mountForm(true)
    await fillIdNumber(wrapper, '1710034065')
    await wrapper.find('[data-test="billing-consent"]').trigger('click')

    await submit(wrapper)

    expect(calls).toEqual(['consent', 'create'])
    expect(recordConsents).toHaveBeenCalledTimes(1)
    expect(createAccount).toHaveBeenCalledWith({
      idType: 'national_id',
      idNumber: '1710034065',
      legalName: 'Juan Pérez',
      email: 'juan@correo.com',
    })
    expect(wrapper.emitted('saved')).toEqual([['ba-new']])
  })

  it('does not show the consent box to a user who already consented', async () => {
    const wrapper = mountForm(false)
    await fillIdNumber(wrapper, '1710034065')

    expect(wrapper.find('[data-test="billing-consent"]').exists()).toBe(false)
    await submit(wrapper)
    expect(recordConsents).not.toHaveBeenCalled()
    expect(createAccount).toHaveBeenCalled()
  })

  it('keeps the consent box on screen when the account is rejected after the consent was recorded', async () => {
    createAccount.mockRejectedValueOnce(new Error('rejected'))
    const wrapper = mountForm(true)
    await fillIdNumber(wrapper, '1710034065')
    await wrapper.find('[data-test="billing-consent"]').trigger('click')

    await submit(wrapper)
    await wrapper.setProps({ needsConsent: false })

    expect(wrapper.find('[data-test="billing-consent"]').exists()).toBe(true)
    expect(wrapper.emitted('saved')).toBeUndefined()
  })

  it('keeps a malformed number from reaching the server', async () => {
    const wrapper = mountForm(false)
    await fillIdNumber(wrapper, '171003406')

    await submit(wrapper)

    expect(createAccount).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Revisa el número')
  })

  describe('correct mode', () => {
    const initial = {
      idType: 'ruc' as const,
      idNumber: '1790012345001',
      legalName: 'Bicicletas SA',
      email: 'facturas@bicis.com',
      address: 'Av. Amazonas',
    }

    function mountCorrect(extra: Record<string, unknown> = {}) {
      return mount(BillingAccountForm, {
        props: {
          needsConsent: true,
          prefill: { legalName: 'Otro', email: 'otro@correo.com' },
          mode: 'correct',
          initial,
          submitLabel: 'Enviar corrección',
          ...extra,
        },
      })
    }

    it('prefills every field and hides consent in correct mode', () => {
      const wrapper = mountCorrect()
      const value = (selector: string) => (wrapper.find(selector).element as HTMLInputElement).value

      expect(value('[data-test="billing-id-number"] input')).toBe('1790012345001')
      expect(value('[data-test="billing-legal-name"] input')).toBe('Bicicletas SA')
      expect(value('[data-test="billing-email"] input')).toBe('facturas@bicis.com')
      expect(value('[data-test="billing-address"] input')).toBe('Av. Amazonas')
      expect(wrapper.find('[data-test="billing-consent"]').exists()).toBe(false)
      expect(wrapper.find('[data-test="billing-submit"]').text()).toContain('Enviar corrección')
    })

    it('emits submit instead of creating an account in correct mode', async () => {
      const wrapper = mountCorrect()

      await submit(wrapper as unknown as ReturnType<typeof mountForm>)

      expect(createAccount).not.toHaveBeenCalled()
      expect(recordConsents).not.toHaveBeenCalled()
      expect(wrapper.emitted('submit')).toEqual([[initial]])
    })

    const alertOf = (wrapper: ReturnType<typeof mountCorrect>) =>
      wrapper.find('.billing-account-form__alert')

    it('shows an identification error of the legacy under the number', () => {
      const wrapper = mountCorrect({
        serverError: {
          message: 'RUC no registrado',
          messageKey: 'billing.identification_invalid',
          fields: null,
        },
      })

      expect(wrapper.text()).toContain('RUC no registrado')
      expect(alertOf(wrapper).exists()).toBe(false)
    })

    it('shows the identification field of a validation answer under the number', () => {
      const wrapper = mountCorrect({
        serverError: {
          message: 'Datos inválidos',
          messageKey: 'errors.VALIDATION_FAILED',
          fields: { idNumber: ['El número es obligatorio'] },
        },
      })

      expect(wrapper.text()).toContain('El número es obligatorio')
      expect(alertOf(wrapper).exists()).toBe(false)
    })

    it('sends every other server error to the alert', async () => {
      const wrapper = mountCorrect({
        serverError: {
          message: 'La razón social no es válida',
          messageKey: 'billing.legal_name_invalid',
          fields: null,
        },
      })
      expect(alertOf(wrapper).text()).toContain('La razón social no es válida')

      await wrapper.setProps({
        serverError: {
          message: 'Ya no se puede corregir',
          messageKey: 'order.invoice_not_correctable',
          fields: null,
        },
      })
      expect(alertOf(wrapper).text()).toContain('Ya no se puede corregir')

      await wrapper.setProps({
        serverError: {
          message: 'No pudimos enviar la corrección. Intenta de nuevo.',
          messageKey: null,
          fields: null,
        },
      })
      expect(alertOf(wrapper).text()).toContain('No pudimos enviar la corrección')
    })
  })
})
