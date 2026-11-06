import { AxiosError, type AxiosResponse } from 'axios'
import { describe, expect, it } from 'vitest'

import { PREVIEW_ORDER_FALLBACK_MESSAGE, toPreviewOrderFailure } from './preview-order-error'

function httpError(status: number, error?: { messageKey?: string; message?: string }) {
  const response = { status, data: error ? { error } : {} } as AxiosResponse
  return new AxiosError('failed', String(status), undefined, undefined, response)
}

describe('toPreviewOrderFailure', () => {
  it('sends the buyer to the already-ordered screen when the preview was converted', () => {
    const failure = toPreviewOrderFailure(
      httpError(422, { messageKey: 'order.already_submitted', message: 'Ya enviaste' }),
    )
    expect(failure).toEqual({ kind: 'already_ordered', message: null, fix: null })
  })

  it('sends the buyer to the expired screen', () => {
    expect(
      toPreviewOrderFailure(httpError(422, { messageKey: 'order.preview_expired' })).kind,
    ).toBe('expired')
  })

  it('shows the translated backend message for other business rules', () => {
    const failure = toPreviewOrderFailure(
      httpError(422, {
        messageKey: 'order.photos_not_in_preview',
        message: 'Algunas fotos no están en este enlace',
      }),
    )
    expect(failure).toEqual({
      kind: 'message',
      message: 'Algunas fotos no están en este enlace',
      fix: null,
    })
  })

  it.each([
    ['order.customer_profile_required', 'complete_profile'],
    ['billing.account_not_found', 'pick_billing'],
    ['billing.invoice_consent_required', 'accept_consent'],
    ['payment.card_unavailable', 'transfer_only'],
  ])('pairs %s with the fix the buyer can apply (%s)', (messageKey, fix) => {
    const failure = toPreviewOrderFailure(httpError(422, { messageKey, message: 'Texto del back' }))
    expect(failure).toEqual({ kind: 'message', message: 'Texto del back', fix })
  })

  it('shows a generic message on a server error', () => {
    expect(toPreviewOrderFailure(httpError(500, { message: 'Internal' }))).toEqual({
      kind: 'message',
      message: PREVIEW_ORDER_FALLBACK_MESSAGE,
      fix: null,
    })
  })

  it('shows a generic message when the request never got a response', () => {
    expect(toPreviewOrderFailure(new AxiosError('Network Error')).message).toBe(
      PREVIEW_ORDER_FALLBACK_MESSAGE,
    )
  })
})
