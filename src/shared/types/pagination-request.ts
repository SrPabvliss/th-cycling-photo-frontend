/**
 * Generic shape for paginated query string params. Reuse it for any
 * `GET /...?page=&limit=` endpoint instead of declaring per-feature copies.
 *
 * The companion response shape is `IApiPagination` from
 * `@/core/http/http-response.interface` (returned inside `meta.pagination`).
 */
export interface IPaginationRequest {
  page?: number
  limit?: number
}
