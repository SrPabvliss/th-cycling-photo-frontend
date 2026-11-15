import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { defineComponent, ref } from 'vue'

import { SessionExpiredError } from '@/core/http/session-expired'
import { usePreviewGallery } from './use-preview-gallery'

const get = vi.fn()
vi.mock('@/core/http/axios-client', () => ({
  httpClient: { get: (...args: unknown[]) => get(...args) },
}))

const API_PREVIEW = {
  token: 'tok',
  eventId: 'e1',
  eventTypeId: 1,
  organizerName: 'Titan Racing',
  eventName: 'Mama Rumi 2026',
  startDate: '2026-10-04',
  endDate: '2026-10-05',
  status: 'active',
  expiresAt: '2026-12-01T00:00:00.000Z',
  photos: [
    { id: 'a', url: 'u/a', alreadyPurchased: true },
    { id: 'b', url: 'u/b' },
  ],
}

function setup() {
  let query!: ReturnType<typeof usePreviewGallery>
  mount(
    defineComponent({
      setup() {
        query = usePreviewGallery(ref('tok'))
        return () => null
      },
    }),
    { global: { plugins: [[VueQueryPlugin, { queryClient: new QueryClient() }]] } },
  )
  return () => query
}

describe('usePreviewGallery', () => {
  it('reads which photos the buyer already bought', async () => {
    get.mockReset().mockResolvedValue({ data: API_PREVIEW })
    const query = setup()
    await flushPromises()

    expect(query().data.value?.photos.map((photo) => photo.alreadyPurchased)).toEqual([true, false])
  })

  // The link is public: an old session that could not be renewed must not leave it in error.
  it('reads it again without the session when that session could not be renewed', async () => {
    get
      .mockReset()
      .mockRejectedValueOnce(new SessionExpiredError())
      .mockResolvedValueOnce({ data: API_PREVIEW })
    const query = setup()
    await flushPromises()

    expect(get).toHaveBeenCalledTimes(2)
    expect(query().status.value).toBe('success')
  })
})
