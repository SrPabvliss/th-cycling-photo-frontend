export interface IEventCreationContextContract {
  id: string
  commercialName: string
  eventsTotal: number
  eventsUsed: number
  photosPerEvent: number | null
  validUntil: string
}

export interface IEventCreationContextResponse {
  requiresContract: boolean
  hasSlot: boolean
  contract: IEventCreationContextContract | null
  defaultEventPhotoQuota: number | null
}
