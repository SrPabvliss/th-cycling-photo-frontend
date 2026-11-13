import { describe, expect, it } from 'vitest'

import { adIndexAfter, isAdTile, withAdTile } from './ad-placement'

describe('adIndexAfter', () => {
  it.each([
    [0, 3, null],
    [1, 3, 0],
    [2, 3, 1],
    [3, 3, 2],
    [10, 3, 2],
    [2, 4, 1],
    [9, 4, 3],
  ])('with %i items and the ad after %i, goes after index %s', (length, after, expected) => {
    expect(adIndexAfter(length, after)).toBe(expected)
  })
})

describe('withAdTile', () => {
  const items = (count: number) => Array.from({ length: count }, (_, index) => `p${index}`)

  it('adds nothing to a list that is too short', () => {
    const list = items(12)

    expect(withAdTile(list, 12, 13)).toEqual(list)
  })

  it('puts the tile at its position in a list long enough', () => {
    const list = items(13)
    const result = withAdTile(list, 12, 13)

    expect(result).toHaveLength(14)
    expect(isAdTile(result[12])).toBe(true)
    expect(result[11]).toBe('p11')
    expect(result[13]).toBe('p12')
  })

  it('does not change the list it was given', () => {
    const list = items(20)

    withAdTile(list, 12, 13)

    expect(list).toHaveLength(20)
    expect(list.some(isAdTile)).toBe(false)
  })
})
