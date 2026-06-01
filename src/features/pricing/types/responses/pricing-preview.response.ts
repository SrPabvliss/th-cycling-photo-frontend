export interface IApiPricingTier {
  minQty: number
  maxQty: number | null
  pricePerPhoto: number
}

export interface IApiPricingPreview {
  quantity: number
  unitPrice: number
  subtotal: number
  currency: string
  tier: IApiPricingTier
  nextTier: IApiPricingTier | null
  photosToNextTier: number | null
}

export interface IPricingTier {
  minQty: number
  maxQty: number | null
  pricePerPhoto: number
}

export interface IPricingPreview {
  quantity: number
  unitPrice: number
  subtotal: number
  currency: string
  tier: IPricingTier
  nextTier: IPricingTier | null
  photosToNextTier: number | null
}
