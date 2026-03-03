/** Single photo item within a confirm batch request */
export interface IPhotoBatchItem {
  fileName: string
  fileSize: number
  objectKey: string
  contentType: string
}

/** Request body for POST /events/:eventId/photos/confirm-batch */
export interface IConfirmPhotoBatchRequest {
  photos: IPhotoBatchItem[]
}
