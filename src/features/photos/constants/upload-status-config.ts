import type { UploadStatus } from '../types/upload-status'

export interface IUploadStatusDisplay {
  label: string
  type: 'default' | 'info' | 'success' | 'warning' | 'error'
}

export const UPLOAD_STATUS_CONFIG: Record<UploadStatus, IUploadStatusDisplay> = {
  pending: { label: 'Pendiente', type: 'default' },
  queued: { label: 'En cola', type: 'info' },
  uploading: { label: 'Subiendo', type: 'info' },
  uploaded: { label: 'Subido', type: 'success' },
  confirmed: { label: 'Confirmado', type: 'success' },
  failed: { label: 'Error', type: 'error' },
  retrying: { label: 'Reintentando', type: 'warning' },
}
