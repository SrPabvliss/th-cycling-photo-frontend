import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { MESSAGE_CONTAINER_STYLE } from '@/core/ui/discrete-api'

// Every layer of the client area comes from one scale, so a new piece takes its place in the
// order instead of guessing a number.
const ROOT = resolve(process.cwd())
const LAYERS = resolve(ROOT, 'src/core/theme/client/layers.css')
const ORDER = [
  'lift',
  'lift-over',
  'season',
  'tab-bar',
  'header',
  'cart-bar',
  'menu',
  'drawer',
  'sheet',
  'viewer',
  'dialog',
  'toast',
  'route',
]
const CLIENT = [
  'src/features/landing',
  'src/features/public-gallery',
  'src/features/cart',
  'src/features/payments',
  'src/features/pricing',
  'src/features/client-gallery',
  'src/features/delivery',
  'src/features/account',
  'src/features/auth',
  'src/features/legal',
  'src/features/house-spots',
  'src/core/layout/client',
  'src/core/views',
  'src/core/navigation',
  'src/shared/components/confirm-dialog',
  'src/shared/components/BillingSheet',
  'src/shared/photo-viewer',
]
// The organizer profile waits for Pablo's decision on the panel theme.
const WAITING_FOR_DECISION = /account\/presentation\/components\/ProfileForm\//

const files = (path: string): string[] =>
  statSync(path).isDirectory()
    ? readdirSync(path).flatMap((name) => files(join(path, name)))
    : /\.(vue|css)$/.test(path)
      ? [path]
      : []

describe('client layers', () => {
  it('orders the scale from the content up to the route bar', () => {
    expect(existsSync(LAYERS)).toBe(true)
    const values = Object.fromEntries(
      [...readFileSync(LAYERS, 'utf8').matchAll(/--tt-layer-([\w-]+):\s*(\d+);/g)].map(
        ([, name, value]) => [name, Number(value)],
      ),
    )

    expect(Object.keys(values).sort()).toEqual([...ORDER].sort())
    const inOrder = ORDER.map((name) => values[name]!)
    expect(inOrder).toEqual([...inOrder].sort((a, b) => a - b))
    expect(new Set(inOrder).size).toBe(inOrder.length)
  })

  it('takes every z-index of the client from the scale', () => {
    const loose = CLIENT.flatMap((path) => files(resolve(ROOT, path)))
      .map((path) => relative(ROOT, path))
      .filter((path) => !WAITING_FOR_DECISION.test(path))
      .flatMap((path) =>
        [...readFileSync(resolve(ROOT, path), 'utf8').matchAll(/z-index:\s*([^;]+);/g)]
          .filter(([, value]) => !/^(var|calc)\(\s*var\(--tt-layer-|^var\(--tt-layer-/.test(value!))
          .map(([, value]) => `${path}: ${value}`),
      )

    expect(loose).toEqual([])
  })

  it('puts the toasts on their layer, under the route bar', () => {
    expect(String(MESSAGE_CONTAINER_STYLE.zIndex)).toMatch(/^var\(--tt-layer-toast/)
  })
})
