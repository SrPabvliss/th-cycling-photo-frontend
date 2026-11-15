import { describe, expect, it } from 'vitest'

import { finderTarget } from './finder-target'

describe('finderTarget', () => {
  it('goes to the gallery of the race with the plate in the query', () => {
    expect(finderTarget('mama-rumi', '127')).toEqual({
      path: '/gallery/mama-rumi',
      query: { placa: '127' },
    })
  })

  it('goes to the gallery with no query when there is no plate', () => {
    expect(finderTarget('mama-rumi', null)).toEqual({ path: '/gallery/mama-rumi' })
  })

  it('escapes a slug that would break the url', () => {
    expect(finderTarget('a/b?c', null)).toEqual({ path: '/gallery/a%2Fb%3Fc' })
  })
})
