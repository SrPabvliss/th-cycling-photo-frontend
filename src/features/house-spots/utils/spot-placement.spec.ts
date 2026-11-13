import { describe, expect, it } from 'vitest'

import { spotIndexAfter, isSpotTile, withSpotTile } from './spot-placement'

describe('spotIndexAfter', () => {
  it.each([
    [0, 3, null],
    [1, 3, 0],
    [2, 3, 1],
    [3, 3, 2],
    [10, 3, 2],
    [2, 4, 1],
    [9, 4, 3],
  ])('with %i items and the ad after %i, goes after index %s', (length, after, expected) => {
    expect(spotIndexAfter(length, after)).toBe(expected)
  })
})

describe('withSpotTile', () => {
  const items = (count: number) => Array.from({ length: count }, (_, index) => `p${index}`)

  it('adds nothing to a list that is too short', () => {
    const list = items(12)

    expect(withSpotTile(list, 12, 13)).toEqual(list)
  })

  it('puts the tile at its position in a list long enough', () => {
    const list = items(13)
    const result = withSpotTile(list, 12, 13)

    expect(result).toHaveLength(14)
    expect(isSpotTile(result[12])).toBe(true)
    expect(result[11]).toBe('p11')
    expect(result[13]).toBe('p12')
  })

  it('does not change the list it was given', () => {
    const list = items(20)

    withSpotTile(list, 12, 13)

    expect(list).toHaveLength(20)
    expect(list.some(isSpotTile)).toBe(false)
  })
})
