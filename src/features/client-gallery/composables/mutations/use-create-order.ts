import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toPreviewOrderCreated } from '../../mappers/preview-order-created.mapper'
import type { ICreateOrderRequest } from '../../types/requests/create-order.request'
import type { IApiPreviewOrderCreated } from '../../types/responses/preview-order-created.response'

export function useCreateOrder(token: string) {
  return useMutation({
    mutationFn: async (data: ICreateOrderRequest) => {
      const response = await httpClient.post<IApiPreviewOrderCreated>(
        API_ROUTES.PREVIEW_PUBLIC.CREATE_ORDER(token),
        data,
        { silent: true },
      )
      return toPreviewOrderCreated(response.data)
    },
  })
}
