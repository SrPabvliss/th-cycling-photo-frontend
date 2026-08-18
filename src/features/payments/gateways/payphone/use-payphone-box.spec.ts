import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/composables/use-external-script', () => ({
  loadExternalScript: vi.fn().mockResolvedValue(undefined),
  loadExternalStylesheet: vi.fn().mockResolvedValue(undefined),
}))

import { usePayphoneBox } from './use-payphone-box'

const INTENT = {
  provider: 'payphone',
  payload: {
    clientTransactionId: 'tt-abc',
    token: 'tok',
    storeId: 'store-1',
    amount: 2000,
    amountWithoutTax: 2000,
    amountWithTax: 0,
    tax: 0,
    currency: 'USD',
    reference: 'Fotos',
  },
}

let constructorArgs: Record<string, unknown>
let startProcessPaymentAsync: ReturnType<typeof vi.fn>
let renderSpy: ReturnType<typeof vi.fn>

beforeEach(() => {
  startProcessPaymentAsync = vi
    .fn()
    .mockResolvedValue({ transactionId: 99, clientTransactionId: 'tt-abc' })
  renderSpy = vi.fn()
  ;(window as unknown as { PPaymentButtonBox: unknown }).PPaymentButtonBox = class {
    constructor(args: Record<string, unknown>) {
      constructorArgs = args
    }
    render = renderSpy
    startProcessPaymentAsync = startProcessPaymentAsync
    destroy = vi.fn()
  }
})

afterEach(() => {
  delete (window as unknown as { PPaymentButtonBox?: unknown }).PPaymentButtonBox
  vi.clearAllMocks()
})

describe('usePayphoneBox', () => {
  it('passes the intent through in cents and asks for the async response', async () => {
    const box = usePayphoneBox()

    await box.render(INTENT)

    expect(constructorArgs).toMatchObject({
      token: 'tok',
      clientTransactionId: 'tt-abc',
      amount: 2000,
      amountWithoutTax: 2000,
      storeId: 'store-1',
      currency: 'USD',
      isAsyncResponse: true,
      lang: 'es',
    })
  })

  it('omits the split instruction when there is none', async () => {
    const box = usePayphoneBox()

    await box.render(INTENT)

    expect(constructorArgs).not.toHaveProperty('transferTo')
  })

  it('forwards the split instruction when present', async () => {
    const box = usePayphoneBox()

    await box.render({ ...INTENT, payload: { ...INTENT.payload, transferTo: 'cipher' } })

    expect(constructorArgs.transferTo).toBe('cipher')
  })

  it('becomes ready after rendering', async () => {
    const box = usePayphoneBox()
    expect(box.isReady.value).toBe(false)

    await box.render(INTENT)

    expect(box.isReady.value).toBe(true)
    expect(renderSpy).toHaveBeenCalledWith('pp-button')
  })

  it('resolves with the transaction identifiers after paying', async () => {
    const box = usePayphoneBox()
    await box.render(INTENT)

    await expect(box.pay()).resolves.toEqual({ transactionId: 99, clientTransactionId: 'tt-abc' })
  })

  it('tracks the processing flag around a payment', async () => {
    const box = usePayphoneBox()
    await box.render(INTENT)

    const promise = box.pay()
    expect(box.isProcessing.value).toBe(true)
    await promise

    expect(box.isProcessing.value).toBe(false)
  })

  it('clears the processing flag when the payment fails', async () => {
    startProcessPaymentAsync.mockRejectedValue(new Error('Process Error'))
    const box = usePayphoneBox()
    await box.render(INTENT)

    await expect(box.pay()).rejects.toThrow('Process Error')
    expect(box.isProcessing.value).toBe(false)
  })

  it('fails loudly when the async api is missing', async () => {
    ;(window as unknown as { PPaymentButtonBox: unknown }).PPaymentButtonBox = class {
      render = vi.fn()
    }
    const box = usePayphoneBox()

    await expect(box.render(INTENT)).rejects.toThrow(/startProcessPaymentAsync/)
  })

  it('refuses to pay before rendering', async () => {
    await expect(usePayphoneBox().pay()).rejects.toThrow()
  })
})
