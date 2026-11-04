import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'

import { identificationMessageOf, readBillingServerError } from './billing-server-error'

const FALLBACK = 'No pudimos enviar la corrección. Intenta de nuevo.'

function apiError(status: number, error: Record<string, unknown>): AxiosError {
  const config = { headers: new AxiosHeaders() }
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, {
    status,
    statusText: '',
    headers: {},
    config,
    data: { error },
  })
}

describe('readBillingServerError', () => {
  it('keeps the message, the key and the fields the legacy answered', () => {
    const read = readBillingServerError(
      apiError(422, {
        code: 'BUSINESS_RULE',
        message: 'La identificación no es válida',
        messageKey: 'billing.identification_invalid',
      }),
      FALLBACK,
    )

    expect(read).toEqual({
      message: 'La identificación no es válida',
      messageKey: 'billing.identification_invalid',
      fields: null,
    })
  })

  it('falls back when the request never reached the server', () => {
    const networkError = new AxiosError('Network Error', 'ERR_NETWORK')

    expect(readBillingServerError(networkError, FALLBACK)).toEqual({
      message: FALLBACK,
      messageKey: null,
      fields: null,
    })
  })

  it('falls back on an error that is not an HTTP answer', () => {
    expect(readBillingServerError(new TypeError('boom'), FALLBACK).message).toBe(FALLBACK)
  })
})

describe('identificationMessageOf', () => {
  const read = (status: number, error: Record<string, unknown>) =>
    identificationMessageOf(readBillingServerError(apiError(status, error), FALLBACK))

  it('takes the identification field of a validation answer', () => {
    expect(
      read(400, {
        code: 'VALIDATION_FAILED',
        message: 'Datos inválidos',
        fields: { idNumber: ['El número es obligatorio'] },
      }),
    ).toBe('El número es obligatorio')
  })

  it('takes an identification rule of the legacy', () => {
    expect(
      read(422, {
        code: 'BUSINESS_RULE',
        message: 'El número no tiene el formato correcto',
        messageKey: 'billing.identification_malformed',
      }),
    ).toBe('El número no tiene el formato correcto')
  })

  it('leaves every other answer to the alert', () => {
    expect(
      read(422, {
        code: 'BUSINESS_RULE',
        message: 'La razón social no es válida',
        messageKey: 'billing.legal_name_invalid',
      }),
    ).toBeNull()
    expect(
      read(400, {
        code: 'VALIDATION_FAILED',
        message: 'Datos inválidos',
        fields: { address: ['Demasiado larga'] },
      }),
    ).toBeNull()
    expect(identificationMessageOf(readBillingServerError(new Error('x'), FALLBACK))).toBeNull()
  })
})
