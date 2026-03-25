export interface IUpdateEventRequest {
  name?: string
  description?: string | null
  date?: string
  location?: string | null
  provinceId?: number | null
  cantonId?: number | null
}
