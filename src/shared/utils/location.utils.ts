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
