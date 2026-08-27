import { computed, type ComputedRef, type MaybeRef, toValue } from 'vue'

import { usePricingPreviewQuery } from '@/features/pricing/composables/queries/use-pricing-preview'
import { usePricingTiersQuery } from '@/features/pricing/composables/queries/use-pricing-tiers'
import { getBasePricePerPhoto } from '@/features/pricing/utils/get-base-price-per-photo'
import type { IPricingPreview } from '@/features/pricing/types/responses/pricing-preview.response'

export interface ICartPricing {
  preview: ComputedRef<IPricingPreview | undefined>
  subtotal: ComputedRef<number>
  currency: ComputedRef<string>
  basePrice: ComputedRef<number | null>
  isLoading: ComputedRef<boolean>
}

export function useCartPricing(photoCount: MaybeRef<number>): ICartPricing {
  const count = computed(() => toValue(photoCount))
  const { data, isLoading } = usePricingPreviewQuery(count)
  const { data: tiers } = usePricingTiersQuery()

  return {
    preview: computed(() => data.value),
    subtotal: computed(() => data.value?.subtotal ?? 0),
    currency: computed(() => data.value?.currency ?? 'USD'),
    basePrice: computed(() => (tiers.value ? getBasePricePerPhoto(tiers.value.tiers) : null)),
    isLoading: computed(() => isLoading.value),
  }
}
