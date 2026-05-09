export type PhotoStatus = 'pending' | 'processing' | 'processed' | 'failed' | 'reviewed'

export type ColorRegion = 'helmet' | 'cyclist_clothes' | 'bicycle'

export type BibStatus = 'read' | 'abstained'

export type AttributeSource = 'ai' | 'reviewer'

export const COLOR_REGION_LABELS: Record<ColorRegion, string> = {
  helmet: 'Casco',
  cyclist_clothes: 'Ropa',
  bicycle: 'Bicicleta',
}

// Confidence-derived UI tag (FE only; backend persists raw confidence number).
export type ConfidenceLevel = 'high' | 'medium' | 'low'

export const CONFIDENCE_HIGH_THRESHOLD = 0.85
export const CONFIDENCE_MEDIUM_THRESHOLD = 0.5

export function confidenceLevel(confidence: number | null): ConfidenceLevel {
  if (confidence === null || confidence < CONFIDENCE_MEDIUM_THRESHOLD) return 'low'
  if (confidence < CONFIDENCE_HIGH_THRESHOLD) return 'medium'
  return 'high'
}

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
}

export const CONFIDENCE_TAG_TYPE: Record<ConfidenceLevel, 'success' | 'warning' | 'error'> = {
  high: 'success',
  medium: 'warning',
  low: 'error',
}

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
