import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

const previewSpy = vi.fn()

vi.mock('@/features/pricing/composables/queries/use-pricing-preview', () => ({
  usePricingPreviewQuery: (photoCount: unknown) => {
    previewSpy(photoCount)
    return { data: ref(undefined), isLoading: ref(false) }
  },
}))

vi.mock('@/features/pricing/composables/queries/use-pricing-tiers', () => ({
  usePricingTiersQuery: () => ({ data: ref(undefined) }),
}))

import { useCartPricing } from './use-cart-pricing'

describe('useCartPricing', () => {
  it('prices the photo count it is given', () => {
    previewSpy.mockClear()

    useCartPricing(7)

    const passed = previewSpy.mock.calls[0]![0]
    expect(typeof passed === 'object' ? (passed as { value: number }).value : passed).toBe(7)
  })

  it('follows a reactive photo count', () => {
    previewSpy.mockClear()
    const count = ref(3)

    useCartPricing(count)
    const passed = previewSpy.mock.calls[0]![0] as { value: number }

    count.value = 9
    expect(passed.value).toBe(9)
  })
})
