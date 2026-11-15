import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'

import type { IBillingServerError } from '../utils/billing-server-error'
import { useBillingAccountForm, type IBillingAccountFormOptions } from './use-billing-account-form'

const calls: string[] = []
const recordConsent = vi.fn(async () => void calls.push('consent'))
const createAccount = vi.fn(async (_request: unknown) => {
  calls.push('create')
  return { id: 'ba-new' }
})

vi.mock('./mutations/use-record-invoice-consent', () => ({
  useRecordInvoiceConsent: () => ({ mutateAsync: recordConsent, isPending: ref(false) }),
}))
vi.mock('./mutations/use-create-billing-account', () => ({
  useCreateBillingAccount: () => ({ mutateAsync: createAccount, isPending: ref(false) }),
}))

afterEach(() => {
  calls.length = 0
  recordConsent.mockReset().mockImplementation(async () => void calls.push('consent'))
  createAccount.mockReset().mockImplementation(async () => {
    calls.push('create')
    return { id: 'ba-new' }
  })
})

const PREFILL = { legalName: 'Juan Pérez', email: 'juan@correo.com' }

function setup(extra: Partial<IBillingAccountFormOptions> = {}) {
  const onSaved = vi.fn()
  const onSubmit = vi.fn()
  const serverError = ref<IBillingServerError | null>(null)
  let api!: ReturnType<typeof useBillingAccountForm>
  mount(
    defineComponent({
      setup() {
        api = useBillingAccountForm({
          mode: 'create',
          needsConsent: false,
          prefill: PREFILL,
          serverError: () => serverError.value,
          onSaved,
          onSubmit,
          ...extra,
        })
        return () => null
      },
    }),
  )
  return { api, onSaved, onSubmit, serverError }
}

describe('useBillingAccountForm', () => {
  it('starts from the profile when there is nothing saved', () => {
    const { api } = setup()

    expect(api.form.state.values).toEqual({
      idType: 'national_id',
      idNumber: '',
      legalName: 'Juan Pérez',
      email: 'juan@correo.com',
      address: '',
      consent: false,
    })
  })

  it('records the consent first, then saves the account with clean values', async () => {
    const { api, onSaved } = setup({ needsConsent: true })
    api.form.setFieldValue('idNumber', ' 1710034065 ')
    api.form.setFieldValue('legalName', '  Juan Pérez ')
    api.form.setFieldValue('address', '   ')

    await api.form.handleSubmit()
    await flushPromises()

    expect(calls).toEqual(['consent', 'create'])
    expect(createAccount).toHaveBeenCalledWith({
      idType: 'national_id',
      idNumber: '1710034065',
      legalName: 'Juan Pérez',
      email: 'juan@correo.com',
    })
    expect(onSaved).toHaveBeenCalledWith('ba-new')
  })

  it('asks no consent when it was already given, nor when correcting or editing', () => {
    expect(setup({ needsConsent: false }).api.asksConsent).toBe(false)
    expect(setup({ needsConsent: true, mode: 'correct' }).api.asksConsent).toBe(false)
    expect(setup({ needsConsent: true, mode: 'edit' }).api.asksConsent).toBe(false)
    expect(setup({ needsConsent: true }).api.asksConsent).toBe(true)
  })

  it('hands the request over when correcting, without saving anything', async () => {
    const initial = {
      idType: 'ruc' as const,
      idNumber: '1790012345001',
      legalName: 'Bicicletas SA',
      email: 'facturas@bicis.com',
      address: 'Av. Amazonas',
    }
    const { api, onSubmit } = setup({ mode: 'correct', initial })

    await api.form.handleSubmit()

    expect(createAccount).not.toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalledWith(initial)
  })

  it('puts a rejected identification under the number and anything else in the alert', async () => {
    const { api, serverError } = setup({ mode: 'correct' })

    serverError.value = {
      message: 'RUC no registrado',
      messageKey: 'billing.identification_invalid',
      fields: null,
    }
    expect(api.idNumberError.value).toBe('RUC no registrado')
    expect(api.alertError.value).toBeNull()

    serverError.value = { message: 'Ya no se puede corregir', messageKey: null, fields: null }
    expect(api.idNumberError.value).toBeNull()
    expect(api.alertError.value).toBe('Ya no se puede corregir')
  })

  it('says what failed when saving does not go through', async () => {
    createAccount.mockRejectedValueOnce(new Error('offline'))
    const { api, onSaved } = setup()
    api.form.setFieldValue('idNumber', '1710034065')

    await api.form.handleSubmit()
    await flushPromises()

    expect(onSaved).not.toHaveBeenCalled()
    expect(api.alertError.value).toBe(
      'No pudimos guardar tus datos de facturación. Intenta de nuevo.',
    )
  })

  it('checks and hints the number by the kind of identification', () => {
    const { api } = setup()

    expect(api.idNumberPlaceholder.value).toBe('10 dígitos')
    expect(api.idNumberValidator({ value: '171003406' })).toContain('Revisa el número')
    expect(api.idNumberValidator({ value: '1710034065' })).toBeUndefined()

    api.form.setFieldValue('idType', 'ruc')
    expect(api.idNumberPlaceholder.value).toBe('13 dígitos')
    api.form.setFieldValue('idType', 'passport')
    expect(api.idNumberPlaceholder.value).toBe('Letras y números')
  })
})
