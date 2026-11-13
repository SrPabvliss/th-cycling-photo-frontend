import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// The keyboard always shows where it is, in light and dark and over the dark surfaces.
const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

describe('focus ring', () => {
  it('draws a focus ring on every control the keyboard reaches, except text fields', () => {
    expect(read('src/core/layout/client/client-layout.css')).toMatch(
      /\[data-tt-area='client'\] :focus-visible:not\(input, textarea, select\)\s*\{[^}]*outline: medium solid var\(--tt-focus-ring, var\(--tt-primary\)\)/,
    )
  })

  it.each([
    ['src/core/layout/client/ClientFooter.vue', '.client-footer'],
    ['src/shared/photo-viewer/PhotoViewerFrame.vue', '.photo-viewer'],
    [
      'src/features/public-gallery/presentation/components/GalleryHero/GalleryHero.vue',
      '.gallery-hero',
    ],
    ['src/features/public-gallery/presentation/components/PhotoTile/PhotoTile.vue', '.photo-tile'],
    [
      'src/features/client-gallery/presentation/components/PreviewTile/PreviewTile.vue',
      '.preview-tile',
    ],
  ])('%s draws the focus ring in white over its dark surface', (file, root) => {
    const rule = new RegExp(`\\${root} \\{[^}]*--tt-focus-ring: var\\(--tt-on-navy\\)`)
    expect(read(file)).toMatch(rule)
  })
})
