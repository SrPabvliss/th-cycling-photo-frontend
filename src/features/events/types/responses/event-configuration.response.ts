import type { PayoutMethodResponse } from '@/features/tenant-profile/types/responses/payout-method.response'

export interface IEventConfigurationPresetResponse {
  publicName: string | null
  watermarkStorageKey: string | null
  whatsappNumber: string | null
  availablePayoutMethods: PayoutMethodResponse[]
}

export interface IEventConfigurationResponse {
  publicName: string | null
  watermarkStorageKey: string | null
  whatsappNumber: string | null
  payoutMethods: PayoutMethodResponse[]
  isEditable: boolean
}
