import type { IContactFormData } from '../constants/contact-form.schema'
import type { ICreateOrderRequest } from '../types/requests/create-order.request'

export function toCreateOrderRequest(
  formData: IContactFormData,
  selectedIds: Set<string>,
): ICreateOrderRequest {
  return {
    photoIds: Array.from(selectedIds),
    firstName: formData.firstName.trim(),
    lastName: formData.lastName.trim(),
    whatsapp: formData.whatsapp.trim(),
    email: formData.email?.trim() || null,
    notes: formData.notes?.trim() || null,
  }
}
