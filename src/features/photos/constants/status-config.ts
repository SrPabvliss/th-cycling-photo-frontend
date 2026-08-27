import type { PhotoStatus } from '@/shared/types/photo-enums'

export {
  PHOTO_STATUS_CONFIG,
  type IPhotoStatusConfig,
} from '@/shared/constants/photo-status.constants'

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
