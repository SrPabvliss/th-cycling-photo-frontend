import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// On desktop the race, the plate and the button share a row. An error gets the row below, so the
// fields keep their height and the button stays under the pointer.
const source = readFileSync(
  resolve(
    process.cwd(),
    'src/features/landing/presentation/components/PhotoFinder/PhotoFinder.vue',
  ),
  'utf8',
)
const desktop = source.slice(source.indexOf('@media (min-width: 768px)'))

describe('photo finder look', () => {
  it('gives the field errors and the load problem their own rows on desktop', () => {
    expect(desktop).toMatch(
      /grid-template-areas:\s*'race plate submit'\s*'race-error plate-error \.'\s*'problem problem problem'/,
    )
  })

  it('keeps an error from widening the column of its field', () => {
    expect(source).toMatch(/\.photo-finder__error \{[^}]*contain: inline-size/)
  })

  it('marks the field in error with the danger ink, as every client field does', () => {
    expect(source).toMatch(
      /\.photo-finder__race:has\(\[aria-invalid='true'\]\),\s*\.photo-finder__plate:has\(\[aria-invalid='true'\]\) \{[^}]*outline: thin solid var\(--tt-danger-ink\)/,
    )
  })
})
