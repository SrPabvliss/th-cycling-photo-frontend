/** API projection from GET /gear-types */
export interface IApiGearType {
  id: number
  name: string
}

export interface IGearType {
  id: number
  name: string
}

export const GEAR_TYPE_LABELS: Record<string, string> = {
  headwear: 'Casco',
  clothing: 'Ropa',
  vehicle: 'Bicicleta',
}
