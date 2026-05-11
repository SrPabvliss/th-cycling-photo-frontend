import { ENGLISH_TO_SPANISH_COLOR } from '@/shared/constants/color-translations'

/**
 * Translate an AI-emitted color (English, lowercase variations) to the
 * Spanish vocabulary used everywhere else. Returns the input unchanged when
 * already in Spanish or unknown — never throws.
 */
export function normalizeColor(value: string | null): string | null {
  if (!value) return value
  const lower = value.toLowerCase()
  return ENGLISH_TO_SPANISH_COLOR[lower] ?? value
}
