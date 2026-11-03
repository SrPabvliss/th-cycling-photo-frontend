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
})
