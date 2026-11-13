/** The ad tile placed among the items of a grid: not an item, nothing to open or pick. */
export interface IAdTile {
  kind: 'ad'
}

const AD_TILE: IAdTile = { kind: 'ad' }

export function isAdTile(value: unknown): value is IAdTile {
  return typeof value === 'object' && value !== null && (value as IAdTile).kind === 'ad'
}

/**
 * Index of the item the ad goes after: after the first `after` items, or after the last when
 * the list is shorter. Null for an empty list: an ad never stands alone.
 */
export function adIndexAfter(length: number, after: number): number | null {
  if (length <= 0) return null
  return Math.min(after, length) - 1
}

/** A copy of `items` with the ad tile at `position`, only when there are at least `minItems`. */
export function withAdTile<T>(items: T[], position: number, minItems: number): (T | IAdTile)[] {
  if (items.length < minItems) return items
  return [...items.slice(0, position), AD_TILE, ...items.slice(position)]
}
