/** Asset of the public event detail, with everything needed to resolve its url. */
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

/** API projection from GET /public/events/:slug */
export interface IApiPublicEventDetail {
  id: string
  slug: string
  name: string
  startDate: string
  endDate: string
  provinceName: string | null
  cantonName: string | null
  photoCount: number
  ownerName: string
  assets: IApiPublicEventAsset[]
  photoCategories: IApiPublicPhotoCategory[]
}

export interface IApiPublicPhotoCategory {
  id: number
  name: string
}

/** Frontend domain type */
export interface IPublicEventDetail {
  id: string
  slug: string
  name: string
  startDate: Date
  endDate: Date
  provinceName: string | null
  cantonName: string | null
  photoCount: number
  ownerName: string
  assets: IPublicEventAsset[]
  photoCategories: IPublicPhotoCategory[]
}

export interface IPublicPhotoCategory {
  id: number
  name: string
}
