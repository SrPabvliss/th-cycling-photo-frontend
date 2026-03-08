export interface ICreateEventRequest {
  name: string
  date: string
  location?: string | null
  provinceId?: number | null
  cantonId?: number | null
}
