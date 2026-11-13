/** House ads on or off. On unless VITE_ADS_ENABLED is exactly 'false'. */
export const ADS_ENABLED: boolean = import.meta.env.VITE_ADS_ENABLED !== 'false'

export type AdFormat = 'A' | 'B' | 'C' | 'D'

/** The shape each format keeps from its first paint. */
export const AD_RATIO: Record<AdFormat, string> = {
  A: '2 / 1',
  B: '5 / 1',
  C: '3 / 4',
  D: '32 / 5',
}
