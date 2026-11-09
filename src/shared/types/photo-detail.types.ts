import type {
  AttributeSource,
  BibStatus,
  ColorRegion,
  PhotoStatus,
} from '@/shared/types/photo-enums'

export interface IApiBibAttribute {
  id: string
  digits: string
  status: BibStatus | null
  confidence: number | null
  source: AttributeSource
  cropUrl: string | null
  digitsOriginal: string
  wasCorrected: boolean
  correctedAt: string | null
  correctedByName?: string | null
}

export interface IApiPhotoOrder {
  id: string
  buyerName: string
  createdAt: string
  status: string
}

export interface IApiColorAttribute {
  id: string
  region: ColorRegion
  primaryColor: string
  secondaryColor: string | null
  confidence: number | null
  source: AttributeSource
  cropUrl: string | null
  primaryColorOriginal: string
  primaryWasCorrected: boolean
  secondaryColorOriginal: string | null
  secondaryWasCorrected: boolean
}

export interface IApiPhotoDetail {
  id: string
  eventId: string
  eventSlug: string
  filename: string
  publicSlug: string
  imageUrl: string
  thumbnailUrl: string
  fileSize: number
  mimeType: string
  width: number | null
  height: number | null
  status: string
  retouchedImageUrl: string | null
  retouchedFileSize: number | null
  retouchedAt: string | null
  capturedAt: string | null
  uploadedAt: string
  processedAt: string | null
  reviewedAt: string | null
  bibs: IApiBibAttribute[]
  colors: IApiColorAttribute[]
  photoCategoryId?: number | null
  photoCategoryName?: string | null
  orders?: IApiPhotoOrder[]
  position?: number
  eventPhotoCount?: number
  previousSlug?: string | null
  nextSlug?: string | null
}

export interface IBibAttribute {
  id: string
  digits: string
  status: BibStatus | null
  confidence: number | null
  source: AttributeSource
  cropUrl: string | null
  digitsOriginal: string
  wasCorrected: boolean
  correctedAt: Date | null
  correctedByName: string | null
}

export interface IPhotoOrder {
  id: string
  buyerName: string
  createdAt: Date
  status: string
}

export interface IColorAttribute {
  id: string
  region: ColorRegion
  primaryColor: string
  secondaryColor: string | null
  confidence: number | null
  source: AttributeSource
  cropUrl: string | null
  primaryColorOriginal: string
  primaryWasCorrected: boolean
  secondaryColorOriginal: string | null
  secondaryWasCorrected: boolean
}

export interface IPhotoDetail {
  id: string
  eventId: string
  eventSlug: string
  filename: string
  publicSlug: string
  imageUrl: string
  thumbnailUrl: string
  fileSize: number
  mimeType: string
  width: number | null
  height: number | null
  status: PhotoStatus
  retouchedImageUrl: string | null
  retouchedFileSize: number | null
  retouchedAt: Date | null
  capturedAt: Date | null
  uploadedAt: Date
  processedAt: Date | null
  reviewedAt: Date | null
  bibs: IBibAttribute[]
  colors: IColorAttribute[]
  photoCategoryId: number | null
  photoCategoryName: string | null
  orders: IPhotoOrder[]
  position: number
  eventPhotoCount: number
  previousSlug: string | null
  nextSlug: string | null
}
