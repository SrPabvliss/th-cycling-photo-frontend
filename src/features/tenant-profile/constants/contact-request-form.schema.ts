import { z } from 'zod'

import { CONTACT_REQUEST_REASONS } from '../types/requests/contact-request.request'

export const CONTACT_REQUEST_REASON_LABELS: Record<
  (typeof CONTACT_REQUEST_REASONS)[number],
  string
> = {
  more_quota: 'Necesito más cupo de eventos',
  renewal: 'Quiero renovar mi contrato',
}

export const contactRequestFormSchema = z
  .object({
    reason: z.enum(CONTACT_REQUEST_REASONS, { error: 'Elige un motivo' }),
    eventsWanted: z
      .number({ error: 'Indica cuántos eventos' })
      .int('Debe ser un número entero')
      .min(1, 'Mínimo 1 evento')
      .max(100, 'Máximo 100 eventos')
      .nullable(),
    message: z
      .string()
      .trim()
      .min(10, 'Cuéntanos un poco más (mínimo 10 caracteres)')
      .max(2000, 'Máximo 2000 caracteres'),
  })
  .refine((data) => data.reason !== 'more_quota' || data.eventsWanted !== null, {
    message: 'Indica cuántos eventos necesitas',
    path: ['eventsWanted'],
  })

export type IContactRequestForm = z.infer<typeof contactRequestFormSchema>
