/**
 * Formats structured location for display.
 * Returns "Cantón, Provincia" if both exist, or just one, or null.
 */
export function formatLocation(opts: {
  cantonName: string | null
  provinceName: string | null
}): string | null {
  if (opts.cantonName && opts.provinceName) {
    return `${opts.cantonName}, ${opts.provinceName}`
  }
  if (opts.provinceName) return opts.provinceName
  if (opts.cantonName) return opts.cantonName
  return null
}

/**
 * Resolves a country's ISO code from a list, by id. Returns null when the id is
 * unset or the country is not in the list.
 */
export function findCountryIsoCode(
  countries: { id: number; isoCode: string }[] | undefined,
  countryId: number | null,
): string | null {
  if (!countryId || !countries) return null
  return countries.find((country) => country.id === countryId)?.isoCode ?? null
}
