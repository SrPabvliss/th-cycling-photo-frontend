import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { computed, ref } from 'vue'

import type { IMyOrderDetail, MyOrderState } from '../../../types/responses/my-order.response'
import OrderPhotoGrid from './OrderPhotoGrid.vue'

const downloadsEnabled = vi.fn()
const status = ref<'pending' | 'error' | 'success'>('success')
const updatedAt = ref(Date.now())
const refetch = vi.fn()
const downloadFile = vi.fn()
const error = vi.fn()

const FILES = [
  {
    id: 'p1',
    filename: 'a.jpg',
    fileSize: 1,
    downloadUrl: 'https://storage/a.jpg?signed',
    thumbnailUrl: 'https://cdn/thumb/a.jpg',
  },
  {
    id: 'p2',
    filename: 'b.jpg',
    fileSize: 1,
    downloadUrl: 'https://storage/b.jpg?signed',
    thumbnailUrl: null,
  },
]

vi.mock('../../../composables/queries/use-my-order-downloads', () => ({
  useMyOrderDownloadsQuery: (_id: unknown, enabled: { value: boolean }) => {
    downloadsEnabled(enabled.value)
    return {
      status: computed(() => status.value),
      data: computed(() => (status.value === 'success' ? FILES : undefined)),
      dataUpdatedAt: updatedAt,
      isFetching: ref(false),
      refetch,
    }
  },
}))
vi.mock('@/shared/downloads/download-file', () => ({
  downloadFile: (url: string, name: string) => downloadFile(url, name),
}))
vi.mock('naive-ui', async (original) => ({
  ...(await original<typeof import('naive-ui')>()),
  useMessage: () => ({ error }),
}))

const order = (state: MyOrderState, canDownload: boolean): IMyOrderDetail => ({
  id: 'o1',
  state,
  eventName: 'x',
  createdAt: '2026-11-12T15:00:00.000Z',
  subtotal: '8.00',
  currency: 'USD',
  canDownload,
  canCancel: false,
  photos: [
    { id: 'p1', galleryUrl: 'https://cdn/gallery/a.jpg' },
    { id: 'p2', galleryUrl: 'https://cdn/gallery/b.jpg' },
  ],
  invoice: null,
  billing: null,
  confirmingTransactionId: null,
})

const mounted: { unmount(): void }[] = []
async function mountGrid(value: IMyOrderDetail) {
  mounted.push(mount(OrderPhotoGrid, { props: { order: value }, attachTo: document.body }))
  await flushPromises()
  return new DOMWrapper(document.body)
}

describe('OrderPhotoGrid', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    status.value = 'success'
    updatedAt.value = Date.now()
    for (const mock of [downloadsEnabled, refetch, downloadFile, error]) mock.mockReset()
    refetch.mockResolvedValue({ data: FILES })
    downloadFile.mockResolvedValue(undefined)
  })
  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
  })

  it('uses the thumbnails of a ready order, never the download address', async () => {
    const wrapper = await mountGrid(order('ready', true))

    const sources = wrapper.findAll('img').map((image) => image.attributes('src'))
    expect(sources).toEqual(['https://cdn/thumb/a.jpg'])
    expect(sources.some((src) => src?.includes('storage'))).toBe(false)
    expect(wrapper.text()).toContain('b.jpg')
  })

  it('does not ask for downloads of an order still confirming, and offers none', async () => {
    const wrapper = await mountGrid(order('confirming', false))

    expect(downloadsEnabled).toHaveBeenLastCalledWith(false)
    expect(wrapper.findAll('img').map((image) => image.attributes('src'))).toEqual([
      'https://cdn/gallery/a.jpg',
      'https://cdn/gallery/b.jpg',
    ])
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('downloads one photo with the address it has while it is fresh', async () => {
    const wrapper = await mountGrid(order('ready', true))

    await wrapper.findAll('button[aria-label="Descargar foto"]')[0]!.trigger('click')
    await flushPromises()

    expect(refetch).not.toHaveBeenCalled()
    expect(downloadFile).toHaveBeenCalledWith('https://storage/a.jpg?signed', 'a.jpg')
  })

  it('asks for fresh addresses first when they are older than 55 minutes', async () => {
    updatedAt.value = Date.now() - 56 * 60_000
    const wrapper = await mountGrid(order('ready', true))

    await wrapper.findAll('button[aria-label="Descargar foto"]')[0]!.trigger('click')
    await flushPromises()

    expect(refetch).toHaveBeenCalledTimes(1)
    expect(refetch.mock.invocationCallOrder[0]!).toBeLessThan(
      downloadFile.mock.invocationCallOrder[0]!,
    )
  })

  it('says a single download failed', async () => {
    downloadFile.mockRejectedValue(new Error('offline'))
    const wrapper = await mountGrid(order('ready', true))

    await wrapper.findAll('button[aria-label="Descargar foto"]')[0]!.trigger('click')
    await flushPromises()

    expect(error).toHaveBeenCalledWith('No pudimos descargar la foto. Intenta de nuevo.')
  })

  it('says the photos could not be loaded, only in their area', async () => {
    status.value = 'error'
    const wrapper = await mountGrid(order('ready', true))

    expect(wrapper.text()).toContain('No pudimos cargar tus fotos')
    await wrapper
      .findAll('button')
      .find((each) => each.text().includes('Reintentar'))!
      .trigger('click')
    expect(refetch).toHaveBeenCalled()
  })

  it('offers to download them all with fresh addresses', async () => {
    const wrapper = await mountGrid(order('ready', true))

    await wrapper
      .findAll('button')
      .find((each) => each.text().includes('Descargar todas'))!
      .trigger('click')
    await flushPromises()

    expect(refetch).toHaveBeenCalledTimes(1)
    expect(downloadFile.mock.calls.map(([url]) => url)).toEqual([
      'https://storage/a.jpg?signed',
      'https://storage/b.jpg?signed',
    ])
  })
})
