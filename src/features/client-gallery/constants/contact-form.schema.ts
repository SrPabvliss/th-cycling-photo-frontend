import { z } from 'zod'

export interface IContactFormData {
  firstName: string
  lastName: string
  whatsapp: string
  email: string
  notes: string
}

export const CONTACT_FORM_DEFAULTS: IContactFormData = {
  firstName: '',
  lastName: '',
  whatsapp: '',
  email: '',
  notes: '',
}

export const contactFormSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  lastName: z.string().min(1, 'El apellido es requerido').max(100, 'Máximo 100 caracteres'),
  whatsapp: z
    .string()
    .min(10, 'Número de WhatsApp inválido')
    .max(20, 'Número de WhatsApp inválido')
    .regex(/^\+\d+$/, 'Formato de número inválido'),
  email: z.union([z.string().email('Email inválido'), z.literal('')]),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
})
