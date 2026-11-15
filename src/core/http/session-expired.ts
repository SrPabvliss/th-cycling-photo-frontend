/**
 * A request that failed because the session ended and could not be renewed (a 401 whose refresh
 * failed too). It is not an answer about the request itself: whoever made it must not take it as
 * done or as refused, only say that the session expired.
 */
export class SessionExpiredError extends Error {
  readonly cause: unknown

  constructor(cause?: unknown) {
    super('session expired')
    this.name = 'SessionExpiredError'
    this.cause = cause
  }
}

export function isSessionExpired(error: unknown): error is SessionExpiredError {
  return error instanceof SessionExpiredError
}
