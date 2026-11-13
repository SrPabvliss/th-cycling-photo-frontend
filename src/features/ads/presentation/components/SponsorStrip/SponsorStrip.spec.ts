import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const config = vi.hoisted(() => ({ ADS_ENABLED: true }))
vi.mock('../../../ads-config', async (original) => ({
  ...(await original<typeof import('../../../ads-config')>()),
  get ADS_ENABLED() {
    return config.ADS_ENABLED
  },
}))

const loaders = vi.hoisted(() => ({ 'sponsor-narrow': vi.fn(), 'sponsor-wide': vi.fn() }))
vi.mock('../../../banners/banner-loaders', () => ({
  BANNER_LOADERS: loaders,
  loadMaskUrl: async () => '/helmet-mask.webp',
}))

import { resetBannerCache } from '../../../composables/use-banner-format'
import SponsorStrip from './SponsorStrip.vue'

const slide = (index: number) =>
  `<div class="ss-slide" style="animation-delay: {{d${index}}}"><i>{{maskUrl}}</i>${index}</div>`
const FILE = { html: `<div>${[0, 1, 2, 3].map(slide).join('')}</div>` }

let reveal: () => void = () => {}
class FakeObserver {
  constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
    reveal = () => callback([{ isIntersecting: true }])
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

function setMedia({ wide = false, reduced = false } = {}) {
  window.matchMedia = vi.fn((query: string) => ({
    matches: (reduced && query.includes('reduce')) || (wide && query.includes('min-width')),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    onchange: null,
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia
}

describe('SponsorStrip', () => {
  beforeEach(() => {
    config.ADS_ENABLED = true
    resetBannerCache()
    for (const loader of Object.values(loaders)) {
      loader.mockReset()
      loader.mockResolvedValue({ default: FILE })
    }
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    setMedia()
  })
  afterEach(() => vi.unstubAllGlobals())

  it('reserves its height as one ad region before loading', () => {
    const wrapper = mount(SponsorStrip)

    const region = wrapper.get('[role="region"]')
    expect(region.attributes('aria-label')).toBe('Espacio publicitario')
    expect(region.classes()).toContain('sponsor-strip__frame')
    expect(loaders['sponsor-narrow']).not.toHaveBeenCalled()
  })

  it('loads the narrow strip on a phone and starts each slide at its own point', async () => {
    const wrapper = mount(SponsorStrip)

    reveal()
    await flushPromises()

    const slides = wrapper.findAll('.ss-slide')
    expect(slides).toHaveLength(4)
    expect(
      slides.every((each) => /animation-delay: -\d+\.\d{2}s/.test(each.attributes('style')!)),
    ).toBe(true)
    expect(wrapper.html()).not.toContain('{{')
    expect(loaders['sponsor-wide']).not.toHaveBeenCalled()
  })

  it('loads the wide strip from 768 px', async () => {
    setMedia({ wide: true })
    mount(SponsorStrip)

    reveal()
    await flushPromises()

    expect(loaders['sponsor-wide']).toHaveBeenCalledTimes(1)
  })

  it('keeps its content away from screen readers and the keyboard', async () => {
    const wrapper = mount(SponsorStrip)
    reveal()
    await flushPromises()

    const content = wrapper.get('.sponsor-strip__content')
    expect(content.attributes('aria-hidden')).toBe('true')
    expect(content.attributes('inert')).toBeDefined()
  })

  it('takes no space when it cannot be downloaded, and none when ads are off', async () => {
    loaders['sponsor-narrow'].mockRejectedValue(new Error('blocked'))
    const failed = mount(SponsorStrip)
    reveal()
    await flushPromises()
    expect(failed.html()).toBe('<!--v-if-->')

    config.ADS_ENABLED = false
    resetBannerCache()
    const off = mount(SponsorStrip)
    expect(off.html()).toBe('<!--v-if-->')
  })

  it('holds still on the first slide with reduced motion', async () => {
    setMedia({ reduced: true })
    const wrapper = mount(SponsorStrip)

    reveal()
    await flushPromises()

    expect(wrapper.get('.sponsor-strip').classes()).toContain('sponsor-strip--still')
  })
})
