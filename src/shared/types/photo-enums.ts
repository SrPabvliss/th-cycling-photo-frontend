export type PhotoStatus = 'pending' | 'processing' | 'processed' | 'failed' | 'reviewed'

export type ColorRegion = 'helmet' | 'cyclist_clothes' | 'bicycle'

export const PHOTO_STATUS_LABELS: Record<PhotoStatus, string> = {
  pending: 'Pendiente',
  processing: 'Procesando',
  processed: 'Procesada',
  failed: 'Falló',
  reviewed: 'Revisada',
}

export const PHOTO_STATUS_TAG_TYPE: Record<
  PhotoStatus,
  'default' | 'info' | 'success' | 'warning' | 'error'
> = {
  pending: 'default',
  processing: 'info',
  processed: 'success',
  failed: 'error',
  reviewed: 'success',
}
