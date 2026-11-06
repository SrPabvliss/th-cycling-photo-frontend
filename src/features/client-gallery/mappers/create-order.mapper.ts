import type { PaymentMethod } from '@/shared/types/payment-method.types'
import type { IContactFormData } from '../constants/contact-form.schema'
import type { ICreateOrderRequest } from '../types/requests/create-order.request'

export function toCreateOrderRequest(
  formData: IContactFormData,
  selectedIds: Set<string>,
  billing: { billingAccountId: string; method: PaymentMethod },
): ICreateOrderRequest {
  return {
    photoIds: Array.from(selectedIds),
    notes: formData.notes?.trim() || null,
    bibNumber: formData.bibNumber?.trim() || null,
    snapCategoryName: formData.snapCategoryName?.trim() || null,
    billingAccountId: billing.billingAccountId,
    method: billing.method,
  }
}
