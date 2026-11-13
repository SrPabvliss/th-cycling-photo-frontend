// Each format is its own file, downloaded only when a slot of that format comes near the screen:
// none of them is part of the first download of the app.
export interface IBannerFile {
  styles: Record<string, string>
  /** Styles that change with the organizer message (the 2:1 piece only). */
  organizer?: Record<string, string>
}

export const BANNER_LOADERS: Record<
  'A' | 'B' | 'C' | 'D',
  () => Promise<{ default: IBannerFile }>
> = {
  A: () => import('./a.json'),
  B: () => import('./b.json'),
  C: () => import('./c.json'),
  D: () => import('./d.json'),
}
