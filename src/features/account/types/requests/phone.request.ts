export interface IAddPhoneRequest {
  phoneNumber: string
  label?: string
  isWhatsapp?: boolean
}

export interface IUpdatePhoneRequest {
  phoneNumber?: string
  label?: string | null
  isWhatsapp?: boolean
}
