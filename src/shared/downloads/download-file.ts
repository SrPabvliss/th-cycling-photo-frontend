import { triggerDownload } from '@/shared/utils/download.utils'

/** Pause between two files: browsers block downloads started too close together. */
export const DOWNLOAD_GAP_MS = 1000

/**
 * Downloads one file the way the app always has (a hidden frame on the signed address, so the
 * storage's own "attachment" answer saves it). The page cannot see whether the transfer itself
 * fails, so this rejects only on what it can know: no connection, or no address. It resolves
 * after the pause, ready for the next file.
 */
export function downloadFile(url: string, filename: string): Promise<void> {
  if (!url) return Promise.reject(new Error(`No download address for ${filename}`))
  if (!navigator.onLine) return Promise.reject(new Error('Offline'))
  triggerDownload(url)
  return new Promise((resolve) => setTimeout(resolve, DOWNLOAD_GAP_MS))
}
