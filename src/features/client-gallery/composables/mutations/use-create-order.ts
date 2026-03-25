import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { ICreateOrderRequest } from '../../types/requests/create-order.request'

export function useCreateOrder(token: string) {
  return useMutation({
    mutationFn: async (data: ICreateOrderRequest) => {
      const response = await httpClient.post<{ id: string }>(
        API_ROUTES.PREVIEW_PUBLIC.CREATE_ORDER(token),
        data,
        { silent: true },
      )
      return response.data
    },
  })
}
