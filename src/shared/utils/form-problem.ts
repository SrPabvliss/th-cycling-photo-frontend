import { isAxiosError } from 'axios'

import { problemKind } from '@/core/http/problem-kind'

// What an access form says when the server did not do what was asked, beyond a field.
export interface IFormProblem {
  title: string
  text?: string
  /**
   * 'warn' when it could not be sent (no network, the server failed, too many tries); 'bad' when
   * the server refused it. Without a tone it reads as a refusal.
   */
  tone?: 'bad' | 'warn'
}

export const OFFLINE_PROBLEM: IFormProblem = {
  title: 'Sin conexión a internet',
  tone: 'warn',
}

export const NETWORK_PROBLEM: IFormProblem = {
  title: 'No se pudo completar',
  text: 'Parece un problema de conexión. Nada se perdió: intenta de nuevo.',
  tone: 'warn',
}

export const UNKNOWN_PROBLEM: IFormProblem = {
  title: 'No se pudo completar',
  text: 'Intenta de nuevo en un momento.',
  tone: 'bad',
}

export const TOO_MANY_PROBLEM: IFormProblem = {
  title: 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.',
  tone: 'warn',
}

/** Status of a failed request; 0 when there was no answer (network) or it was not a request. */
export function failedStatus(error: unknown): number {
  return isAxiosError(error) ? (error.response?.status ?? 0) : -1
}

/** The general problem of a failure: no network, no answer or a server failure, too many tries, the rest. */
export function generalProblem(error: unknown): IFormProblem {
  if (problemKind(error) === 'offline') return OFFLINE_PROBLEM
  const status = failedStatus(error)
  if (status === 0 || status >= 500) return NETWORK_PROBLEM
  if (status === 429) return TOO_MANY_PROBLEM
  return UNKNOWN_PROBLEM
}
