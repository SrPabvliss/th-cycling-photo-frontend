import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { RETOUCH_QUERY_KEYS } from '../../constants/retouch-query-keys'
import { toOperatorRetouchEventOptions } from '../../mappers/operator-retouch-event-option.mapper'
import type { IApiOperatorRetouchEventOption } from '../../types/responses/operator-retouch-event-option.response'

/**
 * Events offered in the retouch queue filter. Comes from the retouch module, not
 * from GET /events, so staff also see other tenants' events they retouch.
 */
export function useOperatorRetouchEventsQuery() {
  return useQuery({
    queryKey: RETOUCH_QUERY_KEYS.operatorEvents(),
    queryFn: async () => {
      const response = await httpClient.get<IApiOperatorRetouchEventOption[]>(
        API_ROUTES.OPERATOR.RETOUCH_EVENTS,
      )
      return toOperatorRetouchEventOptions(response.data)
    },
  })
}
