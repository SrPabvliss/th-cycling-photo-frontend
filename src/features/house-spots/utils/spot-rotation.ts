/** One full turn of the four styles: 6 seconds each. */
const CYCLE_S = 24
const SLIDE_S = 6
/** Where the first slide starts, so the first seconds are not a fade in. */
const LEAD_S = 2

/** The moment the visit began: every carousel counts from here, so repainting never restarts one. */
export const SPOTS_STARTED_AT = Date.now()

/** Which of the four slides carries the message for organizers; the other three, for brands. */
export function organizerSlide(seed: number): number {
  return seed % 4
}

/**
 * The negative animation delay of a slide (the demo's adDelay): where in its 24 s cycle it is
 * now. The seed shifts each placement so two carousels on one screen do not move together.
 */
export function slideDelay(index: number, seed: number, startedAt: number, now: number): string {
  const elapsed = (now - startedAt) / 1000 + seed * SLIDE_S + LEAD_S
  const position = (((elapsed - index * SLIDE_S) % CYCLE_S) + CYCLE_S) % CYCLE_S
  return `-${position.toFixed(2)}s`
}

/** Fills the {{markers}} of a generated banner. Markers without a value are left empty. */
export function fillPiece(html: string, values: Record<string, string>): string {
  return html.replace(/\{\{(\w+)\}\}/g, (_, key: string) => values[key] ?? '')
}
