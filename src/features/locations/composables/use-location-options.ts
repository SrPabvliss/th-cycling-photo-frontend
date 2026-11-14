import { computed, type Ref } from 'vue'

import { useCantonsQuery } from './queries/use-cantons'
import { useCountriesQuery } from './queries/use-countries'
import { useProvincesByCountryQuery } from './queries/use-provinces-by-country'

/**
 * The country, province and city lists of a client form. They are read without a toast: when
 * one fails with nothing to show, the form says it once under the group and offers to retry,
 * and the selects keep their size.
 */
export function useLocationOptions(countryId: Ref<number | null>, provinceId: Ref<number | null>) {
  const countries = useCountriesQuery({ silent: true })
  const provinces = useProvincesByCountryQuery(countryId, { silent: true })
  const cantons = useCantonsQuery(provinceId, { silent: true })
  const lists = [countries, provinces, cantons]

  const failed = computed(() =>
    lists.filter((list) => list.status.value === 'error' && list.data.value === undefined),
  )

  return {
    countries: countries.data,
    provinces: provinces.data,
    cantons: cantons.data,
    hasProblem: computed(() => failed.value.length > 0),
    isRetrying: computed(() => lists.some((list) => list.isFetching.value)),
    retry: () => Promise.all(failed.value.map((list) => list.refetch())),
  }
}
