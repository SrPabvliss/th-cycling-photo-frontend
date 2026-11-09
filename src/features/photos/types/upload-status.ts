export type UploadStatus =
  | 'pending'
  | 'queued'
  | 'uploading'
  | 'uploaded'
  | 'confirmed'
  | 'failed'
  | 'retrying'

/**
 * Lookup table for valid state transitions.
 * `uploaded` = file in B2 (backend doesn't know yet)
 * `confirmed` = backend registered metadata (terminal state)
 */
const VALID_TRANSITIONS: Record<UploadStatus, UploadStatus[]> = {
  pending: ['queued'],
  queued: ['uploading'],
  uploading: ['uploaded', 'failed', 'confirmed'],
  uploaded: ['confirmed', 'failed'],
  failed: ['retrying'],
  retrying: ['queued'],
  confirmed: [],
}

export function assertValidTransition(from: UploadStatus, to: UploadStatus): void {
  const allowed = VALID_TRANSITIONS[from]
  if (!allowed.includes(to)) {
    throw new Error(`Invalid upload status transition: ${from} → ${to}`)
  }
}

export interface IUploadItem {
  id: string
  fileName: string
  fileSize: number
  status: UploadStatus
  progress: number
  error?: string
  objectKey?: string
  /** Raw File object — never proxified by Vue */
  _file: File
  /** AbortController for cancellation — never proxified by Vue */
  _abortController: AbortController | null
}

export interface IRejectionSummary {
  invalidType: number
  tooLarge: number
}
