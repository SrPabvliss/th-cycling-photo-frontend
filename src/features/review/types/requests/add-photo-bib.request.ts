export interface IAddPhotoBibRequest {
  photoId: string
  photoSlug: string
  digits: string
  status?: 'read' | 'abstained'
}
