import tokens from '@/core/theme/client/awana-tokens.json'

/** How long a search field waits after the last key before asking the server. */
export const SEARCH_DEBOUNCE_MS = Number.parseInt(tokens.motion.searchDebounce, 10)
