import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const triggerDownload = vi.fn()
vi.mock('@/shared/utils/download.utils', () => ({
  triggerDownload: (url: string) => triggerDownload(url),
}))

import { DOWNLOAD_GAP_MS, downloadFile } from './download-file'

describe('downloadFile', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    triggerDownload.mockReset()
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('starts the download the way the app always has, and lets the browser breathe', async () => {
    let settled = false
    const pending = downloadFile('https://cdn/foto.jpg', 'foto.jpg').then(() => (settled = true))

    expect(triggerDownload).toHaveBeenCalledWith('https://cdn/foto.jpg')
    await vi.advanceTimersByTimeAsync(DOWNLOAD_GAP_MS - 1)
    expect(settled).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    await pending
    expect(settled).toBe(true)
  })

  it('fails without a connection, starting nothing', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)

    await expect(downloadFile('https://cdn/foto.jpg', 'foto.jpg')).rejects.toThrow()
    expect(triggerDownload).not.toHaveBeenCalled()
  })

  it('fails without an address', async () => {
    await expect(downloadFile('', 'foto.jpg')).rejects.toThrow()
  })
})
