import { describe, expect, it } from 'vitest'
import { AxiosError, type AxiosResponse } from 'axios'

import { checkoutProblem, checkoutProblemText, type CheckoutProblem } from './checkout-error'

function apiError(status: number, messageKey?: string, code = 'BUSINESS_RULE'): AxiosError {
  const response = {
    status,
    data: { error: { code, messageKey, message: 'texto del servidor' } },
    headers: {},
    config: {},
  } as AxiosResponse
  return new AxiosError('failed', 'ERR_BAD_REQUEST', undefined, undefined, response)
}

describe('checkoutProblem', () => {
  it.each<[string, CheckoutProblem]>([
    ['billing.invoice_consent_required', 'consent'],
    ['billing.account_not_found', 'billing'],
    ['billing.invalid_id_number', 'billing'],
    ['order.customer_profile_required', 'profile'],
    ['payment.card_unavailable', 'card-unavailable'],
    ['cart.cart_empty', 'already-ordered'],
    ['cart.event_not_in_cart', 'already-ordered'],
    ['cart.no_active_cart', 'already-ordered'],
    ['order.something_else', 'unknown'],
  ])('reads %s as %s', (key, problem) => {
    expect(checkoutProblem(apiError(422, key))).toBe(problem)
  })

  it('reads a rejected billing field as a billing problem', () => {
    const error = apiError(400, 'errors.VALIDATION_FAILED', 'VALIDATION_FAILED')
    ;(error.response!.data as { error: { fields?: object } }).error.fields = {
      billingAccountId: ['billingAccountId must be a UUID'],
    }

    expect(checkoutProblem(error)).toBe('billing')
  })

  it('reads a request that got no answer as a network problem', () => {
    expect(checkoutProblem(new AxiosError('Network Error', 'ERR_NETWORK'))).toBe('network')
  })

  it('reads a server failure or anything else as unknown', () => {
    expect(checkoutProblem(apiError(500, undefined, 'INTERNAL'))).toBe('unknown')
    expect(checkoutProblem(new Error('boom'))).toBe('unknown')
    expect(checkoutProblem(null)).toBe('unknown')
  })
})

describe('checkoutProblemText', () => {
  it.each<[CheckoutProblem, string, string]>([
    [
      'consent',
      'Falta tu autorización de factura',
      'Marca la casilla para que podamos emitir tu factura electrónica.',
    ],
    [
      'billing',
      'Revisa tus datos de facturación',
      'No pudimos usar esos datos. Elige otros o agrégalos de nuevo.',
    ],
    ['profile', 'Completa tu perfil', 'Necesitamos tu país de residencia para crear el pedido.'],
    [
      'card-unavailable',
      'El pago con tarjeta no está disponible',
      'Puedes pagar este pedido por transferencia.',
    ],
    ['already-ordered', 'Este pedido ya se creó', 'Lo encuentras en Mis fotos.'],
    [
      'network',
      'No se pudo completar',
      'Parece un problema de conexión. Nada se perdió: intenta de nuevo.',
    ],
    ['unknown', 'No se pudo completar', 'Intenta de nuevo en un momento.'],
  ])('words %s for the buyer', (problem, title, text) => {
    expect(checkoutProblemText(problem)).toEqual({ title, text })
  })
})
