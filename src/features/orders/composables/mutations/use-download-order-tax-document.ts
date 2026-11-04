import type { Ref } from 'vue'
import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { message } from '@/core/ui/discrete-api'
import { openSignedUrl } from '@/shared/utils/download.utils'
import type { IApiErrorResponse } from '@/core/http/http-response.interface'
import type { IMyOrderTaxDocumentFiles } from '@/features/account/types/responses/my-order-tax-document-files.response'

export function useDownloadOrderTaxDocument(orderId: Ref<string>) {
  return useMutation({
    mutationFn: async ({ docId, file }: { docId: string; file: 'pdf' | 'xml' }) => {
      const response = await httpClient.get<IMyOrderTaxDocumentFiles>(
        API_ROUTES.ORDERS.TAX_DOCUMENT_FILES(orderId.value, docId),
        { silent: true },
      )
      openSignedUrl(response.data[file].url)
    },
    onError: (error: { response?: { data?: IApiErrorResponse } }) => {
      message.error(
        error.response?.data?.error?.message ?? 'No pudimos obtener el archivo. Intenta de nuevo.',
      )
    },
  })
}
