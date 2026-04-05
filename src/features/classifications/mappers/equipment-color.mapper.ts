import type { IApiGearColor, IGearColor } from '../types/responses/equipment-color.response'

export function toGearColor(api: IApiGearColor): IGearColor {
  return {
    id: api.id,
    gearTypeId: api.gearTypeId,
    colorName: api.colorName,
    colorHex: api.colorHex,
    rawHex: api.rawHex,
    densityPercentage: api.densityPercentage,
  }
}
