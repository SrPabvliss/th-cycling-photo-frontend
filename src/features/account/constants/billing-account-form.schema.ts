import { z } from 'zod'

import type { BillingIdType } from '../types/responses/billing-account.response'

export interface IBillingAccountFormData {
  idType: BillingIdType
  idNumber: string
  legalName: string
  email: string
  address: string
  consent: boolean
}

export const BILLING_ID_TYPE_OPTIONS: { label: string; value: BillingIdType }[] = [
  { label: 'Cédula', value: 'national_id' },
  { label: 'RUC', value: 'ruc' },
  { label: 'Pasaporte', value: 'passport' },
]

export const ID_NUMBER_FORMAT_MESSAGE =
  'Revisa el número: la cédula tiene 10 dígitos, el RUC 13 y el pasaporte hasta 20 letras o números.'

export const billingAccountFieldValidators = {
  legalName: z
    .string()
    .trim()
    .min(1, 'Escribe el nombre o la razón social')
    .max(300, 'Máximo 300 caracteres')
    .regex(/^[^\r\n]*$/, 'Escríbelo en una sola línea'),
  email: z.string().trim().min(1, 'Escribe el correo').email('Escribe un correo válido').max(255),
  address: z.string().max(300, 'Máximo 300 caracteres'),
  consent: z.literal(true, { error: 'Acepta recibir tu factura electrónica para continuar' }),
}
