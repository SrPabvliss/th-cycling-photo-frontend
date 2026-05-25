/** API projection from GET /public/events */
export interface IApiPublicEventListItem {
  slug: string
  name: string
  startDate: string
  endDate: string
  provinceName: string | null
  cantonName: string | null
  photoCount: number
  coverSlug: string | null
}

/** Frontend domain type */
export interface IPublicEventListItem {
  slug: string
  name: string
  startDate: Date
  endDate: Date
  provinceName: string | null
  cantonName: string | null
  photoCount: number
  coverSlug: string | null
}

/** Used by detail projection — full asset info */
export interface IApiPublicEventAsset {
  assetType: string
  url: string
  publicSlug: string
}

export interface IPublicEventAsset {
  assetType: string
  url: string
  publicSlug: string
}
