const PLATE = /^[0-9]{1,10}$/

/** Query parameter that carries a plate into the event gallery, from the home finder. */
export const PLATE_QUERY = 'placa'

export interface IParsedPlate {
  /** The plate number, or null when the field is empty or cannot be read. */
  plate: string | null
  error: 'invalid' | null
}

/**
 * Reads what a person typed as a rider plate. Spaces around it are ignored. Empty means "no
 * plate" and is fine; anything that is not one to ten digits is an error.
 */
export function parsePlate(raw: string): IParsedPlate {
  const text = raw.trim()

  if (text === '') return { plate: null, error: null }
  if (!PLATE.test(text)) return { plate: null, error: 'invalid' }

  return { plate: text, error: null }
}

/** The plate a url carries, or an empty string when it carries none it can use. */
export function plateFromQuery(value: unknown): string {
  const single = Array.isArray(value) ? value[0] : value
  return typeof single === 'string' ? (parsePlate(single).plate ?? '') : ''
}
