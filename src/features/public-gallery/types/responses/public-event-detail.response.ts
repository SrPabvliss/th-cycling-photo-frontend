import type { IApiPublicEventAsset, IPublicEventAsset } from './public-event-list.response'

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
