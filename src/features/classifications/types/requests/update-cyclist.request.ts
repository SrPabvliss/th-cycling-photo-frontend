import type { IColorInput } from './create-cyclist.request'

export interface IUpdateCyclistRequest {
  plateNumber?: number | null
  colors?: IColorInput[]
}
