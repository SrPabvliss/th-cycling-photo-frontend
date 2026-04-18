export interface IApiDownloadManifestItem {
  filename: string
  downloadUrl: string
  fileSize: number
}

/** API response from GET /events/:eventId/photos/download-manifest */
export interface IApiDownloadManifest {
  items: IApiDownloadManifestItem[]
  totalSize: number
}
