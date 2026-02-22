/**
 * Calculates a percentage (0–100) from processed/total counts.
 * Returns 0 if total is 0 to avoid division by zero.
 */
export function calculateProgress(processed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((processed / total) * 100)
}
