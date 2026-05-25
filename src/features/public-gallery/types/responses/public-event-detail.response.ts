import type { IApiPublicEventAsset, IPublicEventAsset } from './public-event-list.response'

/** API projection from GET /public/events/:slug */
export interface IApiPublicEventDetail {
  slug: string
  name: string
  startDate: string
  endDate: string
  provinceName: string | null
  cantonName: string | null
  photoCount: number
  assets: IApiPublicEventAsset[]
  photoCategories: IApiPublicPhotoCategory[]
}

export interface IApiPublicPhotoCategory {
  id: number
  name: string
}

/** Frontend domain type */
export interface IPublicEventDetail {
  slug: string
  name: string
  startDate: Date
  endDate: Date
  provinceName: string | null
  cantonName: string | null
  photoCount: number
  assets: IPublicEventAsset[]
  photoCategories: IPublicPhotoCategory[]
}

export interface IPublicPhotoCategory {
  id: number
  name: string
}
