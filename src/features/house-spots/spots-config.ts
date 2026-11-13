/** House ads on or off. On unless VITE_ADS_ENABLED is exactly 'false'. */
export const SPOTS_ENABLED: boolean = import.meta.env.VITE_ADS_ENABLED !== 'false'

export type SpotFormat = 'A' | 'B' | 'C' | 'D'

/** The shape each format keeps from its first paint. */
export const SPOT_RATIO: Record<SpotFormat, string> = {
  A: '2 / 1',
  B: '5 / 1',
  C: '3 / 4',
  D: '32 / 5',
}
