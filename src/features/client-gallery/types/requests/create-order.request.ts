export interface ICreateOrderRequest {
  photoIds: string[]
  firstName: string
  lastName: string
  whatsapp: string
  email?: string | null
  notes?: string | null
}
