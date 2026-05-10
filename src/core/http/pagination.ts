import type { IApiPagination } from './http-response.interface'

/**
 * Domain shape used inside composables and views. Same fields as the API
 * shape today but kept separate so callers don't need to cast and so the
 * field set can evolve independently (e.g. adding `hasNextPage`).
 */
export interface IPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Builds a domain `IPagination` from the API meta. When the backend response
 * has no pagination block (non-paginated endpoint mistakenly piped through),
 * fall back to a single-page summary derived from the items themselves.
 */
export function toPagination(
  apiPagination: IApiPagination | undefined,
  fallback: { page: number; limit: number; itemsCount: number },
): IPagination {
  if (apiPagination) {
    return {
      page: apiPagination.page,
      limit: apiPagination.limit,
      total: apiPagination.total,
      totalPages: apiPagination.totalPages,
    }
  }

  return {
    page: fallback.page,
    limit: fallback.limit,
    total: fallback.itemsCount,
    totalPages: fallback.itemsCount === 0 ? 0 : 1,
  }
}
