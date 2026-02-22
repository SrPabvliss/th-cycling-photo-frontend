import { env } from '@/core/config/env'

export function getPhotoUrl(storageKey: string): string {
  return `${env.VITE_CDN_BASE_URL}/${storageKey}`
}
