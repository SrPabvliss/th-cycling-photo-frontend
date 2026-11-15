import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const config = vi.hoisted(() => ({ SPOTS_ENABLED: true }))
vi.mock('../../../spots-config', async (original) => ({
  ...(await original<typeof import('../../../spots-config')>()),
  get SPOTS_ENABLED() {
    return config.SPOTS_ENABLED
  },
}))

const loaders = vi.hoisted(() => ({ 'season-narrow': vi.fn(), 'season-wide': vi.fn() }))
vi.mock('../../../pieces/piece-loaders', () => ({
  PIECE_LOADERS: loaders,
  loadMaskUrl: async () => '/helmet-mask.webp',
}))

import { createMemoryHistory, createRouter, type Router } from 'vue-router'

import { resetPieceCache } from '../../../composables/use-spot-pieces'
import { SPOTS_STARTED_AT } from '../../../utils/spot-rotation'
import SeasonBar from './SeasonBar.vue'

const STYLE = (name: string) => `<div><b>${name}: {{titleM}}</b><i>{{maskUrl}}</i></div>`
const FILE = {
  frame: '<div><span>TEMPORADA</span><div class="frame-slides">{{slides}}</div></div>',
  styles: {
    topo: STYLE('topo'),
    casco: STYLE('casco'),
    textura: STYLE('textura'),
    facetado: STYLE('facetado'),
  },
}

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

const Page = { render: () => null }
let router: Router

function withRouter() {
  router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Page },
      { path: '/anunciate', component: Page },
      { path: '/organizadores', component: Page },
    ],
  })
  return { global: { plugins: [router] } }
}

describe('SeasonBar', () => {
  beforeEach(() => {
    config.SPOTS_ENABLED = true
    resetPieceCache()
    for (const loader of Object.values(loaders)) {
      loader.mockReset()
      loader.mockResolvedValue({ default: FILE })
    }
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    setMedia()
  })
  afterEach(() => vi.unstubAllGlobals())

  it('reserves its height as an ad region before loading', () => {
    const wrapper = mount(SeasonBar, withRouter())

    const region = wrapper.get('[role="region"]')
    expect(region.attributes('aria-label')).toBe('Espacio publicitario')
    expect(region.classes()).toContain('season-bar__frame')
    expect(loaders['season-narrow']).not.toHaveBeenCalled()
  })

  it('loads the narrow bar on a phone and rotates four styles inside its frame', async () => {
    const wrapper = mount(SeasonBar, withRouter())

    reveal()
    await flushPromises()

    expect(loaders['season-narrow']).toHaveBeenCalledTimes(1)
    expect(loaders['season-wide']).not.toHaveBeenCalled()
    const slides = wrapper.findAll('.frame-slides .season-bar__slide')
    expect(slides).toHaveLength(4)
    expect(slides.filter((slide) => slide.text().includes('Cubrimos tu carrera'))).toHaveLength(1)
    expect(wrapper.text()).toContain('TEMPORADA')
    expect(wrapper.html()).not.toContain('{{')
  })

  it('loads the wide bar from 768 px', async () => {
    setMedia({ wide: true })
    mount(SeasonBar, withRouter())

    reveal()
    await flushPromises()

    expect(loaders['season-wide']).toHaveBeenCalledTimes(1)
    expect(loaders['season-narrow']).not.toHaveBeenCalled()
  })

  it('keeps its content away from screen readers and the keyboard', async () => {
    const wrapper = mount(SeasonBar, withRouter())
    reveal()
    await flushPromises()

    const content = wrapper.get('.season-bar__content')
    expect(content.attributes('aria-hidden')).toBe('true')
    expect(content.attributes('inert')).toBeDefined()
  })

  it('takes no space when the bar cannot be downloaded', async () => {
    loaders['season-narrow'].mockRejectedValue(new Error('blocked'))
    const wrapper = mount(SeasonBar, withRouter())

    reveal()
    await flushPromises()

    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('shows nothing and downloads nothing when ads are off', async () => {
    config.SPOTS_ENABLED = false
    const wrapper = mount(SeasonBar, withRouter())

    reveal()
    await flushPromises()

    expect(wrapper.html()).toBe('<!--v-if-->')
    expect(loaders['season-narrow']).not.toHaveBeenCalled()
  })

  it('stays on one style with reduced motion', async () => {
    setMedia({ reduced: true })
    const wrapper = mount(SeasonBar, withRouter())

    reveal()
    await flushPromises()

    expect(wrapper.findAll('.season-bar__slide')).toHaveLength(1)
  })

  describe('destination', () => {
    // Seed 13: the organizer message is on slide 1, the one on screen when the visit starts.
    const at = (seconds: number) => vi.setSystemTime(SPOTS_STARTED_AT + seconds * 1000)

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] })
      at(0)
    })
    afterEach(() => vi.useRealTimers())

    it('is one link to the page of the slide on screen, through the four slides', async () => {
      const wrapper = mount(SeasonBar, withRouter())
      reveal()
      await flushPromises()

      const seen = []
      for (let slide = 0; slide < 4; slide++) {
        const link = wrapper.get('a.season-bar__link')
        seen.push([link.attributes('href'), link.attributes('aria-label')])
        vi.advanceTimersByTime(6000)
        await flushPromises()
      }

      expect(wrapper.findAll('a')).toHaveLength(1)
      expect(seen).toEqual([
        ['/organizadores', 'Titan cubre tu carrera'],
        ['/anunciate', 'Anúnciate en Titan'],
        ['/anunciate', 'Anúnciate en Titan'],
        ['/anunciate', 'Anúnciate en Titan'],
      ])
    })

    it('goes, on a click, to the page of the slide on screen at that moment', async () => {
      const wrapper = mount(SeasonBar, withRouter())
      reveal()
      await flushPromises()

      at(7)
      await wrapper.get('a.season-bar__link').trigger('click', { button: 0 })
      await flushPromises()

      expect(router.currentRoute.value.path).toBe('/anunciate')
    })
  })
})
