import { computed, type Ref } from 'vue'
import type { AnyFieldApi } from '@tanstack/vue-form'

import { useCountriesQuery } from '@/features/locations/composables/queries/use-countries'
import { useProvincesByCountryQuery } from '@/features/locations/composables/queries/use-provinces-by-country'
import { useCantonsQuery } from '@/features/locations/composables/queries/use-cantons'
import { resetLocationBelow } from '../utils/location-cascade.utils'
import type { IProfileFormInstance } from './use-profile-form'

export function useLocationCascade(form: IProfileFormInstance) {
  const { data: countries } = useCountriesQuery()

  const countryOptions = computed(
    () => countries.value?.map((c) => ({ label: c.name, value: c.id })) ?? [],
  )

  const selectedCountryId = form.useStore((s) => s.values.countryId)
  const selectedProvinceId = form.useStore((s) => s.values.provinceId)

  const { data: provinces, isFetching: isLoadingProvinces } = useProvincesByCountryQuery(
    selectedCountryId as Ref<number | null>,
  )
  const { data: cantons, isFetching: isLoadingCantons } = useCantonsQuery(
    selectedProvinceId as Ref<number | null>,
  )

  const provinceOptions = computed(
    () => provinces.value?.map((p) => ({ label: p.name, value: p.id })) ?? [],
  )
  const cantonOptions = computed(
    () => cantons.value?.map((c) => ({ label: c.name, value: c.id })) ?? [],
  )

  const hasRegions = computed(() => provinceOptions.value.length > 0)

  function onCountryChange(field: AnyFieldApi, val: number | null) {
    field.handleChange(val)
    const cleared = resetLocationBelow('country', form.state.values)
    form.setFieldValue('provinceId', cleared.provinceId)
    form.setFieldValue('cantonId', cleared.cantonId)
  }

  function onProvinceChange(field: AnyFieldApi, val: number | null) {
    field.handleChange(val)
    const cleared = resetLocationBelow('province', form.state.values)
    form.setFieldValue('cantonId', cleared.cantonId)
  }

  return {
    countryOptions,
    provinceOptions,
    cantonOptions,
    isLoadingProvinces,
    isLoadingCantons,
    hasRegions,
    selectedProvinceId,
    onCountryChange,
    onProvinceChange,
  }
}
