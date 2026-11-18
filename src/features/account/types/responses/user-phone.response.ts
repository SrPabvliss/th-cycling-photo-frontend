export interface IApiUserPhone {
  id: string
  phoneNumber: string
  label: string | null
  isWhatsapp: boolean
  isPrimary: boolean
}

export interface IUserPhone {
  id: string
  phoneNumber: string
  label: string | null
  isWhatsapp: boolean
  isPrimary: boolean
}

/** What saving a phone answers. */
export interface IPhoneSaved {
  id: string
  /**
   * Orders in progress that took the new primary number as their contact phone. Optional: older
   * api versions do not send it.
   */
  syncedOrders?: number
}
