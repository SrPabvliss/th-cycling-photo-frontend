import type { PhotoStatus } from '../types/responses/photo-list.response'

export interface IPhotoStatusConfig {
  label: string
  type: 'default' | 'info' | 'warning' | 'success' | 'error'
}

export const PHOTO_STATUS_CONFIG: Record<PhotoStatus, IPhotoStatusConfig> = {
  pending: { label: 'Pendiente', type: 'default' },
  detecting: { label: 'Detectando', type: 'info' },
  analyzing: { label: 'Analizando', type: 'warning' },
  completed: { label: 'Completada', type: 'success' },
  failed: { label: 'Fallida', type: 'error' },
}

export interface IPhotoFilterTab {
  label: string
  status: PhotoStatus | null
}

export const PHOTO_FILTER_TABS: IPhotoFilterTab[] = [
  { label: 'Todas', status: null },
  { label: 'Pendientes', status: 'pending' },
  { label: 'Completadas', status: 'completed' },
  { label: 'Fallidas', status: 'failed' },
]
