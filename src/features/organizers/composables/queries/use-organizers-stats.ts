import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ORGANIZER_QUERY_KEYS } from '../../constants/query-keys'
import { toOrganizersStats } from '../../mappers/organizers-stats.mapper'
import { toOrganizerFiltersParams } from '../../types/requests/organizer-filters.request'
import type { IOrganizerFilters } from '../../types/requests/organizer-filters.request'
import type { IApiOrganizersStats } from '../../types/responses/organizers-stats.response'

/**
 * Takes the SAME filters as `useOrganizersListQuery` — the tiles and the tab counts must
 * never contradict the grid they describe. The endpoint honours `search` and ignores `tab`.
 */
export function useOrganizersStatsQuery(filters: Ref<IOrganizerFilters>) {
  return useQuery({
    queryKey: computed(() => ORGANIZER_QUERY_KEYS.stats(filters.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiOrganizersStats>(API_ROUTES.ORGANIZERS.STATS, {
        params: toOrganizerFiltersParams(filters.value),
      })
      return toOrganizersStats(response.data)
    },
  })
}
