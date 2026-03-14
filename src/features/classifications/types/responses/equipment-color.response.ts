export type EquipmentItemType = 'helmet' | 'clothing' | 'bike'

/** API projection for equipment color — nested in cyclist detail */
export interface IApiEquipmentColor {
  id: string
  itemType: string
  colorName: string
  colorHex: string
  rawHex: string | null
  densityPercentage: number | null
}

/** Frontend domain type */
export interface IEquipmentColor {
  id: string
  itemType: EquipmentItemType
  colorName: string
  colorHex: string
  rawHex: string | null
  densityPercentage: number | null
}
