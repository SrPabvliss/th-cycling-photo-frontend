import { describe, expect, it, vi } from 'vitest'
import { AxiosError } from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { computed, reactive, ref } from 'vue'

import { useBillingSelection } from './use-billing-selection'

const query = reactive({
  status: 'pending' as 'pending' | 'error' | 'success',
  data: undefined as { accounts: []; invoiceConsentGiven: boolean } | undefined,
  isFetching: false,
  error: null as unknown,
})
const refetch = vi.fn()
const online = ref(true)
vi.mock('@/core/network/use-online', () => ({ useOnline: () => online }))

vi.mock('./queries/use-my-billing-accounts', () => ({
  useMyBillingAccountsQuery: () => ({
    status: computed(() => query.status),
    data: computed(() => query.data),
    isSuccess: computed(() => query.status === 'success'),
    isFetching: computed(() => query.isFetching),
    error: computed(() => query.error),
    refetch,
  }),
}))
const setDefault = vi.fn()
vi.mock('./mutations/use-set-default-billing-account', () => ({
  useSetDefaultBillingAccount: () => ({
    mutateAsync: setDefault,
    isPending: computed(() => false),
  }),
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

  // Without network the read waits (pending, paused): that is not "no billing data" either.
  it('has a problem, worded as no connection, while the read waits for the network', () => {
    setActivePinia(createPinia())
    online.value = false
    const selection = useBillingSelection(() => true)

    Object.assign(query, { status: 'pending', data: undefined, error: null })
    expect(selection.billingProblem.value).toBe(true)
    expect(selection.billingProblemCopy.value.title).toBe('Sin conexión a internet')
    online.value = true
  })

  it.each([
    [
      new AxiosError('down', 'ERR_BAD_RESPONSE', undefined, undefined, {
        status: 500,
        data: {},
        headers: {},
        config: {},
      } as never),
      'No pudimos mostrar tus datos de factura',
      'Los necesitamos para crear tu pedido.',
    ],
    [
      new AxiosError('timeout', 'ECONNABORTED'),
      'Está tardando más de lo normal',
      'Puedes esperar un poco o volver a intentarlo.',
    ],
  ])('words the problem by its cause', (error, title, text) => {
    setActivePinia(createPinia())
    vi.stubGlobal('navigator', { onLine: true })
    const selection = useBillingSelection(() => true)

    Object.assign(query, { status: 'error', data: undefined, error })
    expect(selection.billingProblemCopy.value).toEqual({ title, text })
    vi.unstubAllGlobals()
  })

  it('asks for the billing data again, and says so while it does', () => {
    setActivePinia(createPinia())
    const selection = useBillingSelection(() => true)

    query.isFetching = true
    expect(selection.isBillingRetrying.value).toBe(true)

    void selection.retryBilling()
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('keeps the picker open and says why when the account cannot become the default', async () => {
    setActivePinia(createPinia())
    setDefault.mockRejectedValueOnce(new AxiosError('Network Error', 'ERR_NETWORK'))
    const selection = useBillingSelection(() => true)
    selection.billingSheet.value = 'picker'

    await selection.handleBillingChosen({ id: 'b2', makeDefault: true })

    expect(selection.billingSheet.value).toBe('picker')
    expect(selection.pickProblem.value?.text).toContain('Parece un problema de conexión.')

    setDefault.mockResolvedValueOnce(undefined)
    await selection.handleBillingChosen({ id: 'b2', makeDefault: true })
    expect(selection.billingSheet.value).toBeNull()
    expect(selection.pickProblem.value).toBeNull()
  })
})
