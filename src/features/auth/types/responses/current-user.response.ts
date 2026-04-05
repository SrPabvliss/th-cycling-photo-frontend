export interface IApiUserPhone {
  id: string
  phoneNumber: string
  label: string | null
  isWhatsapp: boolean
  isPrimary: boolean
}

export interface IApiCustomerProfile {
  countryId: number
  provinceId: number | null
  cantonId: number | null
}

export interface IApiCurrentUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  profile?: IApiCustomerProfile
  phones: IApiUserPhone[]
}

export interface IUserPhone {
  id: string
  phoneNumber: string
  label: string | null
  isWhatsapp: boolean
  isPrimary: boolean
}

export interface ICustomerProfile {
  countryId: number
  provinceId: number | null
  cantonId: number | null
}

export interface ICurrentUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  profile?: ICustomerProfile
  phones: IUserPhone[]
}
