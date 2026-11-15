import type { PieceMessage } from '../pieces/piece-copy'
import { organizerSlide } from './spot-rotation'

/** Share of a slide's 24 s cycle during which it is the one on screen (6 s of 24). */
const ON_SCREEN = 0.25
const SLIDE_S = 6
const LEAD_S = 2
const SLIDES = 4

/** Which message a slide carries: organizers on one of the four, brands on the rest. */
export function slideMessage(index: number, seed: number): PieceMessage {
  return index === organizerSlide(seed) ? 'organizador' : 'marca'
}

/**
 * The slide on screen by the clock: the same count `slideDelay` starts the animations from. It is
 * right while the animations run without stopping.
 */
export function clockSlide(seed: number, startedAt: number, now: number): number {
  const elapsed = (now - startedAt) / 1000 + seed * SLIDE_S + LEAD_S
  return Math.floor(elapsed / SLIDE_S) % SLIDES
}

/**
 * The slide on screen as the browser has it: the one whose animation is in the first quarter of
 * its cycle. While two cross, the one coming in is there and the one leaving is past it. A paused
 * animation keeps its place, so this stays right where a clock would not. Without animations to
 * read (none running, or no support), the clock decides.
 */
export function visibleSlide(slides: Element[], fallback: number): number {
  for (const [index, slide] of slides.entries()) {
    const animation = slide.getAnimations?.()[0]
    const progress = animation?.effect?.getComputedTiming().progress
    if (progress === null || progress === undefined) return fallback
    if (progress < ON_SCREEN) return index
  }
  return fallback
}
