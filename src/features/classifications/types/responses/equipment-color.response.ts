/** API projection for gear color — nested in participant detail */
export interface IApiGearColor {
  id: string
  gearTypeId: number
  colorName: string
  colorHex: string
  rawHex: string | null
  densityPercentage: number | null
}

/** Frontend domain type */
export interface IGearColor {
  id: string
  gearTypeId: number
  colorName: string
  colorHex: string
  rawHex: string | null
  densityPercentage: number | null
}
