import { z } from 'zod'

import type { IEventFormData } from '../types/event-form.types'

export const EVENT_FORM_DEFAULTS: IEventFormData = {
  name: '',
  date: null,
  location: '',
}

export const eventFormSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres').max(200, 'Máximo 200 caracteres'),
  date: z.number({ error: 'La fecha es requerida' }),
  location: z.string(),
})
