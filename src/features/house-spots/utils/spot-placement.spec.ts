import { describe, expect, it } from 'vitest'

import {
  isSpotTile,
  spotIndexAfter,
  spotSlots,
  spotSlotsInside,
  withSpotTiles,
} from './spot-placement'

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

describe('spotSlots', () => {
  const EVENTS = { first: 3, every: 6 }
  const GALLERY = { first: 7, second: 18, every: 30 }

  it.each([
    [0, []],
    [1, [1]],
    [2, [2]],
    [3, [3]],
    [4, [3]],
    [8, [3]],
    [9, [3, 9]],
    [16, [3, 9, 15]],
  ])('events: with %i items the ads go after %j', (length, expected) => {
    expect(spotSlots(length, EVENTS)).toEqual(expected)
  })

  it('gallery: the second comes 18 after the first, then one every 30', () => {
    expect(spotSlots(200, GALLERY)).toEqual([7, 25, 55, 85, 115, 145, 175])
  })

  it('a short list gets one ad at its end; an empty one, none', () => {
    expect(spotSlots(5, GALLERY)).toEqual([5])
    expect(spotSlots(0, GALLERY)).toEqual([])
  })

  it('an ad can close the list: the caller decides whether that is allowed', () => {
    expect(spotSlots(7, GALLERY)).toEqual([7])
    expect(spotSlots(25, GALLERY)).toEqual([7, 25])
  })
})

describe('spotSlotsInside', () => {
  const GALLERY = { first: 7, second: 18, every: 30 }

  it.each([
    [7, []],
    [8, [7]],
    [12, [7]],
    [25, [7]],
    [26, [7, 25]],
    [86, [7, 25, 55, 85]],
  ])(
    'with %i photos the ads go before photos %j (0-based), never closing it',
    (length, expected) => {
      expect(spotSlotsInside(length, GALLERY)).toEqual(expected)
    },
  )

  // 18 and 30 are not round on purpose: each next ad moves to another column.
  it.each([3, 5])('never puts two ads in a row in the same column, with %i columns', (columns) => {
    const columnsOfAds = spotSlotsInside(200, GALLERY).map((before, n) => (before + n) % columns)

    columnsOfAds.slice(1).forEach((column, index) => {
      expect(column).not.toBe(columnsOfAds[index])
    })
  })
})

describe('withSpotTiles', () => {
  const items = (count: number) => Array.from({ length: count }, (_, index) => `p${index}`)

  it('puts one numbered tile before each slot, keeping the items in order', () => {
    const result = withSpotTiles(items(30), [7, 25])

    expect(result).toHaveLength(32)
    expect(result[7]).toEqual({ kind: 'spot', n: 0 })
    expect(result[26]).toEqual({ kind: 'spot', n: 1 })
    expect(result.filter((cell) => !isSpotTile(cell))).toEqual(items(30))
  })

  it('leaves the cells already placed where they were when more items arrive', () => {
    const before = withSpotTiles(
      items(24),
      spotSlotsInside(24, { first: 7, second: 18, every: 30 }),
    )
    const after = withSpotTiles(items(48), spotSlotsInside(48, { first: 7, second: 18, every: 30 }))

    expect(after.slice(0, before.length)).toEqual(before)
  })
})
