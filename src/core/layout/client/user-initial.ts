const LETTER_OR_DIGIT = /^[\p{L}\p{N}]/u

// Intl.Segmenter is in every browser the app supports, but not in the TypeScript lib it targets.
interface IGraphemeSegmenter {
  segment(text: string): Iterable<{ segment: string }>
}
type SegmenterConstructor = new (
  locale: string,
  options: { granularity: 'grapheme' },
) => IGraphemeSegmenter

/** Splits by what a person reads as one character, so an accent or an emoji is never cut in half. */
function graphemesOf(text: string): string[] {
  const Segmenter = (Intl as unknown as { Segmenter?: SegmenterConstructor }).Segmenter
  if (!Segmenter) return Array.from(text)

  return Array.from(
    new Segmenter('es', { granularity: 'grapheme' }).segment(text),
    (part) => part.segment,
  )
}

/**
 * Initial for an avatar: the first letter or digit of the name, in upper case. Null when the name
 * has none (empty, only spaces, only symbols), so the caller can draw something else.
 */
export function userInitial(name: string | null | undefined): string | null {
  if (!name) return null

  const first = graphemesOf(name.trim().normalize('NFC')).find((grapheme) =>
    LETTER_OR_DIGIT.test(grapheme),
  )

  return first ? first.toLocaleUpperCase('es') : null
}
