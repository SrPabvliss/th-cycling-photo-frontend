export interface ICreateEventRequest {
  name: string
  startDate: string
  endDate: string
  provinceId?: number | null
  cantonId?: number | null
  eventTypeId: number
}
