import type {
  PayoutMethodAccountType,
  PayoutMethodProvider,
  PayoutMethodResponse,
} from '@/features/tenant-profile/types/responses/payout-method.response'

export type IEventConfigurationMissingRequirement =
  | 'publicName'
  | 'watermark'
  | 'whatsapp'
  | 'payphone'
  | 'bankTransfer'

export interface IEventConfigurationPresetResponse {
  publicName: string | null
  watermarkStorageKey: string | null
  watermarkUrl: string | null
  whatsappNumber: string | null
  whatsappPendingVerification: boolean
  availablePayoutMethods: PayoutMethodResponse[]
  missing: IEventConfigurationMissingRequirement[]
}

export interface IEventPayoutMethodResponse {
  id: string
  provider: PayoutMethodProvider
  isActive: boolean
  sortOrder: number
  receiverIdentifier: string | null
  bankName: string | null
  accountNumber: string | null
  accountType: PayoutMethodAccountType | null
  accountHolder: string | null
  holderIdentification: string | null
  sourcePayoutMethodId: string | null
}

export interface IEventConfigurationResponse {
  publicName: string | null
  watermarkStorageKey: string | null
  whatsappNumber: string | null
  payoutMethods: IEventPayoutMethodResponse[]
  isEditable: boolean
}
