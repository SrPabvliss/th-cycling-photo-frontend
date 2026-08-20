import type { IApiUserPhone, IUserPhone } from '../types/responses/user-phone.response'

export function toUserPhone(api: IApiUserPhone): IUserPhone {
  return {
    id: api.id,
    phoneNumber: api.phoneNumber,
    label: api.label,
    isWhatsapp: api.isWhatsapp,
    isPrimary: api.isPrimary,
  }
}

export function toUserPhones(api: IApiUserPhone[]): IUserPhone[] {
  return api.map(toUserPhone)
}
