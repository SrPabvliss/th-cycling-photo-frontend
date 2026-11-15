import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, reactive, ref } from 'vue'

import { useLocationOptions } from './use-location-options'

type Status = 'pending' | 'error' | 'success'
const make = () =>
  reactive({ status: 'success' as Status, data: [] as unknown[] | undefined, isFetching: false })
const countries = make()
const provinces = make()
const cantons = make()
const refetch = { countries: vi.fn(), provinces: vi.fn(), cantons: vi.fn() }
const askedWith = vi.fn()

const fake = (state: ReturnType<typeof make>, again: () => void) => ({
  status: computed(() => state.status),
  data: computed(() => state.data),
  isFetching: computed(() => state.isFetching),
  refetch: again,
})

vi.mock('./queries/use-countries', () => ({
  useCountriesQuery: (options: unknown) => (askedWith(options), fake(countries, refetch.countries)),
}))
vi.mock('./queries/use-provinces-by-country', () => ({
  useProvincesByCountryQuery: (_id: unknown, options: unknown) => (
    askedWith(options),
    fake(provinces, refetch.provinces)
  ),
}))
vi.mock('./queries/use-cantons', () => ({
  useCantonsQuery: (_id: unknown, options: unknown) => (
    askedWith(options),
    fake(cantons, refetch.cantons)
  ),
}))

describe('useLocationOptions', () => {
  beforeEach(() => {
    for (const state of [countries, provinces, cantons])
      Object.assign(state, { status: 'success', data: [], isFetching: false })
    for (const mock of Object.values(refetch)) mock.mockReset()
    askedWith.mockReset()
  })

  it('reads the places without a toast: the form says it once, under the group', () => {
    useLocationOptions(ref(null), ref(null))

    expect(askedWith).toHaveBeenCalledTimes(3)
    for (const call of askedWith.mock.calls) expect(call[0]).toEqual({ silent: true })
  })

  it('has a problem when any list failed and has nothing to show', () => {
    const options = useLocationOptions(ref(50), ref(null))
    expect(options.hasProblem.value).toBe(false)

    Object.assign(provinces, { status: 'error', data: undefined })
    expect(options.hasProblem.value).toBe(true)

    Object.assign(provinces, { status: 'error', data: [] })
    expect(options.hasProblem.value).toBe(false)
  })

  it('asks again only for the lists that failed', async () => {
    Object.assign(countries, { status: 'error', data: undefined })
    const options = useLocationOptions(ref(null), ref(null))

    await options.retry()

    expect(refetch.countries).toHaveBeenCalledTimes(1)
    expect(refetch.provinces).not.toHaveBeenCalled()
    expect(refetch.cantons).not.toHaveBeenCalled()
  })
})
