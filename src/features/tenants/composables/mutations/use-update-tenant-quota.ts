import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { httpClient } from '@/core/http/axios-client'

export function useUpdateTenantQuota() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tenantId, quota }: { tenantId: string; quota: number }) => {
      await httpClient.patch(`/tenants/${tenantId}/quota`, { quota })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
    },
  })
}
