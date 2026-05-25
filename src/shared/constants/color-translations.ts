/**
 * AI pipeline (Gemini VLM) emits color names in English. Frontend palette,
 * picker, and BE corrections endpoint all speak Spanish only. Used by mappers
 * that bring AI-detected colors into the system.
 */
export const ENGLISH_TO_SPANISH_COLOR: Record<string, string> = {
  red: 'rojo',
  orange: 'naranja',
  yellow: 'amarillo',
  green: 'verde',
  blue: 'azul',
  lightblue: 'celeste',
  sky: 'celeste',
  skyblue: 'celeste',
  cyan: 'celeste',
  purple: 'morado',
  violet: 'morado',
  pink: 'rosa',
  magenta: 'fucsia',
  brown: 'marron',
  black: 'negro',
  gray: 'gris',
  grey: 'gris',
  white: 'blanco',
  gold: 'dorado',
  silver: 'plateado',
}
