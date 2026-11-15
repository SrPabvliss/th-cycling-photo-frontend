import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const config = vi.hoisted(() => ({ SPOTS_ENABLED: true }))
vi.mock('../../../spots-config', async (original) => ({
  ...(await original<typeof import('../../../spots-config')>()),
  get SPOTS_ENABLED() {
    return config.SPOTS_ENABLED
  },
}))

const loaders = vi.hoisted(() => ({ 'presenter-narrow': vi.fn(), 'presenter-wide': vi.fn() }))
vi.mock('../../../pieces/piece-loaders', () => ({
  PIECE_LOADERS: loaders,
  loadMaskUrl: async () => '/helmet-mask.webp',
}))

import { createMemoryHistory, createRouter, type Router } from 'vue-router'

import { resetPieceCache } from '../../../composables/use-spot-pieces'
import EventPresenterStrip from './EventPresenterStrip.vue'

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

describe('EventPresenterStrip', () => {
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

  it('reserves its height as one ad region before loading', () => {
    const wrapper = mount(EventPresenterStrip, withRouter())

    const region = wrapper.get('[role="region"]')
    expect(region.attributes('aria-label')).toBe('Espacio publicitario')
    expect(region.classes()).toContain('presenter-strip__frame')
    expect(loaders['presenter-narrow']).not.toHaveBeenCalled()
  })

  it('loads the narrow strip on a phone and starts each slide at its own point', async () => {
    const wrapper = mount(EventPresenterStrip, withRouter())

    reveal()
    await flushPromises()

    const slides = wrapper.findAll('.ss-slide')
    expect(slides).toHaveLength(4)
    expect(
      slides.every((each) => /animation-delay: -\d+\.\d{2}s/.test(each.attributes('style')!)),
    ).toBe(true)
    expect(wrapper.html()).not.toContain('{{')
    expect(loaders['presenter-wide']).not.toHaveBeenCalled()
  })

  it('loads the wide strip from 768 px', async () => {
    setMedia({ wide: true })
    mount(EventPresenterStrip, withRouter())

    reveal()
    await flushPromises()

    expect(loaders['presenter-wide']).toHaveBeenCalledTimes(1)
  })

  it('keeps its content away from screen readers and the keyboard', async () => {
    const wrapper = mount(EventPresenterStrip, withRouter())
    reveal()
    await flushPromises()

    const content = wrapper.get('.presenter-strip__content')
    expect(content.attributes('aria-hidden')).toBe('true')
    expect(content.attributes('inert')).toBeDefined()
  })

  it('takes no space when it cannot be downloaded, and none when ads are off', async () => {
    loaders['presenter-narrow'].mockRejectedValue(new Error('blocked'))
    const failed = mount(EventPresenterStrip, withRouter())
    reveal()
    await flushPromises()
    expect(failed.html()).toBe('<!--v-if-->')

    config.SPOTS_ENABLED = false
    resetPieceCache()
    const off = mount(EventPresenterStrip, withRouter())
    expect(off.html()).toBe('<!--v-if-->')
  })

  it('holds still on the first slide with reduced motion', async () => {
    setMedia({ reduced: true })
    const wrapper = mount(EventPresenterStrip, withRouter())

    reveal()
    await flushPromises()

    expect(wrapper.get('.presenter-strip').classes()).toContain('presenter-strip--still')
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

    const wrapper = mount(EventPresenterStrip, { props: {}, ...withRouter() })

    expect(wrapper.html()).toBe('<!--v-if-->')
    problem.unmount()
    host.remove()
  })

  it('is one link, always to the brands page: every slide of the strip speaks to brands', async () => {
    const wrapper = mount(EventPresenterStrip, withRouter())
    reveal()
    await flushPromises()

    const link = wrapper.get('a.presenter-strip__link')
    expect(wrapper.findAll('a')).toHaveLength(1)
    expect(link.attributes('href')).toBe('/anunciate')
    expect(link.attributes('aria-label')).toBe('Anúnciate en Titan')

    await link.trigger('click', { button: 0 })
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/anunciate')
  })
})
