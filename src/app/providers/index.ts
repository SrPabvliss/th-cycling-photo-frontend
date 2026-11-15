import type { QueryClientConfig } from '@tanstack/vue-query'

import { shouldRetryQuery } from './query-retry'

export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 30,
      retry: shouldRetryQuery,
      refetchOnWindowFocus: false,
    },
  },
}
