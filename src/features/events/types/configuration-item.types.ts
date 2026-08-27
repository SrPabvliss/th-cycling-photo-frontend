export type ConfigurationItemId =
  | 'publicName'
  | 'watermark'
  | 'whatsapp'
  | 'payphone'
  | 'bankTransfer'

export type PayoutItemId = 'payphone' | 'bankTransfer'

export type ConfigurationItemState = 'profile' | 'new' | 'missing'

export type ConfigurationItemIcon = 'building' | 'image' | 'whatsapp' | 'card' | 'bank'

export type PayphoneVerificationState = 'idle' | 'pending' | 'verified' | 'rejected' | 'invalid'

export interface IPublicNameDraft {
  value: string
}

export interface IWatermarkDraft {
  storageKey: string | null
  fileName: string | null
}

export interface IWhatsappDraft {
  value: string
}

export interface IPayphoneDraft {
  phone: string
  verification: PayphoneVerificationState
}

export interface IBankTransferDraft {
  bankName: string
  accountNumber: string
  accountType: string
  accountHolder: string
  holderIdentification: string
}

export type IConfigurationDraft =
  | IPublicNameDraft
  | IWatermarkDraft
  | IWhatsappDraft
  | IPayphoneDraft
  | IBankTransferDraft

export interface IConfigurationItem {
  id: ConfigurationItemId
  label: string
  icon: ConfigurationItemIcon
  requiresPassword: boolean
  state: ConfigurationItemState
  hasProfileValue: boolean
  profileValue: string | null
  profileLabel: string
  summary: string
  isReady: boolean
  isOpen: boolean
  useProfile: boolean
  saveToProfile: boolean
  isRemovable: boolean
  isRemoved: boolean
  removeDisabledReason: string | null
  draft: IConfigurationDraft
}

export interface IConfigurationItemDefinition {
  id: ConfigurationItemId
  label: string
  icon: ConfigurationItemIcon
  requiresPassword: boolean
}

export interface IDrafts {
  publicName: IPublicNameDraft
  watermark: IWatermarkDraft
  whatsapp: IWhatsappDraft
  payphone: IPayphoneDraft
  bankTransfer: IBankTransferDraft
}
