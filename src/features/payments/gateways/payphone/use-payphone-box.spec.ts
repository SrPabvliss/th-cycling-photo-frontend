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

let constructorSpy: (args: Record<string, unknown>) => void
let renderSpy: ReturnType<typeof vi.fn>

function lastConstructorArgs(): Record<string, unknown> {
  const calls = (constructorSpy as ReturnType<typeof vi.fn>).mock.calls
  return calls[calls.length - 1]![0]
}

beforeEach(() => {
  renderSpy = vi.fn()
  constructorSpy = vi.fn()
  ;(window as unknown as { PPaymentButtonBox: unknown }).PPaymentButtonBox = class {
    constructor(args: Record<string, unknown>) {
      constructorSpy(args)
    }
    render = renderSpy
    destroy = vi.fn()
  }
})

afterEach(() => {
  delete (window as unknown as { PPaymentButtonBox?: unknown }).PPaymentButtonBox
  vi.clearAllMocks()
})

describe('usePayphoneBox', () => {
  it('passes the intent through in cents and asks for the redirect response', async () => {
    const box = usePayphoneBox()

    await box.render(INTENT)

    expect(lastConstructorArgs()).toMatchObject({
      token: 'tok',
      clientTransactionId: 'tt-abc',
      amount: 2000,
      amountWithoutTax: 2000,
      storeId: 'store-1',
      currency: 'USD',
      isAsyncResponse: false,
      lang: 'es',
    })
  })

  it('renders the box in redirect mode, since the in-page result callback is dead code in the SDK', async () => {
    const box = usePayphoneBox()

    await box.render(INTENT)

    expect(constructorSpy).toHaveBeenCalledWith(expect.objectContaining({ isAsyncResponse: false }))
  })

  it('omits the split instruction when there is none', async () => {
    const box = usePayphoneBox()

    await box.render(INTENT)

    expect(lastConstructorArgs()).not.toHaveProperty('transferTo')
  })

  it('forwards the split instruction when present', async () => {
    const box = usePayphoneBox()

    await box.render({ ...INTENT, payload: { ...INTENT.payload, transferTo: 'cipher' } })

    expect(lastConstructorArgs().transferTo).toBe('cipher')
  })

  it('becomes ready after rendering', async () => {
    const box = usePayphoneBox()
    expect(box.isReady.value).toBe(false)

    await box.render(INTENT)

    expect(box.isReady.value).toBe(true)
    expect(renderSpy).toHaveBeenCalledWith('pp-button')
  })
})
