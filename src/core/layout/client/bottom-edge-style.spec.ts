import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')
const style = (source: string) => source.slice(source.indexOf('<style'))

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return sources(path)
    return /\.(vue|css)$/.test(entry.name) ? [path] : []
  })
}

// With viewport-fit=cover the bottom safe area is no longer zero on an iPhone. The bars anchored
// to the bottom keep their height: they reach the bottom edge without growing under it.
describe('what is anchored to the bottom edge', () => {
  it('never grows by the bottom safe area', () => {
    const growing = sources(resolve(process.cwd(), 'src')).filter((path) =>
      readFileSync(path, 'utf8').includes('safe-area-inset-bottom'),
    )
    expect(growing).toEqual([])
  })

  it('keeps the tab bar exactly as tall as the room the layout leaves under the page', () => {
    expect(style(read('src/core/layout/client/ClientTabBar.vue'))).toMatch(
      /block-size: var\(--tt-tabbar-height\);/,
    )
    expect(read('src/core/layout/client/client-layout.css')).toMatch(
      /padding-block-end: var\(--tt-tabbar-height\);/,
    )
  })

  it('keeps the last line of the gallery cart bar out of the rounded screen corners', () => {
    const bar = style(
      read('src/features/public-gallery/presentation/components/GalleryCartBar/GalleryCartBar.vue'),
    )
    expect(bar).toMatch(
      /padding: calc\(var\(--tt-space-2\) \+ var\(--tt-space-1\) \/ 2\) var\(--tt-space-5\);/,
    )
  })
})
