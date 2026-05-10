export const COLOR_PALETTE = [
  'rojo',
  'naranja',
  'amarillo',
  'verde',
  'azul',
  'celeste',
  'morado',
  'rosa',
  'fucsia',
  'marron',
  'negro',
  'gris',
  'blanco',
  'dorado',
  'beige',
] as const

export type ColorName = (typeof COLOR_PALETTE)[number]

const PALETTE_SET: ReadonlySet<string> = new Set(COLOR_PALETTE)

/** Narrow a free-form string to a known ColorName, returning null for unknowns. */
export function asColorName(value: string | null | undefined): ColorName | null {
  if (value && PALETTE_SET.has(value)) return value as ColorName
  return null
}

export const COLOR_PALETTE_HEX: Record<ColorName, string> = {
  rojo: '#E53935',
  naranja: '#FB8C00',
  amarillo: '#FDD835',
  verde: '#43A047',
  azul: '#1E88E5',
  celeste: '#29B6F6',
  morado: '#8E24AA',
  rosa: '#F06292',
  fucsia: '#D81B60',
  marron: '#6D4C41',
  negro: '#000000',
  gris: '#757575',
  blanco: '#FFFFFF',
  dorado: '#D4AF37',
  beige: '#D6C4A3',
}

export const COLOR_PALETTE_LABELS: Record<ColorName, string> = {
  rojo: 'Rojo',
  naranja: 'Naranja',
  amarillo: 'Amarillo',
  verde: 'Verde',
  azul: 'Azul',
  celeste: 'Celeste',
  morado: 'Morado',
  rosa: 'Rosa',
  fucsia: 'Fucsia',
  marron: 'Marrón',
  negro: 'Negro',
  gris: 'Gris',
  blanco: 'Blanco',
  dorado: 'Dorado',
  beige: 'Beige',
}
