import { useMutation } from '@tanstack/vue-query'
import { httpClient } from '@/core/http/axios-client'
import { API_ROUTES } from '@/core/api/api-routes'

export function useVerifyPayoutReceiver() {
  return useMutation({
    mutationFn: async (phone: string) => {
      const response = await httpClient.post<{ registered: boolean }>(
        API_ROUTES.TENANT_PROFILE.VERIFY_RECEIVER,
        { phone },
        { silent: true },
      )
      return response.data
    },
  })
}
