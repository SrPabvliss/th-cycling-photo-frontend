export type EventStatus = 'active' | 'archived'

export type EventAlert =
  | 'archived'
  | 'no_cover'
  | 'quota_exhausted'
  | 'frozen'
  | 'empty'
  | 'quota_near'
  | null

export interface IApiEventListItem {
  id: string
  slug: string
  name: string
  startDate: string
  endDate: string
  provinceName: string | null
  cantonName: string | null
  coverImageUrl: string | null
  coverImageSlug: string | null
  status: string
  isFrozen: boolean
  photoCount: number
  totalFileSize: number
  organizerId: string
  organizerName: string
  photoQuota: number | null
  photosUploaded: number
  reviewedCount: number
  categorizedCount: number
  revenue: string
  paidCount: number
  deliveredCount: number
  giftedCount: number
  unpaidCount: number
  cancelledCount: number
  lastUploadAt: string | null
  isArchived: boolean
  alert: EventAlert
}

export interface IEventListItem {
  id: string
  slug: string
  name: string
  startDate: Date
  endDate: Date
  provinceName: string | null
  cantonName: string | null
  coverImageUrl: string | null
  coverImageSlug: string | null
  status: EventStatus
  isFrozen: boolean
  photoCount: number
  totalFileSize: number
  organizerId: string
  organizerName: string
  photoQuota: number | null
  photosUploaded: number
  reviewedCount: number
  categorizedCount: number
  revenue: string
  paidCount: number
  deliveredCount: number
  giftedCount: number
  unpaidCount: number
  cancelledCount: number
  lastUploadAt: Date | null
  isArchived: boolean
  alert: EventAlert
}

export interface IApiEventDetail {
  id: string
  slug: string
  name: string
  startDate: string
  endDate: string
  provinceName: string | null
  cantonName: string | null
  provinceId: number | null
  cantonId: number | null
  coverImageUrl: string | null
  coverImageSlug: string | null
  status: string
  photoCount: number
  classifiedCount: number
  categorizedCount: number
  totalFileSize: number
  photoQuota: number | null
  photosUploaded: number
  isFrozen: boolean
  frozenAt: string | null
  organizerName: string
  eventTypeName: string
  contractName: string | null
  reviewedCount: number
  lastUploadAt: string | null
  revenue: string
  ordersCount: number
  soldPhotoCount: number
  createdAt: string
  updatedAt: string
}

export interface IEventDetail {
  id: string
  slug: string
  name: string
  startDate: Date
  endDate: Date
  provinceName: string | null
  cantonName: string | null
  provinceId: number | null
  cantonId: number | null
  coverImageUrl: string | null
  coverImageSlug: string | null
  status: EventStatus
  photoCount: number
  classifiedCount: number
  categorizedCount: number
  totalFileSize: number
  photoQuota: number | null
  photosUploaded: number
  isFrozen: boolean
  frozenAt: Date | null
  organizerName: string
  eventTypeName: string
  contractName: string | null
  reviewedCount: number
  lastUploadAt: Date | null
  revenue: string
  ordersCount: number
  soldPhotoCount: number
  createdAt: Date
  updatedAt: Date
}
