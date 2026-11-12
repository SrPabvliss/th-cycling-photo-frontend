/**
 * Timing of every loading indicator (rule R1 of the loading states guide): nothing shows for a wait
 * shorter than the delay, and what does show stays long enough not to flicker. Awana has no token
 * for these two, so they live here.
 */
export const LOADING_SHOW_DELAY_MS = 400
export const LOADING_MIN_VISIBLE_MS = 400
