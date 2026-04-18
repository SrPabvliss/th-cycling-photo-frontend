export interface ICreateEventRequest {
  name: string
  description?: string | null
  date: string
  provinceId?: number | null
  cantonId?: number | null
  eventTypeId: number
}
