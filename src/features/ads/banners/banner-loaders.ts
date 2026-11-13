// Each banner file is downloaded only when a slot that uses it comes near the screen: none of
// them is part of the first download of the app.
export interface IBannerFile {
  /** Carousels and season bar: one piece of HTML per style, with {{markers}}. */
  styles?: Record<string, string>
  /** Styles that change with the organizer message (the 2:1 piece only). */
  organizer?: Record<string, string>
  /** Season bar: the frame its slides go into, at {{slides}}. */
  frame?: string
  /** Sponsor strip: the whole strip, its four slides inside. */
  html?: string
}

export type BannerFileKey =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'season-narrow'
  | 'season-wide'
  | 'sponsor-narrow'
  | 'sponsor-wide'

type Loader = () => Promise<{ default: IBannerFile }>

export const BANNER_LOADERS: Record<BannerFileKey, Loader> = {
  A: () => import('./a.json'),
  B: () => import('./b.json'),
  C: () => import('./c.json'),
  D: () => import('./d.json'),
  'season-narrow': () => import('./season-narrow.json'),
  'season-wide': () => import('./season-wide.json'),
  'sponsor-narrow': () => import('./sponsor-narrow.json'),
  'sponsor-wide': () => import('./sponsor-wide.json'),
}
