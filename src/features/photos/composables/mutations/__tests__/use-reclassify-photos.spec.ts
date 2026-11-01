import { defineComponent } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const post = vi.fn()

vi.mock('@/core/http/axios-client', () => ({
  httpClient: { post: (...args: unknown[]) => post(...args) },
}))

import { useReclassifyPhotos } from '../use-reclassify-photos'

function mountMutation() {
  let api: ReturnType<typeof useReclassifyPhotos> | undefined
  const Host = defineComponent({
    setup() {
      api = useReclassifyPhotos()
      return {}
    },
    render: () => null,
  })
  const queryClient = new QueryClient()
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
  mount(Host, { global: { plugins: [[VueQueryPlugin, { queryClient }]] } })
  return { api: api!, invalidate }
}

describe('useReclassifyPhotos', () => {
  beforeEach(() => {
    post.mockReset()
    post.mockResolvedValue({ data: { enqueued: 1, ignored: 0 }, meta: {} })
  })

  it('posts photoIds and invalidates /photos', async () => {
    const { api, invalidate } = mountMutation()

    api.mutate({ eventId: 'e1', photoIds: ['p1'] })
    await flushPromises()

    expect(post).toHaveBeenCalledWith('/events/e1/photos/reclassify', { photoIds: ['p1'] })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['/photos'] })
  })

  it('posts an empty body to retry every failed photo', async () => {
    const { api } = mountMutation()

    api.mutate({ eventId: 'e1' })
    await flushPromises()

    expect(post).toHaveBeenCalledWith('/events/e1/photos/reclassify', {})
  })
})
