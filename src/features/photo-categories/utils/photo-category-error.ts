import { isAxiosError } from 'axios'

const FALLBACK = 'No pudimos guardar la categoría. Inténtalo de nuevo.'

/**
 * Message for a failed create/assign call. Those requests are silent, so the
 * backend's translated message (409 duplicate name, 403 tenant required,
 * 422 category of another organizer) is the feedback the user gets.
 */
export function photoCategoryErrorMessage(caught: unknown): string {
  if (!isAxiosError(caught)) return FALLBACK
  return caught.response?.data?.error?.message ?? FALLBACK
}
