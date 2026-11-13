import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'

const loaders = vi.hoisted(() => ({ A: vi.fn(), B: vi.fn(), C: vi.fn(), D: vi.fn() }))
const loadMaskUrl = vi.hoisted(() => vi.fn())
vi.mock('../pieces/piece-loaders', () => ({ PIECE_LOADERS: loaders, loadMaskUrl }))

import { resetPieceCache, useSpotPieces } from './use-spot-pieces'

const FILE = { styles: { topo: 't', casco: 'c', textura: 'x', facetado: 'f' } }

describe('useSpotPieces', () => {
  beforeEach(() => {
    resetPieceCache()
    for (const loader of Object.values(loaders)) loader.mockReset()
    loadMaskUrl.mockReset()
    loadMaskUrl.mockResolvedValue('/helmet-mask.webp')
  })

  it('downloads a format once per visit, however many slots ask for it', async () => {
    loaders.B.mockResolvedValue({ default: FILE })
    const first = useSpotPieces('B')
    const second = useSpotPieces('B')

    first.load()
    second.load()
    await flushPromises()

    expect(loaders.B).toHaveBeenCalledTimes(1)
    expect(first.piece.value?.styles?.topo).toBe('t')
    expect(second.piece.value?.styles?.casco).toBe('c')
  })

  it('gives up for the visit when the file cannot be downloaded', async () => {
    loaders.D.mockRejectedValue(new Error('blocked'))
    const slot = useSpotPieces('D')

    slot.load()
    await flushPromises()
    useSpotPieces('D').load()
    await flushPromises()

    expect(slot.failed.value).toBe(true)
    expect(slot.piece.value).toBeNull()
    expect(loaders.D).toHaveBeenCalledTimes(1)
  })

  it('brings the helmet mask with the banners, never before', async () => {
    loaders.C.mockResolvedValue({ default: FILE })
    const slot = useSpotPieces('C')
    expect(loadMaskUrl).not.toHaveBeenCalled()

    slot.load()
    await flushPromises()

    expect(slot.piece.value?.maskUrl).toBe('/helmet-mask.webp')
  })

  it('counts a blocked mask as banners that could not be downloaded', async () => {
    loaders.A.mockResolvedValue({ default: FILE })
    loadMaskUrl.mockRejectedValue(new Error('blocked by an ad blocker'))
    const slot = useSpotPieces('A')

    slot.load()
    await flushPromises()

    expect(slot.failed.value).toBe(true)
    expect(slot.piece.value).toBeNull()
  })
})
