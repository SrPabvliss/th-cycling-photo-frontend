import type { IColorInput } from './create-cyclist.request'

export interface IBulkClassifyRequest {
  photoIds: string[]
  plateNumber?: number
  colors: IColorInput[]
}
