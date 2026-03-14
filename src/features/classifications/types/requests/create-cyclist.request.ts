export interface IColorInput {
  itemType: string
  colorName: string
  colorHex: string
}

export interface ICreateCyclistRequest {
  plateNumber?: number
  colors: IColorInput[]
}
