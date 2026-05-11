export const QUEUE_PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 50,
  /** Workspace pre-fetches one page at a time, then pulls the next as the
   * user nears the end of the loaded list. Tuned for fast initial paint. */
  WORKSPACE_PAGE_SIZE: 10,
  /** Trigger fetch of the next page when the active card index reaches
   * loaded.length - PREFETCH_THRESHOLD (so navigating ↓ never stalls). */
  PREFETCH_THRESHOLD: 3,
} as const
