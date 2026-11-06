import type {
  IApiPreviewOrderCreated,
  IPreviewOrderCreated,
} from '../types/responses/preview-order-created.response'

export function toPreviewOrderCreated(api: IApiPreviewOrderCreated): IPreviewOrderCreated {
  return {
    id: api.id,
    subtotal: api.subtotal,
    currency: api.currency,
    photoCount: api.photoCount,
    method: api.method,
  }
}
