// Production figures rounded down, written by hand: they are not computed live. Each page shows
// four of them with the date they were taken.
export const FIGURES_AS_OF = 'noviembre de 2026'

export const PLATFORM_FIGURES = {
  events: { value: '14', label: 'carreras publicadas' },
  photos: { value: '+18.000', label: 'fotos en galería' },
  accounts: { value: '+500', label: 'ciclistas registrados' },
  provinces: { value: '6', label: 'provincias del Ecuador' },
  delivered: { value: '+1.000', label: 'fotos vendidas y entregadas' },
} as const

export type PlatformFigure = (typeof PLATFORM_FIGURES)[keyof typeof PLATFORM_FIGURES]
