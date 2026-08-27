import { defineComponent, ref, type Ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const get = vi.fn()

vi.mock('@/core/http/axios-client', () => ({
  httpClient: { get: (...args: unknown[]) => get(...args) },
}))

import { useGalleryPhotosInfiniteQuery } from '../use-gallery-photos'
import type { IGalleryFilterState } from '../../../types/gallery-filters.types'

function makeFilters(overrides: Partial<IGalleryFilterState> = {}): IGalleryFilterState {
  return {
    eventId: 'e1',
    bib: null,
    photoCategoryId: null,
    uncategorized: false,
    sale: null,
    plateNumber: '',
    bibMatch: 'exact',
    sort: 'recent',
    ...overrides,
  }
}

function makeResponse(page: number, totalPages: number) {
  return {
    data: [],
    meta: { pagination: { page, limit: 30, total: totalPages * 30, totalPages } },
  }
}

function mountQuery(filtersRef: Ref<IGalleryFilterState>) {
  const Host = defineComponent({
    setup() {
      return useGalleryPhotosInfiniteQuery(filtersRef, 30)
    },
    render: () => null,
  })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = mount(Host, { global: { plugins: [[VueQueryPlugin, { queryClient }]] } })
  return wrapper
}

describe('useGalleryPhotosInfiniteQuery', () => {
  beforeEach(() => {
    get.mockReset()
    get.mockResolvedValue(makeResponse(1, 1))
  })

  it('sends every active filter to the request', async () => {
    const filtersRef = ref(
      makeFilters({
        bib: 'doubtful',
        photoCategoryId: 3,
        sale: 'sold',
        plateNumber: '142',
        bibMatch: 'contains',
        sort: 'bib_asc',
      }),
    )
    mountQuery(filtersRef)
    await flushPromises()

    expect(get).toHaveBeenCalledWith('/events/e1/photos', {
      params: {
        page: 1,
        limit: 30,
        sort: 'bib_asc',
        bib: 'doubtful',
        photoCategoryId: 3,
        sale: 'sold',
        plateNumber: '142',
        bibMatch: 'contains',
      },
    })
  })

  it('omits inactive filters entirely rather than sending null or false', async () => {
    const filtersRef = ref(makeFilters())
    mountQuery(filtersRef)
    await flushPromises()

    const [, options] = get.mock.calls[0] as [string, { params: Record<string, unknown> }]
    expect(options.params).toEqual({ page: 1, limit: 30, sort: 'recent' })
    expect(Object.keys(options.params)).not.toContain('bib')
    expect(Object.keys(options.params)).not.toContain('photoCategoryId')
    expect(Object.keys(options.params)).not.toContain('uncategorized')
    expect(Object.keys(options.params)).not.toContain('sale')
    expect(Object.keys(options.params)).not.toContain('plateNumber')
    expect(Object.keys(options.params)).not.toContain('bibMatch')
  })

  it('prefers uncategorized over photoCategoryId when both are set', async () => {
    const filtersRef = ref(makeFilters({ uncategorized: true, photoCategoryId: 3 }))
    mountQuery(filtersRef)
    await flushPromises()

    const [, options] = get.mock.calls[0] as [string, { params: Record<string, unknown> }]
    expect(options.params.uncategorized).toBe(true)
    expect(options.params).not.toHaveProperty('photoCategoryId')
  })

  it('offers a next page while the current page is before the last', async () => {
    get.mockResolvedValueOnce(makeResponse(1, 2))
    const filtersRef = ref(makeFilters())
    const wrapper = mountQuery(filtersRef)
    await flushPromises()

    expect(wrapper.vm.hasNextPage).toBe(true)
  })

  it('has no next page once the last page has been reached', async () => {
    get.mockResolvedValueOnce(makeResponse(2, 2))
    const filtersRef = ref(makeFilters())
    const wrapper = mountQuery(filtersRef)
    await flushPromises()

    expect(wrapper.vm.hasNextPage).toBe(false)
  })

  it('stays disabled and never requests when the eventId is empty', async () => {
    const filtersRef = ref(makeFilters({ eventId: '' }))
    mountQuery(filtersRef)
    await flushPromises()

    expect(get).not.toHaveBeenCalled()
  })
})
