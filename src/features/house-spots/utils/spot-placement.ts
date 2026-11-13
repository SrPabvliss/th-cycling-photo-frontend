/** The ad tile placed among the items of a grid: not an item, nothing to open or pick. */
export interface ISpotTile {
  kind: 'spot'
}

const SPOT_TILE: ISpotTile = { kind: 'spot' }

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

/** A copy of `items` with the ad tile at `position`, only when there are at least `minItems`. */
export function withSpotTile<T>(items: T[], position: number, minItems: number): (T | ISpotTile)[] {
  if (items.length < minItems) return items
  return [...items.slice(0, position), SPOT_TILE, ...items.slice(position)]
}
