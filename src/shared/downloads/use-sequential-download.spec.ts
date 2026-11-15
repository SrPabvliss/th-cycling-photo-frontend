import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'

const downloadFile = vi.fn()
vi.mock('./download-file', () => ({
  downloadFile: (url: string, filename: string) => downloadFile(url, filename),
}))

import { useSequentialDownload } from './use-sequential-download'

const FILES = [
  { url: 'u1', filename: 'a.jpg' },
  { url: 'u2', filename: 'b.jpg' },
  { url: 'u3', filename: 'c.jpg' },
]

function setup(getFiles: () => Promise<typeof FILES>) {
  let api!: ReturnType<typeof useSequentialDownload>
  const wrapper = mount(
    defineComponent({
      setup() {
        api = useSequentialDownload({ getFiles })
        return () => null
      },
    }),
  )
  return { api, wrapper }
}

/** A download that waits until the test lets it finish. */
function held() {
  let release!: () => void
  const promise = new Promise<void>((resolve) => (release = resolve))
  return { promise, release }
}

describe('useSequentialDownload', () => {
  beforeEach(() => {
    downloadFile.mockReset()
  })

  it('downloads the files in order, one at a time', async () => {
    downloadFile.mockResolvedValue(undefined)
    const { api } = setup(async () => FILES)

    await api.start()

    expect(downloadFile.mock.calls.map(([url]) => url)).toEqual(['u1', 'u2', 'u3'])
    expect(api.done.value).toBe(3)
    expect(api.total.value).toBe(3)
    expect(api.state.value).toBe('done')
  })

  it('stops at a failure and continues from there with fresh addresses', async () => {
    downloadFile.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('offline'))
    const getFiles = vi.fn(async () => FILES)
    const { api } = setup(getFiles)

    await api.start()
    expect(api.state.value).toBe('failed')
    expect(api.done.value).toBe(1)

    downloadFile.mockReset().mockResolvedValue(undefined)
    await api.resume()

    expect(getFiles).toHaveBeenCalledTimes(2)
    expect(downloadFile.mock.calls.map(([url]) => url)).toEqual(['u2', 'u3'])
    expect(api.done.value).toBe(3)
    expect(api.state.value).toBe('done')
  })

  it('stops after the file in progress', async () => {
    const second = held()
    downloadFile
      .mockResolvedValueOnce(undefined)
      .mockReturnValueOnce(second.promise)
      .mockResolvedValue(undefined)
    const { api } = setup(async () => FILES)

    const running = api.start()
    await vi.waitFor(() => expect(downloadFile).toHaveBeenCalledTimes(2))
    expect(api.state.value).toBe('running')
    api.stop()
    second.release()
    await running

    expect(api.done.value).toBe(2)
    expect(api.state.value).toBe('stopped')
    expect(downloadFile).toHaveBeenCalledTimes(2)
  })

  it('starts nothing more once the screen is left', async () => {
    const first = held()
    downloadFile.mockReturnValueOnce(first.promise).mockResolvedValue(undefined)
    const { api, wrapper } = setup(async () => FILES)

    const running = api.start()
    await vi.waitFor(() => expect(downloadFile).toHaveBeenCalledTimes(1))
    wrapper.unmount()
    first.release()
    await running

    expect(downloadFile).toHaveBeenCalledTimes(1)
  })

  it('fails with nothing done when the files cannot be listed', async () => {
    const { api } = setup(async () => {
      throw new Error('down')
    })

    await api.start()

    expect(api.state.value).toBe('failed')
    expect(api.done.value).toBe(0)
    expect(downloadFile).not.toHaveBeenCalled()
  })

  it('ends at once with nothing to download', async () => {
    const { api } = setup(async () => [])

    await expect(api.start()).resolves.toBeUndefined()

    expect(api.state.value).toBe('done')
    expect(api.total.value).toBe(0)
  })

  it('does not run twice at the same time', async () => {
    const first = held()
    downloadFile.mockReturnValueOnce(first.promise).mockResolvedValue(undefined)
    const getFiles = vi.fn(async () => FILES)
    const { api } = setup(getFiles)

    const running = api.start()
    await api.start()
    first.release()
    await running

    expect(getFiles).toHaveBeenCalledTimes(1)
  })
})
