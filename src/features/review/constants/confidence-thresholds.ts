/** Boundaries for the bib OCR confidence chip (low / medium / high). */
export const CONFIDENCE_THRESHOLDS = {
  /** Below this is "Baja". */
  WARN: 0.5,
  /** Below this (but ≥ WARN) is "Media". At/above is "Alta". */
  HIGH: 0.85,
} as const
