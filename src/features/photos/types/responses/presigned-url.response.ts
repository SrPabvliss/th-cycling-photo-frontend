/** API projection from POST /events/:eventId/photos/presigned-url */
export interface IApiPresignedUrl {
  isDuplicate: boolean
  url: string | null
  objectKey: string | null
  expiresIn: number | null
}

/** Frontend domain type — discriminated union for type-safe handling */
export type IPresignedUrl =
  | { isDuplicate: true }
  | { isDuplicate: false; url: string; objectKey: string; expiresIn: number }
