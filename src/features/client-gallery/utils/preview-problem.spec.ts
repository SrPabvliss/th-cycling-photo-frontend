import { describe, expect, it } from 'vitest'
import { AxiosError, type AxiosResponse } from 'axios'

import { previewProblem } from './preview-problem'

function apiError(status: number, messageKey?: string) {
  const data = messageKey ? { error: { messageKey } } : {}
  const response = { status, data, headers: {}, config: {} } as AxiosResponse
  return new AxiosError('failed', 'ERR_BAD_REQUEST', undefined, undefined, response)
}

describe('previewProblem', () => {
  it.each([
    [apiError(410, 'preview.link_expired'), 'expired'],
    [apiError(410), 'expired'],
    [apiError(422, 'order.preview_expired'), 'expired'],
    [apiError(404), 'not-found'],
    [apiError(422, 'order.already_submitted'), 'already-ordered'],
    [apiError(422, 'order.preview_not_available'), 'not-available'],
    [apiError(422, 'order.photos_not_in_preview'), 'photos-changed'],
    [apiError(422, 'payment.card_unavailable'), 'card-unavailable'],
    [apiError(422, 'billing.invoice_consent_required'), 'consent'],
    [apiError(422, 'order.customer_profile_required'), 'profile'],
    [new AxiosError('Network Error', 'ERR_NETWORK'), 'network'],
    [new Error('x'), 'unknown'],
  ])('reads %s as %s', (error, problem) => {
    expect(previewProblem(error)).toBe(problem)
  })
})
