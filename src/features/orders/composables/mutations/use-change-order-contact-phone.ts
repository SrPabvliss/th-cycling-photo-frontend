import type { Ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ORDER_QUERY_KEYS } from '../../constants/query-keys'

export interface IChangeOrderContactPhoneRequest {
  /** With country code: "+593991234567". */
  phoneNumber: string
  /** The buyer's account takes the number too, as its primary one. */
  updateAccount: boolean
}

export interface IOrderContactPhoneChanged {
  id: string
  phoneNumber: string
  /** This order and the buyer's others still in progress. */
  updatedOrders: number
  accountUpdated: boolean
}

/**
 * Corrects the phone the buyer of an order is reached at. The order keeps the number it was placed
 * with, so a mistyped one stays wrong until someone who knows the right one fixes it here.
 */
export function useChangeOrderContactPhone(orderId: Ref<string>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: IChangeOrderContactPhoneRequest) => {
      const response = await httpClient.patch<IOrderContactPhoneChanged>(
        API_ROUTES.ORDERS.CONTACT_PHONE(orderId.value),
        payload,
        { silent: true },
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all() })
    },
  })
}
