import type { IRegisterFormData } from '../constants/register-form.schema'
import type { IRegisterRequest } from '../types/requests/register.request'

export function toRegisterRequest(form: IRegisterFormData): IRegisterRequest {
  const birthDate =
    form.birthYear != null && form.birthMonth != null && form.birthDay != null
      ? `${form.birthYear}-${String(form.birthMonth).padStart(2, '0')}-${String(form.birthDay).padStart(2, '0')}`
      : undefined

  return {
    email: form.email.trim(),
    password: form.password,
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    phoneNumber: form.phoneNumber,
    countryId: form.countryId!,
    provinceId: form.provinceId ?? undefined,
    cantonId: form.cantonId ?? undefined,
    birthDate,
    gender: form.gender ?? undefined,
  }
}
