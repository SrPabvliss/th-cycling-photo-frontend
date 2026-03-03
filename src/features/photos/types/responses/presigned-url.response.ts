/** API projection from POST /events/:eventId/photos/presigned-url */
export interface IApiPresignedUrl {
  url: string
  objectKey: string
  expiresIn: number
}
