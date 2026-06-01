import { computed, type ComputedRef } from 'vue'

import { usePricingPreviewQuery } from '@/features/pricing/composables/queries/use-pricing-preview'
import type { IPricingPreview } from '@/features/pricing/types/responses/pricing-preview.response'

import { useCartStore } from '../stores/cart.store'

export interface ICartPricing {
  preview: ComputedRef<IPricingPreview | undefined>
  subtotal: ComputedRef<number>
  currency: ComputedRef<string>
  isLoading: ComputedRef<boolean>
}

export function useCartPricing(): ICartPricing {
  const cartStore = useCartStore()
  const totalCount = computed(() => cartStore.totalCount)
  const { data, isLoading } = usePricingPreviewQuery(totalCount)

  return {
    preview: computed(() => data.value),
    subtotal: computed(() => data.value?.subtotal ?? 0),
    currency: computed(() => data.value?.currency ?? 'USD'),
    isLoading: computed(() => isLoading.value),
  }
}
