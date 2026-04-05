export interface IGearColorInput {
  gearTypeId: number
  colorName: string
  colorHex: string
}

export interface ICreateParticipantRequest {
  identifier?: string
  colors: IGearColorInput[]
}
