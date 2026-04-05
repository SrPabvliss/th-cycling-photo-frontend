import { z } from 'zod'

export interface IContactFormData {
  notes: string
  bibNumber: string
  snapCategoryName: string
}

export const CONTACT_FORM_DEFAULTS: IContactFormData = {
  notes: '',
  bibNumber: '',
  snapCategoryName: '',
}

export const contactFormSchema = z.object({
  notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
  bibNumber: z.string().max(20, 'Máximo 20 caracteres').optional(),
  snapCategoryName: z.string().max(100, 'Máximo 100 caracteres').optional(),
})
