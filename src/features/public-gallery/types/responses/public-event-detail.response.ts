import type { IApiPublicEventAsset, IPublicEventAsset } from './public-event-list.response'

/** API projection from GET /public/events/:eventId */
export interface IApiPublicEventDetail {
  id: string
  name: string
  description: string | null
  date: string
  location: string | null
  provinceName: string | null
  cantonName: string | null
  isFeatured: boolean
  photoCount: number
  assets: IApiPublicEventAsset[]
  photoCategories: IApiPublicPhotoCategory[]
}

export interface IApiPublicPhotoCategory {
  id: string
  name: string
}

/** Frontend domain type */
export interface IPublicEventDetail {
  id: string
  name: string
  description: string | null
  date: Date
  location: string | null
  provinceName: string | null
  cantonName: string | null
  isFeatured: boolean
  photoCount: number
  assets: IPublicEventAsset[]
  photoCategories: IPublicPhotoCategory[]
}

export interface IPublicPhotoCategory {
  id: string
  name: string
}
