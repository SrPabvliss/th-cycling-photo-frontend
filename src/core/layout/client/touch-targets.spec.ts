import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// On a phone every control a thumb aims at answers on 44 px (--tt-control-m), even when it is
// drawn smaller: tt-hit-area widens the touch zone without moving anything.
const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

const SMALL_CONTROLS: [file: string, marker: RegExp][] = [
  ['src/core/layout/client/ClientLogo.vue', /class="client-logo tt-hit-area"/],
  [
    'src/features/public-gallery/presentation/components/EventFilterBar/EventFilterBar.vue',
    /class="event-filter__open tt-hit-area"/,
  ],
  [
    'src/features/public-gallery/presentation/components/EventFilterBar/EventFilterBar.vue',
    /class="event-filter__clear tt-hit-area"/,
  ],
  [
    'src/features/public-gallery/presentation/components/EventFilterBar/EventFilterBar.vue',
    /class="event-filters__clear-all tt-hit-area"/,
  ],
  [
    'src/features/public-gallery/presentation/components/PublicGalleryFilterBar/PublicGalleryFilterBar.vue',
    /class="gallery-categories__chip tt-hit-area"/,
  ],
  [
    'src/features/public-gallery/presentation/components/PhotoTile/PhotoTile.vue',
    /class="photo-tile__toggle tt-hit-area"/,
  ],
  [
    'src/features/pricing/presentation/components/TierChips/TierChips.vue',
    /class="tier-chips tt-hit-area"/,
  ],
  [
    'src/features/auth/presentation/components/AuthTabs/AuthTabs.vue',
    /class="auth-tabs__tab tt-hit-area"/,
  ],
  ['src/features/auth/presentation/views/LoginView.vue', /class="login-form__link tt-hit-area"/],
  ['src/core/views/NotFoundView.vue', /<NButton text class="tt-hit-area"/],
  ['src/core/views/AccessDeniedView.vue', /<NButton\s+text\s+class="tt-hit-area"/],
  ['src/core/views/ServerErrorView.vue', /<NButton text class="tt-hit-area"/],
]

describe('touch targets', () => {
  it('widens the touch zone to the control size, without moving anything', () => {
    const css = read('src/core/layout/client/client-layout.css')

    expect(css).toMatch(/\.tt-hit-area\s*\{[^}]*position:\s*relative/)
    expect(css).toMatch(/\.tt-hit-area::after\s*\{[^}]*var\(--tt-control-m\)/)
  })

  it.each(SMALL_CONTROLS)('%s answers on the full control size', (file, marker) => {
    expect(read(file)).toMatch(marker)
  })
})
