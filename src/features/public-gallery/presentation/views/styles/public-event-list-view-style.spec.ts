import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(
  resolve(
    process.cwd(),
    'src/features/public-gallery/presentation/views/styles/public-event-list-view.css',
  ),
  'utf8',
)
const desktop = css.slice(css.lastIndexOf('@media (min-width: 768px)'))

describe('events list look from 768', () => {
  // Long choices never crush the search: the row breaks in two first.
  it('breaks the search and the filters into two lines before the search gets too narrow', () => {
    expect(desktop).toMatch(/\.event-list__tools \{[^}]*flex-wrap: wrap/)
    expect(desktop).toMatch(/\.event-list__search \{[^}]*flex: 1 1 var\(--event-list-search-min\)/)
    expect(css).toMatch(/--event-list-search-min: calc\(var\(--tt-ilu-inline\) \* 1\.5\)/)
  })

  it('lets the filters break into lines too, inside the row', () => {
    expect(desktop).toMatch(/:deep\(\.event-filters\) \{[^}]*flex-wrap: wrap/)
    expect(desktop).toMatch(/:deep\(\.event-filters\) \{[^}]*max-inline-size: 100%/)
  })
})
