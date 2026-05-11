/**
 * Shared shape returned by both bib and color correction endpoints.
 * `changed=false` is a no-op (same value), no correction row appended.
 */
export interface ICorrectionResultResponse {
  changed: boolean
  correctionId?: string
}
