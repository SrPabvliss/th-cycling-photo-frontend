export type IEventPayoutSelection =
  | { source: 'profile'; id: string }
  | { source: 'event'; id: string }
  | { source: 'new'; provider: 'payphone'; phone: string }
  | {
      source: 'new'
      provider: 'bank_transfer'
      bankName: string
      accountNumber: string
      accountType: string
      accountHolder: string
      holderIdentification: string
    }

export interface IEventConfigurationSelectionRequest {
  publicName?: string | null
  watermarkStorageKey?: string | null
  whatsappNumber?: string | null
  payoutMethods?: IEventPayoutSelection[]
}
