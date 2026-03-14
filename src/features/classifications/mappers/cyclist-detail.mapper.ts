import type { CyclistSource } from '../types/responses/cyclist-detail.response'
import type { IApiCyclistDetail, ICyclistDetail } from '../types/responses/cyclist-detail.response'
import { toEquipmentColor } from './equipment-color.mapper'
import { toPlateNumber } from './plate-number.mapper'

export function toCyclistDetail(api: IApiCyclistDetail): ICyclistDetail {
  return {
    id: api.id,
    photoId: api.photoId,
    source: api.source as CyclistSource,
    plateNumber: api.plateNumber ? toPlateNumber(api.plateNumber) : null,
    equipmentColors: api.equipmentColors.map(toEquipmentColor),
    createdAt: new Date(api.createdAt),
    updatedAt: new Date(api.updatedAt),
  }
}
