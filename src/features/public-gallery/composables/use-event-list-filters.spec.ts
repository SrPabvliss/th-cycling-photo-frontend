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
  await flushPromises()

  return { state, router, replace, push }
}

/** Lets the debounce run out and the router settle. */
async function settle(ms = 250) {
  await vi.advanceTimersByTimeAsync(ms)
  await flushPromises()
}

const none = { eventTypeIds: [], provinceIds: [] }

describe('useEventListFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts with no filters on a clean url', async () => {
    const { state, replace } = await setup()

    expect(state.searchText.value).toBe('')
    expect(state.eventTypeIds.value).toEqual([])
    expect(state.months.value).toBeNull()
    expect(state.filters.value).toEqual(none)
    expect(state.hasChoices.value).toBe(false)
    expect(replace).not.toHaveBeenCalled()
  })

  it('takes its whole state from a shared link, before anything is asked', async () => {
    const { state, replace } = await setup(
      '/gallery?q=mama&tipo=2,1&prov=7,3&desde=2026-06&hasta=2026-08',
    )

    expect(state.searchText.value).toBe('mama')
    expect(state.eventTypeIds.value).toEqual([2, 1])
    expect(state.provinceIds.value).toEqual([7, 3])
    expect(state.months.value).toEqual({ from: '2026-06', to: '2026-08' })
    expect(state.filters.value).toEqual({
      search: 'mama',
      eventTypeIds: [1, 2],
      provinceIds: [3, 7],
      from: '2026-06',
      to: '2026-08',
    })
    expect(state.hasChoices.value).toBe(true)
    expect(replace).not.toHaveBeenCalled()
  })

  it('still reads an old link with one discipline', async () => {
    const { state } = await setup('/gallery?tipo=4')

    expect(state.filters.value).toEqual({ eventTypeIds: [4], provinceIds: [] })
  })

  it('ignores "with photos" from an old link and takes it out of the url', async () => {
    const { state, router } = await setup('/gallery?fotos=1&tipo=4&utm=ig')

    expect(state.filters.value).toEqual({ eventTypeIds: [4], provinceIds: [] })
    expect(router.currentRoute.value.query).toEqual({ tipo: '4', utm: 'ig' })
  })

  it.each([
    ['/gallery?tipo=abc', {}],
    ['/gallery?tipo=0,-2,1.5,,3', { tipo: '3' }],
    ['/gallery?prov=3,3,x', { prov: '3' }],
    ['/gallery?desde=2026-13', {}],
    ['/gallery?desde=2026-08&hasta=2026-06', {}],
  ])('drops what it cannot read from %s, without a word', async (path, cleaned) => {
    const { router } = await setup(path)

    expect(router.currentRoute.value.query).toEqual(cleaned)
  })

  it('takes one month as both ends', async () => {
    const { state, router } = await setup('/gallery?desde=2026-08')

    expect(state.months.value).toEqual({ from: '2026-08', to: '2026-08' })
    expect(router.currentRoute.value.query).toEqual({ desde: '2026-08', hasta: '2026-08' })
  })

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

  it('trims the text it searches for', async () => {
    const { state, router } = await setup()

    state.searchText.value = '  baños '
    await settle()

    expect(state.filters.value.search).toBe('baños')
    expect(router.currentRoute.value.query).toEqual({ q: 'baños' })
  })

  it('applies a choice at once and writes it in the order it was made', async () => {
    const { state, router } = await setup('/gallery?q=mama')

    state.provinceIds.value = [7]
    state.provinceIds.value = [7, 3]
    state.months.value = { from: '2026-06', to: '2026-08' }
    await flushPromises()

    expect(state.filters.value).toEqual({
      search: 'mama',
      eventTypeIds: [],
      provinceIds: [3, 7],
      from: '2026-06',
      to: '2026-08',
    })
    expect(router.currentRoute.value.query).toEqual({
      q: 'mama',
      prov: '7,3',
      desde: '2026-06',
      hasta: '2026-08',
    })
  })

  it('clears the three menus and keeps the search', async () => {
    const { state, router } = await setup(
      '/gallery?q=mama&tipo=3&prov=7&desde=2026-08&hasta=2026-08',
    )

    state.clearChoices()
    await flushPromises()

    expect(state.searchText.value).toBe('mama')
    expect(state.filters.value).toEqual({ ...none, search: 'mama' })
    expect(router.currentRoute.value.query).toEqual({ q: 'mama' })
  })

  it('clears everything on reset, without waiting', async () => {
    const { state, router } = await setup('/gallery?q=mama&tipo=3&prov=7')

    state.reset()
    await flushPromises()

    expect(state.searchText.value).toBe('')
    expect(state.filters.value).toEqual(none)
    expect(router.currentRoute.value.query).toEqual({})
  })

  it('forgets ids the api does not offer', async () => {
    const { state, router } = await setup('/gallery?tipo=3,99&prov=7,98')

    state.keepOnly([3, 5], [7])
    await flushPromises()

    expect(state.filters.value).toEqual({ eventTypeIds: [3], provinceIds: [7] })
    expect(router.currentRoute.value.query).toEqual({ tipo: '3', prov: '7' })
  })

  it('replaces the url instead of adding history entries', async () => {
    const { state, replace, push } = await setup()

    state.searchText.value = 'mama'
    await settle()
    state.eventTypeIds.value = [3]
    await flushPromises()

    expect(replace).toHaveBeenCalledTimes(2)
    expect(push).not.toHaveBeenCalled()
  })

  it('leaves other query parameters alone', async () => {
    const { state, router } = await setup('/gallery?utm=ig')

    state.eventTypeIds.value = [3]
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({ utm: 'ig', tipo: '3' })
  })

  it('follows the url when the person goes back to an earlier choice', async () => {
    const { state, router } = await setup('/gallery?q=mama')

    await router.push('/gallery?q=canar&tipo=2&prov=5&desde=2026-01&hasta=2026-03')
    await flushPromises()

    expect(state.searchText.value).toBe('canar')
    expect(state.eventTypeIds.value).toEqual([2])
    expect(state.provinceIds.value).toEqual([5])
    expect(state.months.value).toEqual({ from: '2026-01', to: '2026-03' })
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
