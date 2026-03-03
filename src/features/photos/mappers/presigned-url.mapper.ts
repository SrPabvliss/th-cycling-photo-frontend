import type { IApiPresignedUrl } from '../types/responses/presigned-url.response'

export interface IPresignedUrl {
  url: string
  objectKey: string
  expiresIn: number
}

export function toPresignedUrl(api: IApiPresignedUrl): IPresignedUrl {
  return {
    url: api.url,
    objectKey: api.objectKey,
    expiresIn: api.expiresIn,
  }
}
