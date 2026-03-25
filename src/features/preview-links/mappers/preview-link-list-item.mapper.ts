import type {
  IApiPreviewLinkListItem,
  IPreviewLinkListItem,
  PreviewLinkStatus,
} from '../types/responses/preview-link-list-item.response'

export function toPreviewLinkListItem(api: IApiPreviewLinkListItem): IPreviewLinkListItem {
  return {
    id: api.id,
    token: api.token,
    status: api.status as PreviewLinkStatus,
    expiresAt: new Date(api.expiresAt),
    viewedAt: api.viewedAt ? new Date(api.viewedAt) : null,
    createdAt: new Date(api.createdAt),
    photoCount: api.photoCount,
    orderCount: api.orderCount,
  }
}

export function toPreviewLinkListItems(items: IApiPreviewLinkListItem[]): IPreviewLinkListItem[] {
  return items.map(toPreviewLinkListItem)
}
