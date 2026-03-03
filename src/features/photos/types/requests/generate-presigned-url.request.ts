/** Request body for POST /events/:eventId/photos/presigned-url */
export interface IGeneratePresignedUrlRequest {
  fileName: string
  contentType: string
}
