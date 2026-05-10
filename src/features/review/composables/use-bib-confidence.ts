import { computed, type ComputedRef } from 'vue'

import { CONFIDENCE_THRESHOLDS } from '../constants/confidence-thresholds'

type Level = 'success' | 'warn' | 'error'

const LEVEL_LABEL: Record<Level, string> = {
  success: 'Alta',
  warn: 'Media',
  error: 'Baja',
}

/** Maps a 0–1 confidence into level/label/pct used by bib chips. */
export function useBibConfidence(confidence: ComputedRef<number | null>) {
  const level = computed<Level>(() => {
    const c = confidence.value
    if (c === null || c < CONFIDENCE_THRESHOLDS.WARN) return 'error'
    if (c < CONFIDENCE_THRESHOLDS.HIGH) return 'warn'
    return 'success'
  })
  const label = computed(() => LEVEL_LABEL[level.value])
  const pct = computed(() =>
    confidence.value === null ? '—' : `${Math.round(confidence.value * 100)}%`,
  )
  return { level, label, pct }
}
