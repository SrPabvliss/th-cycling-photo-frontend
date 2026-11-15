import { useQueryClient } from '@tanstack/vue-query'
import { readonly, ref, type Ref } from 'vue'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ACCOUNT_QUERY_KEYS } from '@/features/account/constants/query-keys'
import { CONSENT_TYPE } from '@/features/auth/constants/consent.constants'
import type { PaymentMethod } from '@/shared/types/payment-method.types'
import { CLIENT_GALLERY_QUERY_KEYS } from '../constants/query-keys'
import { toCreateOrderRequest } from '../mappers/create-order.mapper'
import { toPreviewOrderCreated } from '../mappers/preview-order-created.mapper'
import type { IPreviewData } from '../types/responses/preview-data.response'
import type {
  IApiPreviewOrderCreated,
  IPreviewOrderCreated,
} from '../types/responses/preview-order-created.response'
import { previewProblem, type PreviewProblem } from '../utils/preview-problem'

export interface IPlacePreviewOrderInput {
  photoIds: string[]
  billingAccountId: string
  method: PaymentMethod
  /** The buyer ticked the electronic invoice consent: record it before ordering. */
  recordConsent?: boolean
}

export interface IPlacePreviewOrder {
  place(input: IPlacePreviewOrderInput): Promise<IPreviewOrderCreated | null>
  isPlacing: Readonly<Ref<boolean>>
  problem: Readonly<Ref<PreviewProblem | null>>
  reset(): void
}

/**
 * Creates the order of a preview link, once: while it is on its way any other call gets the
 * same answer and sends nothing. Silent: the screen names the problem next to the button.
 */
export function usePlacePreviewOrder(token: Ref<string>): IPlacePreviewOrder {
  const queryClient = useQueryClient()
  const isPlacing = ref(false)
  const problem = ref<PreviewProblem | null>(null)
  let pending: Promise<IPreviewOrderCreated | null> | null = null

  async function run(input: IPlacePreviewOrderInput) {
    problem.value = null
    try {
      if (input.recordConsent) {
        await httpClient.post(
          API_ROUTES.AUTH.CONSENTS,
          { types: [CONSENT_TYPE.ELECTRONIC_INVOICE] },
          { silent: true },
        )
        void queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.billingAccounts() })
      }
      const response = await httpClient.post<IApiPreviewOrderCreated>(
        API_ROUTES.PREVIEW_PUBLIC.CREATE_ORDER(token.value),
        toCreateOrderRequest(input),
        { silent: true },
      )
      void queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.orders() })
      // The link is used now: coming back to it (the back button) says it was ordered.
      queryClient.setQueryData<IPreviewData>(
        CLIENT_GALLERY_QUERY_KEYS.preview(token.value),
        (current) => (current ? { ...current, status: 'converted' } : current),
      )
      return toPreviewOrderCreated(response.data)
    } catch (error) {
      problem.value = previewProblem(error)
      return null
    }
  }

  function place(input: IPlacePreviewOrderInput) {
    if (pending) return pending
    isPlacing.value = true
    pending = run(input).finally(() => {
      isPlacing.value = false
      pending = null
    })
    return pending
  }

  return {
    place,
    isPlacing: readonly(isPlacing),
    problem: readonly(problem),
    reset: () => {
      problem.value = null
    },
  }
}
