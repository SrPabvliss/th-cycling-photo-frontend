export type Gender = 'female' | 'male' | 'other' | 'prefer_not_to_say'

export interface IRegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber: string
  countryId: number
  provinceId?: number
  cantonId?: number
  birthDate?: string // ISO YYYY-MM-DD
  gender?: Gender
  acceptedTerms?: boolean
  guardianConsent?: boolean
}
