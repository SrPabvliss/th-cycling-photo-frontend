import type { IApiEquipmentColor, IEquipmentColor } from './equipment-color.response'
import type { IApiPlateNumber, IPlateNumber } from './plate-number.response'

export type CyclistSource = 'manual' | 'ai'

/** API projection from GET /cyclists/:id */
export interface IApiCyclistDetail {
  id: string
  photoId: string
  source: string
  plateNumber: IApiPlateNumber | null
  equipmentColors: IApiEquipmentColor[]
  createdAt: string
  updatedAt: string
}

/** Frontend domain type with parsed dates and typed enums */
export interface ICyclistDetail {
  id: string
  photoId: string
  source: CyclistSource
  plateNumber: IPlateNumber | null
  equipmentColors: IEquipmentColor[]
  createdAt: Date
  updatedAt: Date
}
