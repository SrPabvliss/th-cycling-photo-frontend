/**
 * Product decisions that switch whole features off. They stay as flags — not deletions — so the
 * code that serves them survives until the call is final.
 *
 * Color classification: turned off in the pipeline on 2026-06-03. Only 459 of 10,994 production
 * photos ever got colors, so filtering by color hides 96% of the catalog instead of narrowing it.
 * Classification runs on bib numbers alone.
 */
export const COLOR_CLASSIFICATION_ENABLED = false
