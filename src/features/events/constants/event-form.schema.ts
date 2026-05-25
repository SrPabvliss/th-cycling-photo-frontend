import { z } from 'zod'

import type { IEventFormData } from '../types/event-form.types'

export const EVENT_FORM_DEFAULTS: IEventFormData = {
  name: '',
  startDate: null,
  endDate: null,
  provinceId: null,
  cantonId: null,
  eventTypeId: 1, // Default: Downhill
}

export const eventFormSchema = z
  .object({
    name: z.string().min(3, 'Mínimo 3 caracteres').max(200, 'Máximo 200 caracteres'),
    startDate: z.number({ error: 'La fecha de inicio es requerida' }),
    endDate: z.number({ error: 'La fecha de fin es requerida' }),
    provinceId: z.number().nullable(),
    cantonId: z.number().nullable(),
    eventTypeId: z.number({ error: 'El tipo de evento es requerido' }),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'La fecha de fin debe ser igual o posterior a la fecha de inicio',
    path: ['endDate'],
  })
