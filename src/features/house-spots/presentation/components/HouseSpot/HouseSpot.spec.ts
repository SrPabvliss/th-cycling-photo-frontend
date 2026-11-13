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

import { resetPieceCache } from '../../../composables/use-spot-pieces'
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
    const wrapper = mount(HouseSpot, { props: { format: 'D', seed: 31 } })

    const region = wrapper.get('[role="region"]')
    expect(region.attributes('aria-label')).toBe('Espacio publicitario')
    expect(region.attributes('aria-roledescription')).toBe('carrusel')
    expect(region.attributes('style')).toContain('aspect-ratio: 32 / 5')
    expect(loaders.D).not.toHaveBeenCalled()
  })

  it('loads near the screen and shows four styles, the organizer message on one of them', async () => {
    const wrapper = mount(HouseSpot, { props: { format: 'D', seed: 31 } })

    reveal()
    await flushPromises()

    const slides = wrapper.findAll('.house-spot__slide')
    expect(slides).toHaveLength(4)
    const organizer = slides.filter((slide) => slide.text().includes('¿Organizas una carrera?'))
    expect(organizer).toHaveLength(1)
    expect(slides.indexOf(organizer[0]!)).toBe(31 % 4)
    expect(slides[0]!.text()).toContain('topo: Tu marca aquí')
  })

  it('hides its moving content from screen readers and from the keyboard', async () => {
    const wrapper = mount(HouseSpot, { props: { format: 'D', seed: 31 } })
    reveal()
    await flushPromises()

    const content = wrapper.get('.house-spot__slides')
    expect(content.attributes('aria-hidden')).toBe('true')
    expect(content.attributes('inert')).toBeDefined()
    expect(wrapper.find('a, button, input, [tabindex]').exists()).toBe(false)
  })

  it('leaves nothing behind when the banners cannot be downloaded', async () => {
    loaders.D.mockRejectedValue(new Error('blocked'))
    const wrapper = mount(HouseSpot, { props: { format: 'D', seed: 31 } })

    reveal()
    await flushPromises()

    expect(wrapper.html()).toBe('<!--v-if-->')
    expect(wrapper.emitted('unavailable')).toHaveLength(1)
  })

  it('shows nothing and downloads nothing when ads are switched off', async () => {
    config.SPOTS_ENABLED = false
    const wrapper = mount(HouseSpot, { props: { format: 'D', seed: 31 } })

    reveal()
    await flushPromises()

    expect(wrapper.html()).toBe('<!--v-if-->')
    expect(loaders.D).not.toHaveBeenCalled()
  })

  it('shows one still style with reduced motion', async () => {
    setReducedMotion(true)
    const wrapper = mount(HouseSpot, { props: { format: 'D', seed: 31 } })

    reveal()
    await flushPromises()

    expect(wrapper.findAll('.house-spot__slide')).toHaveLength(1)
    expect(wrapper.find('.house-spot__dots').exists()).toBe(false)
  })

  it('shows position dots only on the wide carousels', async () => {
    loaders.A.mockResolvedValue({ default: FILE })
    const wrapper = mount(HouseSpot, { props: { format: 'A', seed: 3 } })

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

    const wrapper = mount(HouseSpot, { props: { format: 'D', seed: 31 } })

    expect(wrapper.html()).toBe('<!--v-if-->')
    problem.unmount()
    host.remove()
  })
})
