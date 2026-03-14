import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { IApiDownloadUrl } from '../../types/responses/download-url.response'

export function usePhotoDownloadUrl() {
  async function getDownloadUrl(photoId: string, type: 'original' | 'retouched' = 'original') {
    const response = await httpClient.get<IApiDownloadUrl>(API_ROUTES.PHOTOS.DOWNLOAD(photoId), {
      params: { type },
    })
    return response.data.url
  }

  return { getDownloadUrl }
}
