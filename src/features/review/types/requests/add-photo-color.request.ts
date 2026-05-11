import type { ColorName } from '@/shared/constants/color-palette'
import type { ColorRegion } from '../color-region.type'

export interface IAddPhotoColorRequest {
  photoId: string
  photoSlug: string
  region: ColorRegion
  primaryColor: ColorName
  secondaryColor?: ColorName | null
}
