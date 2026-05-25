/**
 * Shared TanStack Query options for queries whose payload includes
 * HMAC-signed CDN URLs (thumbnailUrl / imageUrl / fullUrl) coming from the
 * backend `CdnUrlBuilder.internalUrl()`. Backend signs these with a 10-minute
 * TTL; we refresh well before that to guarantee no broken images.
 *
 * Margins:
 *   TTL                    = 600s (10 min)  ← backend
 *   refetchInterval        = 480s (8 min)   ← 2 min safety
 *   staleTime              = 420s (7 min)   ← still fresh until then
 *
 * Apply via `...INTERNAL_IMAGE_QUERY_DEFAULTS` on `useQuery` / `useInfiniteQuery`.
 */
const SECOND = 1000

export const INTERNAL_IMAGE_QUERY_DEFAULTS = {
  staleTime: 420 * SECOND,
  refetchInterval: 480 * SECOND,
  refetchIntervalInBackground: true,
} as const
