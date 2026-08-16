export const ADULT_AGE = 18

export function calculateAge(
  year: number,
  month: number,
  day: number,
  today: Date = new Date(),
): number {
  const birthDate = new Date(year, month - 1, day)
  let age = today.getFullYear() - birthDate.getFullYear()

  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1
  }

  return age
}

export function isMinor(
  year: number | null,
  month: number | null,
  day: number | null,
  today: Date = new Date(),
): boolean {
  if (year == null || month == null || day == null) return false

  return calculateAge(year, month, day, today) < ADULT_AGE
}
