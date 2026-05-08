import {
  PHOTO_STATUS_LABELS,
  PHOTO_STATUS_TAG_TYPE,
  type PhotoStatus,
} from '@/shared/types/photo-enums'

export interface IPhotoStatusConfig {
  label: string
  type: 'default' | 'info' | 'warning' | 'success' | 'error'
}

export const PHOTO_STATUS_CONFIG: Record<PhotoStatus, IPhotoStatusConfig> = {
  pending: { label: PHOTO_STATUS_LABELS.pending, type: PHOTO_STATUS_TAG_TYPE.pending },
  processing: { label: PHOTO_STATUS_LABELS.processing, type: PHOTO_STATUS_TAG_TYPE.processing },
  processed: { label: PHOTO_STATUS_LABELS.processed, type: PHOTO_STATUS_TAG_TYPE.processed },
  failed: { label: PHOTO_STATUS_LABELS.failed, type: PHOTO_STATUS_TAG_TYPE.failed },
  reviewed: { label: PHOTO_STATUS_LABELS.reviewed, type: PHOTO_STATUS_TAG_TYPE.reviewed },
}

export interface IPhotoFilterTab {
  label: string
  status: PhotoStatus | null
}

export const PHOTO_FILTER_TABS: IPhotoFilterTab[] = [
  { label: 'Todas', status: null },
  { label: 'Pendientes', status: 'pending' },
  { label: 'Procesando', status: 'processing' },
  { label: 'Procesadas', status: 'processed' },
  { label: 'Revisadas', status: 'reviewed' },
  { label: 'Fallidas', status: 'failed' },
]
