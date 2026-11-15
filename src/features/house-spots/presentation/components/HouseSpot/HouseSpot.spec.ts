import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const config = vi.hoisted(() => ({ SPOTS_ENABLED: true }))
vi.mock('../../../spots-config', async (original) => ({
  ...(await original<typeof import('../../../spots-config')>()),
  get SPOTS_ENABLED() {
    return config.SPOTS_ENABLED
  },
}))

const loaders = vi.hoisted(() => ({ A: vi.fn(), B: vi.fn(), C: vi.fn(), D: vi.fn() }))
vi.mock('../../../pieces/piece-loaders', () => ({
  PIECE_LOADERS: loaders,
  loadMaskUrl: async () => '/helmet-mask.webp',
}))

import { createMemoryHistory, createRouter, type Router } from 'vue-router'

import { resetPieceCache } from '../../../composables/use-spot-pieces'
import { SPOTS_STARTED_AT } from '../../../utils/spot-rotation'
import HouseSpot from './HouseSpot.vue'

const STYLE = (name: string) =>
  `<div style="aspect-ratio: 32 / 5"><b>${name}: {{title}}</b><span>{{text}}</span></div>`
const FILE = {
  styles: {
    topo: STYLE('topo'),
    casco: STYLE('casco'),
    textura: STYLE('textura'),
    facetado: STYLE('facetado'),
  },
}

// The slot loads when it comes near the screen: the test decides when that is.
let reveal: () => void = () => {}
class FakeObserver {
  constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
    reveal = () => callback([{ isIntersecting: true }])
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

function setReducedMotion(reduced: boolean) {
  window.matchMedia = vi.fn((query: string) => ({
    matches: reduced && query.includes('reduce'),
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

function mountSpot(props: { format: 'A' | 'B' | 'C' | 'D' | 'AB'; seed: number }) {
  router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Page },
      { path: '/anunciate', component: Page },
      { path: '/organizadores', component: Page },
    ],
  })
  return mount(HouseSpot, { props, global: { plugins: [router] } })
}

describe('HouseSpot', () => {
  beforeEach(() => {
    config.SPOTS_ENABLED = true
    resetPieceCache()
    for (const loader of Object.values(loaders)) loader.mockReset()
    loaders.D.mockResolvedValue({ default: FILE })
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    setReducedMotion(false)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('reserves the space of its format before loading anything', () => {
    const wrapper = mountSpot({ format: 'D', seed: 31 })

    const region = wrapper.get('[role="region"]')
    expect(region.attributes('aria-label')).toBe('Espacio publicitario')
    expect(region.attributes('aria-roledescription')).toBe('carrusel')
    expect(wrapper.get('.house-spot__frame').attributes('style')).toContain('aspect-ratio: 32 / 5')
    expect(loaders.D).not.toHaveBeenCalled()
  })

  it('loads near the screen and shows four styles, the organizer message on one of them', async () => {
    const wrapper = mountSpot({ format: 'D', seed: 31 })

    reveal()
    await flushPromises()

    const slides = wrapper.findAll('.house-spot__slide')
    expect(slides).toHaveLength(4)
    const organizer = slides.filter((slide) => slide.text().includes('¿Organizas una carrera?'))
    expect(organizer).toHaveLength(1)
    expect(slides.indexOf(organizer[0]!)).toBe(31 % 4)
    expect(slides[0]!.text()).toContain('topo: Tu marca aquí')
  })

  it('hides its moving content from screen readers and from the keyboard, all but one link', async () => {
    const wrapper = mountSpot({ format: 'D', seed: 31 })
    reveal()
    await flushPromises()

    const content = wrapper.get('.house-spot__slides')
    expect(content.attributes('aria-hidden')).toBe('true')
    expect(content.attributes('inert')).toBeDefined()
    expect(wrapper.findAll('a, button, input, [tabindex]')).toHaveLength(1)
    expect(wrapper.get('a').element.contains(content.element)).toBe(true)
  })

  it('leaves nothing behind when the banners cannot be downloaded', async () => {
    loaders.D.mockRejectedValue(new Error('blocked'))
    const wrapper = mountSpot({ format: 'D', seed: 31 })

    reveal()
    await flushPromises()

    expect(wrapper.html()).toBe('<!--v-if-->')
    expect(wrapper.emitted('unavailable')).toHaveLength(1)
  })

  it('shows nothing and downloads nothing when ads are switched off', async () => {
    config.SPOTS_ENABLED = false
    const wrapper = mountSpot({ format: 'D', seed: 31 })

    reveal()
    await flushPromises()

    expect(wrapper.html()).toBe('<!--v-if-->')
    expect(loaders.D).not.toHaveBeenCalled()
  })

  it('shows one still style with reduced motion', async () => {
    setReducedMotion(true)
    const wrapper = mountSpot({ format: 'D', seed: 31 })

    reveal()
    await flushPromises()

    expect(wrapper.findAll('.house-spot__slide')).toHaveLength(1)
    expect(wrapper.find('.house-spot__dots').exists()).toBe(false)
  })

  it('shows position dots only on the wide carousels', async () => {
    loaders.A.mockResolvedValue({ default: FILE })
    const wrapper = mountSpot({ format: 'A', seed: 3 })

    reveal()
    await flushPromises()

    expect(wrapper.get('.house-spot__dots').attributes('aria-hidden')).toBe('true')
    expect(wrapper.findAll('.house-spot__dot')).toHaveLength(4)
  })

  it('stays away while the screen shows a problem', async () => {
    const { defineComponent, h, ref, nextTick } = await import('vue')
    const { useScreenProblem } = await import('@/core/layout/client/screen-problem')
    const Problem = defineComponent({
      setup() {
        const root = ref<HTMLElement | null>(null)
        useScreenProblem(root)
        return () => h('div', { ref: root }, 'No pudimos cargar esto')
      },
    })
    const host = document.createElement('main')
    host.className = 'client-layout__main'
    document.body.appendChild(host)
    const problem = mount(Problem, { attachTo: host })
    await nextTick()

    const wrapper = mountSpot({ format: 'D', seed: 31 })

    expect(wrapper.html()).toBe('<!--v-if-->')
    problem.unmount()
    host.remove()
  })

  describe('destination', () => {
    // Seed 31: the organizer message is on slide 3, which is the one on screen when the visit starts.
    const at = (seconds: number) => vi.setSystemTime(SPOTS_STARTED_AT + seconds * 1000)
    const link = (wrapper: ReturnType<typeof mountSpot>) => wrapper.get('a.house-spot__frame')

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] })
      at(0)
    })
    afterEach(() => vi.useRealTimers())

    it('leads to the page of the slide on screen, named after it, through the four slides', async () => {
      const wrapper = mountSpot({ format: 'D', seed: 31 })
      reveal()
      await flushPromises()

      const seen = []
      for (let slide = 0; slide < 4; slide++) {
        seen.push([link(wrapper).attributes('href'), link(wrapper).attributes('aria-label')])
        vi.advanceTimersByTime(6000)
        await flushPromises()
      }

      expect(seen).toEqual([
        ['/organizadores', 'Titan cubre tu carrera'],
        ['/anunciate', 'Anúnciate en Titan'],
        ['/anunciate', 'Anúnciate en Titan'],
        ['/anunciate', 'Anúnciate en Titan'],
      ])
    })

    it('goes, on a click, to the page of the slide on screen at that moment', async () => {
      const wrapper = mountSpot({ format: 'D', seed: 31 })
      reveal()
      await flushPromises()

      at(6.5)
      await link(wrapper).trigger('click', { button: 0 })
      await flushPromises()
      expect(router.currentRoute.value.path).toBe('/anunciate')

      at(24)
      await link(wrapper).trigger('click', { button: 0 })
      await flushPromises()
      expect(router.currentRoute.value.path).toBe('/organizadores')
    })

    it('follows a paused animation rather than the clock', async () => {
      const wrapper = mountSpot({ format: 'D', seed: 31 })
      reveal()
      await flushPromises()
      // Stopped on slide 3 (organizers) while the clock already says slide 1 (brands).
      const stopped = [0.5, 0.75, 0.9, 0.1]
      wrapper.findAll('.house-spot__slide').forEach((slide, index) => {
        Object.assign(slide.element, {
          getAnimations: () => [
            { effect: { getComputedTiming: () => ({ progress: stopped[index] }) } },
          ],
        })
      })

      at(9)
      await link(wrapper).trigger('click', { button: 0 })
      await flushPromises()

      expect(router.currentRoute.value.path).toBe('/organizadores')
      vi.advanceTimersByTime(1000)
      await flushPromises()
      expect(link(wrapper).attributes('aria-label')).toBe('Titan cubre tu carrera')
    })

    it('leads to the page of its only slide with reduced motion', async () => {
      setReducedMotion(true)
      const wrapper = mountSpot({ format: 'D', seed: 31 })
      reveal()
      await flushPromises()

      expect(link(wrapper).attributes('href')).toBe('/anunciate')
      await link(wrapper).trigger('click', { button: 0 })
      await flushPromises()
      expect(router.currentRoute.value.path).toBe('/anunciate')
    })

    it('leaves a click with a modifier to the browser (new tab)', async () => {
      const wrapper = mountSpot({ format: 'D', seed: 31 })
      reveal()
      await flushPromises()

      const event = new MouseEvent('click', { button: 0, ctrlKey: true, cancelable: true })
      link(wrapper).element.dispatchEvent(event)
      await flushPromises()

      expect(event.defaultPrevented).toBe(false)
      expect(router.currentRoute.value.path).toBe('/')
    })
  })
})
