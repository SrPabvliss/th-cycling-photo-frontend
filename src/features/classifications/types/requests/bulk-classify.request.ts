import type { IGearColorInput } from './create-cyclist.request'

export interface IBulkClassifyRequest {
  photoIds: string[]
  identifier?: string
  colors: IGearColorInput[]
}
