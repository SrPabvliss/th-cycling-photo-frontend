import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ACCOUNT_QUERY_KEYS } from '../../constants/query-keys'
import type {
  ICreateBillingAccountRequest,
  IUpdateBillingAccountRequest,
} from '../../types/requests/billing-account.request'
import type { IBillingAccount } from '../../types/responses/billing-account.response'
import { CLIENT_MUTATION } from '@/shared/constants/client-mutation'

/**
 * What the edit form changed, as the api takes it (TIT-114): only the changed fields; the type
 * and the number together, and only when one of them changed (editing the name does not ask the
 * tax service again); an emptied address as null.
 */
export function billingChanges(
  saved: IBillingAccount,
  next: ICreateBillingAccountRequest,
): IUpdateBillingAccountRequest {
  const changes: IUpdateBillingAccountRequest = {}
  if (next.idType !== saved.idType || next.idNumber !== saved.idNumber) {
    changes.idType = next.idType
    changes.idNumber = next.idNumber
  }
  if (next.legalName !== saved.legalName) changes.legalName = next.legalName
  if (next.email !== saved.email) changes.email = next.email
  const address = next.address?.trim() || null
  if (address !== (saved.address ?? null)) changes.address = address
  return changes
}

/** Saves the changes to one billing account. The checkout reads the same list again. */
export function useUpdateBillingAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    ...CLIENT_MUTATION,
    mutationFn: async (input: { id: string; changes: IUpdateBillingAccountRequest }) => {
      const response = await httpClient.patch<{ id: string }>(
        API_ROUTES.BILLING_ACCOUNTS.BY_ID(input.id),
        input.changes,
        { silent: true },
      )
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.billingAccounts() })
    },
  })
}
