import { defineComponent, ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const get = vi.fn()

vi.mock('@/core/http/axios-client', () => ({
  httpClient: { get: (...args: unknown[]) => get(...args) },
}))

import { useGalleryFacetsQuery } from '../use-gallery-facets'

function mountQuery(eventId: string) {
  const eventIdRef = ref(eventId)
  const Host = defineComponent({
    setup() {
      return useGalleryFacetsQuery(eventIdRef)
    },
    render: () => null,
  })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = mount(Host, { global: { plugins: [[VueQueryPlugin, { queryClient }]] } })
  return wrapper
}

describe('useGalleryFacetsQuery', () => {
  beforeEach(() => {
    get.mockReset()
    get.mockResolvedValue({
      data: {
        total: 100,
        withoutBib: 10,
        withBib: 90,
        doubtfulBib: 5,
        correctedBib: 2,
        uncategorized: 3,
        sold: 20,
        unsold: 80,
        categories: [],
      },
    })
  })

  it('requests the facets route for the given event id', async () => {
    mountQuery('event-1')
    await flushPromises()

    expect(get).toHaveBeenCalledWith('/events/event-1/photos/facets')
  })

  it('stays disabled and never requests when the eventId is empty', async () => {
    mountQuery('')
    await flushPromises()

    expect(get).not.toHaveBeenCalled()
  })
})
