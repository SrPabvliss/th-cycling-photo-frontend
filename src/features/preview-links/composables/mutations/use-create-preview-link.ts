import type { Ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PREVIEW_LINK_QUERY_KEYS } from '../../constants/query-keys'
import { toPreviewLinkCreated } from '../../mappers/preview-link-created.mapper'
import type { ICreatePreviewLinkRequest } from '../../types/requests/create-preview-link.request'
import type { IApiPreviewLinkCreated } from '../../types/responses/preview-link-created.response'

export function useCreatePreviewLink(eventId: Ref<string>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ICreatePreviewLinkRequest) => {
      const response = await httpClient.post<IApiPreviewLinkCreated>(
        API_ROUTES.PREVIEW_LINKS.CREATE(eventId.value),
        data,
      )
      return toPreviewLinkCreated(response.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PREVIEW_LINK_QUERY_KEYS.all() })
    },
  })
}
