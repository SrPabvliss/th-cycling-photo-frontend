import { computed, defineComponent, ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const get = vi.fn()

vi.mock('@/core/http/axios-client', () => ({
  httpClient: { get: (...args: unknown[]) => get(...args) },
}))

import { usePhotoSelection } from '../use-photo-selection'
import type { IGalleryFilterState } from '../../types/gallery-filters.types'
import type { IPhotoListItem } from '../../types/responses/photo-list.response'

function makeFilters(overrides: Partial<IGalleryFilterState> = {}): IGalleryFilterState {
  return {
    eventId: 'event-1',
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

function apiPhoto(id: string) {
  return {
    id,
    publicSlug: id,
    filename: `${id}.jpg`,
    thumbnailUrl: `https://cdn.test/${id}.jpg`,
    status: 'reviewed',
    uploadedAt: '2026-08-20T00:00:00.000Z',
    reviewedAt: null,
    bibs: [],
    photoCategoryId: null,
    photoCategoryName: null,
    sold: false,
  }
}

function mountHost(filtersValue: IGalleryFilterState, total: number) {
  const filtersRef = ref(filtersValue)
  const items = computed<IPhotoListItem[] | undefined>(() => [])
  const totalResults = computed(() => total)
  const Host = defineComponent({
    setup() {
      return usePhotoSelection(items, totalResults, filtersRef)
    },
    render: () => null,
  })
  return mount(Host)
}

describe('usePhotoSelection.selectAllMatchingResults', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    get.mockReset()
  })

  it('requests only the gallery-by-event endpoint, never /photos/search', async () => {
    get.mockResolvedValue({ data: [apiPhoto('p1')] })
    const wrapper = mountHost(makeFilters({ plateNumber: '142', bibMatch: 'contains' }), 1)

    await wrapper.vm.selectAllMatchingResults()
    await flushPromises()

    expect(get).toHaveBeenCalledTimes(1)
    const [url] = get.mock.calls[0] as [string, unknown]
    expect(url).toBe('/events/event-1/photos')
    expect(get.mock.calls.every(([calledUrl]) => calledUrl === '/events/event-1/photos')).toBe(
      true,
    )
  })

  it('sends the active filter fields as request params', async () => {
    get.mockResolvedValue({ data: [] })
    const wrapper = mountHost(
      makeFilters({ bib: 'doubtful', photoCategoryId: 3, sale: 'sold', sort: 'bib_asc' }),
      1,
    )

    await wrapper.vm.selectAllMatchingResults()
    await flushPromises()

    const [, options] = get.mock.calls[0] as [string, { params: Record<string, unknown> }]
    expect(options.params).toEqual({
      page: 1,
      limit: 100,
      sort: 'bib_asc',
      bib: 'doubtful',
      photoCategoryId: 3,
      sale: 'sold',
    })
  })

  it('waits for page 1 to resolve before requesting page 2, instead of firing every page at once', async () => {
    let resolvePage1: (() => void) | undefined
    const page1Gate = new Promise<void>((resolve) => {
      resolvePage1 = resolve
    })

    get.mockImplementation(async (_url: string, options: { params: { page: number } }) => {
      if (options.params.page === 1) await page1Gate
      return { data: [apiPhoto(`p${options.params.page}`)] }
    })

    const wrapper = mountHost(makeFilters(), 250)
    const runningCall = wrapper.vm.selectAllMatchingResults()
    await Promise.resolve()
    await Promise.resolve()

    expect(get).toHaveBeenCalledTimes(1)

    resolvePage1?.()
    await runningCall
    await flushPromises()

    expect(get).toHaveBeenCalledTimes(3)
  })
})
