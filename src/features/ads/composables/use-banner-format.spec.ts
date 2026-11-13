import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'

const loaders = vi.hoisted(() => ({ A: vi.fn(), B: vi.fn(), C: vi.fn(), D: vi.fn() }))
vi.mock('../banners/banner-loaders', () => ({ BANNER_LOADERS: loaders }))

import { resetBannerCache, useBannerFormat } from './use-banner-format'

const FILE = { styles: { topo: 't', casco: 'c', textura: 'x', facetado: 'f' } }

describe('useBannerFormat', () => {
  beforeEach(() => {
    resetBannerCache()
    for (const loader of Object.values(loaders)) loader.mockReset()
  })

  it('downloads a format once per visit, however many slots ask for it', async () => {
    loaders.B.mockResolvedValue({ default: FILE })
    const first = useBannerFormat('B')
    const second = useBannerFormat('B')

    first.load()
    second.load()
    await flushPromises()

    expect(loaders.B).toHaveBeenCalledTimes(1)
    expect(first.banner.value?.styles?.topo).toBe('t')
    expect(second.banner.value?.styles?.casco).toBe('c')
  })

  it('gives up for the visit when the file cannot be downloaded', async () => {
    loaders.D.mockRejectedValue(new Error('blocked'))
    const slot = useBannerFormat('D')

    slot.load()
    await flushPromises()
    useBannerFormat('D').load()
    await flushPromises()

    expect(slot.failed.value).toBe(true)
    expect(slot.banner.value).toBeNull()
    expect(loaders.D).toHaveBeenCalledTimes(1)
  })
})
