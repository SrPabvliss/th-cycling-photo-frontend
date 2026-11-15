// Each banner file is downloaded only when a slot that uses it comes near the screen: none of
// them is part of the first download of the app.
export interface IPieceFile {
  /** Carousels and season bar: one piece of HTML per style, with {{markers}}. */
  styles?: Record<string, string>
  /** Styles that change with the organizer message (the 2:1 piece only). */
  organizer?: Record<string, string>
  /** Season bar: the frame its slides go into, at {{slides}}. */
  frame?: string
  /** Sponsor strip: the whole strip, its four slides inside. */
  html?: string
  /** Address of the helmet mask, which the light styles use: set when the file is loaded. */
  maskUrl?: string
}

export type PieceFileKey =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'season-narrow'
  | 'season-wide'
  | 'presenter-narrow'
  | 'presenter-wide'

type Loader = () => Promise<{ default: IPieceFile }>

export const PIECE_LOADERS: Record<PieceFileKey, Loader> = {
  A: () => import('./a.json'),
  B: () => import('./b.json'),
  C: () => import('./c.json'),
  D: () => import('./d.json'),
  'season-narrow': () => import('./season-narrow.json'),
  'season-wide': () => import('./season-wide.json'),
  'presenter-narrow': () => import('./presenter-narrow.json'),
  'presenter-wide': () => import('./presenter-wide.json'),
}

/**
 * The helmet mask, loaded with the banners and never before. Ad blockers drop addresses that look
 * like ads: as part of a banner download, a blocked mask is one more ad that cannot be shown,
 * never a screen that cannot start.
 */
export const loadMaskUrl = (): Promise<string> =>
  import('@/assets/brand/helmet-mask.webp').then((module) => module.default)
