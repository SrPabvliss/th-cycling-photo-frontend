import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import { useEventListFilters } from './use-event-list-filters'

const Stub = { render: () => null }

async function setup(path = '/gallery') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Stub },
      { path: '/gallery', component: Stub },
      { path: '/gallery/:slug', component: Stub },
    ],
  })
  await router.push('/')
  await router.push(path)
  const replace = vi.spyOn(router, 'replace')
  const push = vi.spyOn(router, 'push')

  let state!: ReturnType<typeof useEventListFilters>
  const Host = defineComponent({
    setup() {
      state = useEventListFilters()
      return () => h('div')
    },
  })
  mount(Host, { global: { plugins: [router] } })

  return { state, router, replace, push }
}

/** Lets the debounce run out and the router settle. */
async function settle(ms = 250) {
  await vi.advanceTimersByTimeAsync(ms)
  await flushPromises()
}

describe('useEventListFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts with no filters on a clean url', async () => {
    const { state } = await setup()

    expect(state.searchText.value).toBe('')
    expect(state.chip.value).toBe('all')
    expect(state.filters.value).toEqual({})
  })

  it('takes its state from a url that already carries filters', async () => {
    const { state } = await setup('/gallery?q=mama&tipo=3')

    expect(state.searchText.value).toBe('mama')
    expect(state.chip.value).toBe(3)
    expect(state.filters.value).toEqual({ search: 'mama', eventTypeId: 3 })
  })

  it('reads "with photos" from the url', async () => {
    const { state } = await setup('/gallery?fotos=1')

    expect(state.chip.value).toBe('photos')
    expect(state.filters.value).toEqual({ hasPhotos: true })
  })

  it.each(['/gallery?tipo=abc', '/gallery?tipo=0', '/gallery?tipo=1.5', '/gallery?fotos=si'])(
    'ignores a filter it cannot read (%s)',
    async (path) => {
      const { state } = await setup(path)

      expect(state.chip.value).toBe('all')
      expect(state.filters.value).toEqual({})
    },
  )

  it('shows the text at once and searches once the typing stops', async () => {
    const { state, router } = await setup()
    // Every distinct value the search filter takes, in order.
    const seen: (string | undefined)[] = []
    let last: unknown = Symbol('nothing recorded yet')
    const record = () => {
      const search = state.filters.value.search
      if (search === last) return
      seen.push(search)
      last = search
    }

    for (const text of ['ma', 'mam', 'mama']) {
      state.searchText.value = text
      await vi.advanceTimersByTimeAsync(100)
      record()
    }
    expect(state.searchText.value).toBe('mama')
    expect(seen).toEqual([undefined])

    await settle()
    record()

    expect(seen).toEqual([undefined, 'mama'])
    expect(router.currentRoute.value.query).toEqual({ q: 'mama' })
  })

  it('does not search, nor write the url, for a single character', async () => {
    const { state, router } = await setup()

    state.searchText.value = 'm'
    await settle()

    expect(state.filters.value.search).toBeUndefined()
    expect(router.currentRoute.value.query).toEqual({})
  })

  it('goes back to the whole list when the text is erased down to one character', async () => {
    const { state, router } = await setup('/gallery?q=mama')

    state.searchText.value = 'm'
    await settle()

    expect(state.filters.value).toEqual({})
    expect(router.currentRoute.value.query).toEqual({})
  })

  it('trims the text it searches for', async () => {
    const { state, router } = await setup()

    state.searchText.value = '  baños '
    await settle()

    expect(state.filters.value.search).toBe('baños')
    expect(router.currentRoute.value.query).toEqual({ q: 'baños' })
  })

  it('applies a chip at once: "with photos" replaces the event type', async () => {
    const { state, router } = await setup('/gallery?tipo=3')

    state.chip.value = 'photos'
    await flushPromises()

    expect(state.filters.value).toEqual({ hasPhotos: true })
    expect(router.currentRoute.value.query).toEqual({ fotos: '1' })
  })

  it('writes the event type in the url', async () => {
    const { state, router } = await setup()

    state.chip.value = 7
    await flushPromises()

    expect(state.filters.value).toEqual({ eventTypeId: 7 })
    expect(router.currentRoute.value.query).toEqual({ tipo: '7' })
  })

  it('keeps the search when the chip changes', async () => {
    const { state, router } = await setup('/gallery?q=mama')

    state.chip.value = 'photos'
    await flushPromises()

    expect(state.filters.value).toEqual({ search: 'mama', hasPhotos: true })
    expect(router.currentRoute.value.query).toEqual({ q: 'mama', fotos: '1' })
  })

  it('clears everything on reset, without waiting', async () => {
    const { state, router } = await setup('/gallery?q=mama&tipo=3')

    state.reset()
    await flushPromises()

    expect(state.searchText.value).toBe('')
    expect(state.chip.value).toBe('all')
    expect(state.filters.value).toEqual({})
    expect(router.currentRoute.value.query).toEqual({})
  })

  it('replaces the url instead of adding history entries', async () => {
    const { state, replace, push } = await setup()

    state.searchText.value = 'mama'
    await settle()
    state.chip.value = 'photos'
    await flushPromises()

    expect(replace).toHaveBeenCalledTimes(2)
    expect(push).not.toHaveBeenCalled()
  })

  it('leaves other query parameters alone', async () => {
    const { state, router } = await setup('/gallery?utm=ig')

    state.chip.value = 'photos'
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({ utm: 'ig', fotos: '1' })
  })

  it('follows the url when the person goes back to an earlier search', async () => {
    const { state, router } = await setup('/gallery?q=mama')

    await router.push('/gallery?q=canar&tipo=2')
    await flushPromises()

    expect(state.searchText.value).toBe('canar')
    expect(state.chip.value).toBe(2)
    expect(state.filters.value).toEqual({ search: 'canar', eventTypeId: 2 })
  })

  it('drops a search still waiting when the screen is left', async () => {
    const { state, router, replace } = await setup()

    state.searchText.value = 'mama'
    await router.push('/gallery/mama-rumi')
    await settle()

    expect(replace).not.toHaveBeenCalled()
    expect(router.currentRoute.value.fullPath).toBe('/gallery/mama-rumi')
  })
})
