export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

const LOCALE = 'es-EC'

export function formatNumber(value: number): string {
  return value.toLocaleString(LOCALE)
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural
}

export function getInitials(
  firstName?: string | null,
  lastName?: string | null,
  fallback?: string | null,
): string {
  const parts = [firstName, lastName].filter(Boolean) as string[]
  if (parts.length === 0) {
    return (fallback ?? '').slice(0, 2).toUpperCase()
  }
  return parts
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}
