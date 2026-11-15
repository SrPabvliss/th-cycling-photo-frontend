import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { defineComponent, h, ref } from 'vue'

import {
  usePublicEventNoBibPhotosInfinite,
  usePublicEventPhotosInfinite,
} from './use-public-event-photos'

const get = vi.fn()

vi.mock('@/core/http/axios-client', () => ({
  httpClient: { get: (...args: unknown[]) => get(...args) },
}))

const page = (ids: string[], pageNumber = 1, totalPages = 1) => ({
  data: ids.map((id) => ({ id, publicSlug: `slug-${id}`, width: 3, height: 4 })),
  meta: { pagination: { page: pageNumber, limit: 30, total: ids.length, totalPages } },
})

function withQuery<T>(setup: () => T): T {
  let result!: T
  const Host = defineComponent({
    setup() {
      result = setup()
      return () => h('div')
    },
  })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  mount(Host, { global: { plugins: [[VueQueryPlugin, { queryClient }]] } })
  return result
}

const paramsOf = (call: number) => (get.mock.calls[call]![1] as { params: object }).params

describe('usePublicEventPhotosInfinite', () => {
  beforeEach(() => {
    get.mockReset()
    get.mockResolvedValue(page(['a']))
  })

  it('asks for every photo, with no plate parameters, when there is no plate', async () => {
    withQuery(() => usePublicEventPhotosInfinite('mama-rumi', ref(null), ref(null)))
    await flushPromises()

    expect(get.mock.calls[0]![0]).toBe('/public/events/mama-rumi/photos')
    expect(paramsOf(0)).toEqual({ page: 1, limit: 30 })
  })

  it('asks for the exact plate, saying so, when there is one', async () => {
    withQuery(() => usePublicEventPhotosInfinite('mama-rumi', ref(null), ref('127')))
    await flushPromises()

    expect(paramsOf(0)).toEqual({ page: 1, limit: 30, bibNumber: '127', bibMatch: 'exact' })
  })

  it('adds the category', async () => {
    withQuery(() => usePublicEventPhotosInfinite('mama-rumi', ref(4), ref('127')))
    await flushPromises()

    expect(paramsOf(0)).toMatchObject({ photoCategoryId: 4, bibNumber: '127', bibMatch: 'exact' })
  })

  it('keeps the previous photos on screen while another plate loads', async () => {
    const plate = ref<string | null>(null)
    const query = withQuery(() => usePublicEventPhotosInfinite('mama-rumi', ref(null), plate))
    await flushPromises()

    let release: (value: unknown) => void = () => {}
    get.mockReturnValueOnce(new Promise((resolve) => (release = resolve)))
    plate.value = '127'
    await flushPromises()

    expect(query.data.value?.pages[0]?.items.map((photo) => photo.id)).toEqual(['a'])
    expect(query.isPlaceholderData.value).toBe(true)

    release(page(['b']))
    await flushPromises()
    expect(query.data.value?.pages[0]?.items.map((photo) => photo.id)).toEqual(['b'])
  })

  it('asks for the next page', async () => {
    get.mockResolvedValueOnce(page(['a'], 1, 2)).mockResolvedValueOnce(page(['b'], 2, 2))
    const query = withQuery(() => usePublicEventPhotosInfinite('mama-rumi', ref(null), ref(null)))
    await flushPromises()

    await query.fetchNextPage()

    expect(paramsOf(1)).toEqual({ page: 2, limit: 30 })
    expect(query.hasNextPage.value).toBe(false)
  })
})

describe('usePublicEventNoBibPhotosInfinite', () => {
  beforeEach(() => {
    get.mockReset()
    get.mockResolvedValue(page(['n']))
  })

  it('stays off without a plate search', async () => {
    withQuery(() => usePublicEventNoBibPhotosInfinite('mama-rumi', ref(null), ref(null)))
    await flushPromises()

    expect(get).not.toHaveBeenCalled()
  })

  it('asks for the photos with no plate detected while a plate is searched', async () => {
    withQuery(() => usePublicEventNoBibPhotosInfinite('mama-rumi', ref(2), ref('127')))
    await flushPromises()

    expect(paramsOf(0)).toEqual({ page: 1, limit: 30, section: 'no_bib', photoCategoryId: 2 })
  })
})
