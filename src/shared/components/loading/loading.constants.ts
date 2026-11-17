/**
 * Timing of every loading indicator (rule R1 of the loading states guide): nothing shows for a wait
 * shorter than the delay, and what does show stays long enough not to flicker. Awana has no token
 * for these two, so they live here.
 *
 * Sized for the real trip to the API (about 300 ms on an open connection, 550 to 900 ms on a new
 * one): the delay only spares answers that are already there (cache, local network), so the wait
 * is never an empty area, and the minimum is the most a ready answer can be held back.
 */
export const LOADING_SHOW_DELAY_MS = 100
export const LOADING_MIN_VISIBLE_MS = 200
