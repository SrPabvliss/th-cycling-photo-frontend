import { flushPromises, mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'

const get = vi.fn()
vi.mock('@/core/http/axios-client', () => ({
  httpClient: { get: (...args: unknown[]) => get(...args) },
}))

import { useOperatorRetouchEventsQuery } from './use-operator-retouch-events'

function runQuery() {
  let result!: ReturnType<typeof useOperatorRetouchEventsQuery>
  const Host = defineComponent({
    setup() {
      result = useOperatorRetouchEventsQuery()
      return () => h('div')
    },
  })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  mount(Host, { global: { plugins: [[VueQueryPlugin, { queryClient }]] } })
  return () => result
}

describe('useOperatorRetouchEventsQuery', () => {
  beforeEach(() => get.mockReset())

  it('loads the retouch events from the operator endpoint, not from /events', async () => {
    get.mockResolvedValue({
      data: [{ id: 'e-1', slug: 'copa-andina', name: 'Copa Andina' }],
      meta: {},
    })
    const query = runQuery()
    await flushPromises()

    expect(get).toHaveBeenCalledWith('/operator/retouch/events')
    expect(query().data.value).toEqual([{ id: 'e-1', slug: 'copa-andina', name: 'Copa Andina' }])
  })
})
