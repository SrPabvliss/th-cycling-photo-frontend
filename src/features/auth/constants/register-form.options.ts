import type { Gender } from '../types/requests/register.request'

export const MIN_AGE_YEARS = 4
export const MAX_AGE_YEARS = 100

export const MONTH_OPTIONS: { label: string; value: number }[] = [
  { label: 'Enero', value: 1 },
  { label: 'Febrero', value: 2 },
  { label: 'Marzo', value: 3 },
  { label: 'Abril', value: 4 },
  { label: 'Mayo', value: 5 },
  { label: 'Junio', value: 6 },
  { label: 'Julio', value: 7 },
  { label: 'Agosto', value: 8 },
  { label: 'Septiembre', value: 9 },
  { label: 'Octubre', value: 10 },
  { label: 'Noviembre', value: 11 },
  { label: 'Diciembre', value: 12 },
]

export const GENDER_OPTIONS: { label: string; value: Gender }[] = [
  { label: 'Femenino', value: 'female' },
  { label: 'Masculino', value: 'male' },
  { label: 'Otro', value: 'other' },
  { label: 'Prefiero no decir', value: 'prefer_not_to_say' },
]
