import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { defineComponent } from 'vue'

import type { IBillingAccount } from '../../types/responses/billing-account.response'
import { billingChanges, useUpdateBillingAccount } from './use-update-billing-account'

const patch = vi.fn()
vi.mock('@/core/http/axios-client', () => ({
  httpClient: { patch: (...args: unknown[]) => patch(...args) },
}))

const SAVED: IBillingAccount = {
  id: 'b1',
  idType: 'national_id',
  idNumber: '1710034065',
  legalName: 'Juan Pérez',
  email: 'juan@correo.com',
  address: 'Av. Amazonas',
  isDefault: true,
}
const asRequest = {
  idType: SAVED.idType,
  idNumber: SAVED.idNumber,
  legalName: SAVED.legalName,
  email: SAVED.email,
  address: 'Av. Amazonas',
}

describe('billingChanges', () => {
  it('sends only the name when only the name changed', () => {
    expect(billingChanges(SAVED, { ...asRequest, legalName: 'Juan P. Pérez' })).toEqual({
      legalName: 'Juan P. Pérez',
    })
  })

  it('sends the type and the number together when the number changed', () => {
    expect(billingChanges(SAVED, { ...asRequest, idNumber: '1712345678' })).toEqual({
      idType: 'national_id',
      idNumber: '1712345678',
    })
  })

  it('sends both when only the type changed', () => {
    expect(billingChanges(SAVED, { ...asRequest, idType: 'passport' })).toEqual({
      idType: 'passport',
      idNumber: '1710034065',
    })
  })

  it('clears the address with null', () => {
    const { address: _, ...withoutAddress } = asRequest
    expect(billingChanges(SAVED, withoutAddress)).toEqual({ address: null })
  })

  it('sends nothing when nothing changed', () => {
    expect(billingChanges(SAVED, asRequest)).toEqual({})
  })
})

describe('useUpdateBillingAccount', () => {
  beforeEach(() => patch.mockReset())

  it('patches the account with the changes and reads the accounts again', async () => {
    patch.mockResolvedValue({ data: { id: 'b1' } })
    const queryClient = new QueryClient()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    let update!: ReturnType<typeof useUpdateBillingAccount>
    mount(
      defineComponent({
        setup() {
          update = useUpdateBillingAccount()
          return () => null
        },
      }),
      { global: { plugins: [[VueQueryPlugin, { queryClient }]] } },
    )

    await update.mutateAsync({ id: 'b1', changes: { legalName: 'Juan P.' } })

    expect(patch).toHaveBeenCalledWith(
      '/users/me/billing-accounts/b1',
      { legalName: 'Juan P.' },
      { silent: true },
    )
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['/users/me/billing-accounts'] })
  })
})
