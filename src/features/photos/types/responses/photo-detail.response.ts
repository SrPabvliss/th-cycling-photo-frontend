import type {
  IApiParticipantDetail,
  IParticipantDetail,
} from '@/features/classifications/types/responses/cyclist-detail.response'

import type { PhotoStatus } from './photo-list.response'

/** API projection from GET /photos/:id — already camelCase from backend */
export interface IApiPhotoDetail {
  id: string
  eventId: string
  filename: string
  storageKey: string
  fileSize: number
  mimeType: string
  width: number | null
  height: number | null
  status: string
  unclassifiedReason: string | null
  retouchedStorageKey: string | null
  retouchedFileSize: number | null
  retouchedAt: string | null
  classifiedAt: string | null
  capturedAt: string | null
  uploadedAt: string
  processedAt: string | null
  detectedParticipants: IApiParticipantDetail[]
}

/** Frontend domain type with resolved CDN URL and parsed dates */
export interface IPhotoDetail {
  id: string
  eventId: string
  filename: string
  storageKey: string
  imageUrl: string
  fileSize: number
  mimeType: string
  width: number | null
  height: number | null
  status: PhotoStatus
  unclassifiedReason: string | null
  retouchedImageUrl: string | null
  retouchedFileSize: number | null
  retouchedAt: Date | null
  classifiedAt: Date | null
  capturedAt: Date | null
  uploadedAt: Date
  processedAt: Date | null
  detectedParticipants: IParticipantDetail[]
}
