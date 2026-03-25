import type {
  IApiPreviewLinkCreated,
  IPreviewLinkCreated,
} from '../types/responses/preview-link-created.response'

export function toPreviewLinkCreated(api: IApiPreviewLinkCreated): IPreviewLinkCreated {
  return {
    id: api.id,
    token: api.token,
    previewUrl: api.previewUrl,
    shareTemplate: api.shareTemplate,
  }
}
