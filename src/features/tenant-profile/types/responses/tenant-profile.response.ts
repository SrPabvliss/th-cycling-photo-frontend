export interface TenantProfileResponse {
  id: string
  name: string
  publicName: string | null
  watermarkStorageKey: string | null
  watermarkUrl: string | null
  whatsappNumber: string | null
  whatsappPendingVerification: boolean
}
