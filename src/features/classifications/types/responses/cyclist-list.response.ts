import type { CyclistSource } from './cyclist-detail.response'

/** API projection from GET /photos/:photoId/cyclists */
export interface IApiCyclistListItem {
  id: string
  photoId: string
  source: string
  plateNumber: number | null
  colorCount: number
  createdAt: string
  updatedAt: string
}

/** Frontend domain type */
export interface ICyclistListItem {
  id: string
  photoId: string
  source: CyclistSource
  plateNumber: number | null
  colorCount: number
  createdAt: Date
  updatedAt: Date
}
