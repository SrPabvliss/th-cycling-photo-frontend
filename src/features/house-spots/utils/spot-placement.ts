/** An ad tile placed among the items of a grid: not an item, nothing to open or pick. */
export interface ISpotTile {
  kind: 'spot'
  /** Which appearance it is, from 0: its key and its seed. */
  n: number
}

export function isSpotTile(value: unknown): value is ISpotTile {
  return typeof value === 'object' && value !== null && (value as ISpotTile).kind === 'spot'
}

/**
 * Index of the item the ad goes after: after the first `after` items, or after the last when
 * the list is shorter. Null for an empty list: an ad never stands alone.
 */
export function spotIndexAfter(length: number, after: number): number | null {
  if (length <= 0) return null
  return Math.min(after, length) - 1
}

/**
 * How often ads come in a list: after the first `first` items, then `second` items further down
 * (`every` when missing), then one every `every`.
 */
export interface ISpotPlan {
  first: number
  second?: number
  every: number
}

/**
 * How many items go before each ad, in a list of `length`. An ad may close the list; a list
 * shorter than `first` gets one at its end; an empty one, none.
 */
export function spotSlots(length: number, plan: ISpotPlan): number[] {
  if (length <= 0) return []
  if (length < plan.first) return [length]
  const slots: number[] = []
  let at = plan.first
  let step = plan.second ?? plan.every
  while (at <= length) {
    slots.push(at)
    at += step
    step = plan.every
  }
  return slots
}

/** Like `spotSlots`, only where at least one item stays after the ad: it never closes the list. */
export function spotSlotsInside(length: number, plan: ISpotPlan): number[] {
  return spotSlots(length, plan).filter((before) => before < length)
}

/**
 * A copy of `items` with one ad tile before each slot of `spotSlots`, numbered from 0. A slot equal
 * to the length closes the list with a tile.
 */
export function withSpotTiles<T>(items: T[], slots: number[]): (T | ISpotTile)[] {
  const result: (T | ISpotTile)[] = []
  let next = 0
  items.forEach((item, index) => {
    if (slots[next] === index) {
      result.push({ kind: 'spot', n: next })
      next += 1
    }
    result.push(item)
  })
  if (items.length > 0 && slots[next] === items.length) result.push({ kind: 'spot', n: next })
  return result
}
