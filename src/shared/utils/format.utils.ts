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
