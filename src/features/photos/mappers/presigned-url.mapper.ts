import type { IApiPresignedUrl, IPresignedUrl } from '../types/responses/presigned-url.response'

export function toPresignedUrl(api: IApiPresignedUrl): IPresignedUrl {
  if (api.isDuplicate) return { isDuplicate: true }
  return {
    isDuplicate: false,
    url: api.url!,
    objectKey: api.objectKey!,
    expiresIn: api.expiresIn!,
  }
}
