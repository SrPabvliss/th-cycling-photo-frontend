import type { EquipmentItemType } from '../types/responses/equipment-color.response'
import type {
  IApiEquipmentColor,
  IEquipmentColor,
} from '../types/responses/equipment-color.response'

export function toEquipmentColor(api: IApiEquipmentColor): IEquipmentColor {
  return {
    id: api.id,
    itemType: api.itemType as EquipmentItemType,
    colorName: api.colorName,
    colorHex: api.colorHex,
    rawHex: api.rawHex,
    densityPercentage: api.densityPercentage,
  }
}
