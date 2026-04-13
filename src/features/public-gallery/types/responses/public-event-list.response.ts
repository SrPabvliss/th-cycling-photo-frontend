/** API projection from GET /public/events */
export interface IApiPublicEventListItem {
  id: string
  name: string
  date: string
  location: string | null
  provinceName: string | null
  cantonName: string | null
  isFeatured: boolean
  photoCount: number
  assets: IApiPublicEventAsset[]
}

export interface IApiPublicEventAsset {
  assetType: string
  url: string
  publicSlug: string
}

/** Frontend domain type */
export interface IPublicEventListItem {
  id: string
  name: string
  date: Date
  location: string | null
  provinceName: string | null
  cantonName: string | null
  isFeatured: boolean
  photoCount: number
  assets: IPublicEventAsset[]
}

export interface IPublicEventAsset {
  assetType: string
  url: string
  publicSlug: string
}
