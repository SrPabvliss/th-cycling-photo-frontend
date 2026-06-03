import { computed, watch, type Ref } from 'vue'

import { calculateAge, daysInMonth, isValidCalendarDate } from '@/shared/utils/date.utils'
import { MAX_AGE_YEARS, MIN_AGE_YEARS } from '../constants/register-form.options'

interface BirthDateFieldsParams {
  year: Ref<number | null>
  month: Ref<number | null>
  day: Ref<number | null>
  onInvalidDay: () => void
}

export function useBirthDateFields({ year, month, day, onInvalidDay }: BirthDateFieldsParams) {
  const currentYear = new Date().getFullYear()
  const maxYear = currentYear - MIN_AGE_YEARS
  const minYear = currentYear - MAX_AGE_YEARS

  const yearOptions = computed(() =>
    Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
      const y = maxYear - i
      return { label: String(y), value: y }
    }),
  )

  const dayOptions = computed(() => {
    const max = daysInMonth(year.value, month.value)
    return Array.from({ length: max }, (_, i) => ({ label: String(i + 1), value: i + 1 }))
  })

  watch([year, month], ([y, m]) => {
    if (day.value == null) return
    if (day.value > daysInMonth(y, m)) onInvalidDay()
  })

  function validate(): string | undefined {
    if (day.value == null || month.value == null || year.value == null) {
      return 'Completa tu fecha de nacimiento'
    }
    if (!isValidCalendarDate(year.value, month.value, day.value)) {
      return 'Fecha inválida'
    }
    if (calculateAge(year.value, month.value, day.value) < MIN_AGE_YEARS) {
      return `Debes tener al menos ${MIN_AGE_YEARS} años`
    }
    return undefined
  }

  return { yearOptions, dayOptions, validate }
}
