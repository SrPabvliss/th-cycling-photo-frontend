import type { IRegisterFormData } from '../constants/register-form.schema'
import type { IRegisterRequest } from '../types/requests/register.request'

export function toRegisterRequest(form: IRegisterFormData): IRegisterRequest {
  return {
    email: form.email.trim(),
    password: form.password,
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    phoneNumber: form.phoneNumber,
    countryId: form.countryId!,
    provinceId: form.provinceId ?? undefined,
    cantonId: form.cantonId ?? undefined,
  }
}
