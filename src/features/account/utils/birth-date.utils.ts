import { parseDateOnly } from '@/shared/utils/date.utils'

export interface IBirthDateFields {
  birthDay: number | null
  birthMonth: number | null
  birthYear: number | null
}

export function decomposeBirthDate(birthDate: string | null): IBirthDateFields {
  if (!birthDate) return { birthDay: null, birthMonth: null, birthYear: null }
  const parsed = parseDateOnly(birthDate)
  return {
    birthYear: parsed.getFullYear(),
    birthMonth: parsed.getMonth() + 1,
    birthDay: parsed.getDate(),
  }
}

export function composeBirthDate(fields: IBirthDateFields): string | null {
  const { birthDay, birthMonth, birthYear } = fields
  if (birthDay == null || birthMonth == null || birthYear == null) return null
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${birthYear}-${pad(birthMonth)}-${pad(birthDay)}`
}
