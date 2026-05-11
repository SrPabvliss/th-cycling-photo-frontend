import type { ColorCorrectionField } from '../color-correction-field.type'

export interface IApplyColorCorrectionRequest {
  photoId: string
  colorId: string
  field: ColorCorrectionField
  newValue: string | null
  photoSlug: string
}
