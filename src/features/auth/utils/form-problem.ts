import { isAxiosError } from 'axios'

// What an access form says when the server did not do what was asked, beyond a field.
export interface IFormProblem {
  title: string
  text: string
}

export const NETWORK_PROBLEM: IFormProblem = {
  title: 'No se pudo completar',
  text: 'Parece un problema de conexión. Nada se perdió: intenta de nuevo.',
}

export const UNKNOWN_PROBLEM: IFormProblem = {
  title: 'No se pudo completar',
  text: 'Intenta de nuevo en un momento.',
}

export const TOO_MANY_PROBLEM: IFormProblem = {
  title: 'Demasiados intentos',
  text: 'Espera unos minutos y vuelve a intentarlo.',
}

/** Status of a failed request; 0 when there was no answer (network) or it was not a request. */
export function failedStatus(error: unknown): number {
  return isAxiosError(error) ? (error.response?.status ?? 0) : -1
}

/** The general problem of a failure: no answer or a server failure, too many tries, the rest. */
export function generalProblem(error: unknown): IFormProblem {
  const status = failedStatus(error)
  if (status === 0 || status >= 500) return NETWORK_PROBLEM
  if (status === 429) return TOO_MANY_PROBLEM
  return UNKNOWN_PROBLEM
}
