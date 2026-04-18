import { z } from 'zod'

import type { IEventFormData } from '../types/event-form.types'

export const EVENT_FORM_DEFAULTS: IEventFormData = {
  name: '',
  description: '',
  date: null,
  provinceId: null,
  cantonId: null,
  eventTypeId: 1, // Default: Downhill
}

export const eventFormSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres').max(200, 'Máximo 200 caracteres'),
  description: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
  date: z.number({ error: 'La fecha es requerida' }),
  provinceId: z.number().nullable(),
  cantonId: z.number().nullable(),
  eventTypeId: z.number({ error: 'El tipo de evento es requerido' }),
})
