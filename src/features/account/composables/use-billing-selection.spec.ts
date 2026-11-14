import { describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { computed, reactive } from 'vue'

import { useBillingSelection } from './use-billing-selection'

const query = reactive({
  status: 'pending' as 'pending' | 'error' | 'success',
  data: undefined as { accounts: []; invoiceConsentGiven: boolean } | undefined,
  isFetching: false,
})
const refetch = vi.fn()

vi.mock('./queries/use-my-billing-accounts', () => ({
  useMyBillingAccountsQuery: () => ({
    status: computed(() => query.status),
    data: computed(() => query.data),
    isSuccess: computed(() => query.status === 'success'),
    isFetching: computed(() => query.isFetching),
    refetch,
  }),
}))
vi.mock('./mutations/use-set-default-billing-account', () => ({
  useSetDefaultBillingAccount: () => ({ mutateAsync: vi.fn(), isPending: computed(() => false) }),
}))
vi.mock('./mutations/use-record-invoice-consent', () => ({
  useRecordInvoiceConsent: () => ({ mutateAsync: vi.fn(), isPending: computed(() => false) }),
}))

describe('useBillingSelection', () => {
  it('has a problem only when the billing data failed and nothing was read before', () => {
    setActivePinia(createPinia())
    const selection = useBillingSelection(() => true)

    Object.assign(query, { status: 'error', data: undefined })
    expect(selection.billingProblem.value).toBe(true)

    Object.assign(query, { status: 'error', data: { accounts: [], invoiceConsentGiven: true } })
    expect(selection.billingProblem.value).toBe(false)

    Object.assign(query, { status: 'success' })
    expect(selection.billingProblem.value).toBe(false)
  })

  it('asks for the billing data again, and says so while it does', () => {
    setActivePinia(createPinia())
    const selection = useBillingSelection(() => true)

    query.isFetching = true
    expect(selection.isBillingRetrying.value).toBe(true)

    void selection.retryBilling()
    expect(refetch).toHaveBeenCalledTimes(1)
  })
})
