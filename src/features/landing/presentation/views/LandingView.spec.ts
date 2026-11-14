import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { computed, reactive } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import type { IPublicEventFilters, IPublicEventListItem } from '@/shared/public-events'
vi.mock('@/features/house-spots/presentation/components/HouseSpot/HouseSpot.vue', async () => ({
  default: (await import('@/features/house-spots/testing/spot-stubs')).HouseSpotStub,
}))

import LandingView from './LandingView.vue'

type Status = 'pending' | 'error' | 'success'

const recent = reactive({
  status: 'success' as Status,
  isFetching: false,
  events: [] as IPublicEventListItem[],
})
const refetchRecent = vi.fn()

vi.mock('@/shared/public-events', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/public-events')>()),
  // The screen asks for the recent events (no filters); the finder asks for the races.
  usePublicEventsQuery: (filters?: IPublicEventFilters) =>
    filters?.hasPhotos
      ? {
          status: computed(() => 'success'),
          isFetching: computed(() => false),
          events: computed(() => []),
          refetch: vi.fn(),
        }
      : {
          status: computed(() => recent.status),
          isFetching: computed(() => recent.isFetching),
          events: computed(() => recent.events),
          refetch: refetchRecent,
        },
}))

vi.mock('@/shared/pricing/use-pricing-tiers', () => ({
  usePricingTiersQuery: () => ({ data: computed(() => undefined), isError: computed(() => false) }),
}))

function event(slug: string): IPublicEventListItem {
  return {
    slug,
    name: `Evento ${slug}`,
    startDate: '2026-10-04',
    endDate: '2026-10-04',
    placeLabel: 'Ambato, Tungurahua',
    photoCount: 12,
    ownerName: 'Titan TV',
    coverUrl: null,
    eventTypeId: 3,
    eventTypeName: 'Downhill',
  }
}

const Stub = { render: () => null }

async function mountView() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Stub },
      { path: '/gallery', component: Stub },
      { path: '/gallery/:slug', component: Stub },
    ],
  })
  await router.push('/')
  const wrapper = mount(LandingView, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

type Wrapper = Awaited<ReturnType<typeof mountView>>
const cards = (wrapper: Wrapper) => wrapper.findAll('a.event-card')
const skeletons = (wrapper: Wrapper) => wrapper.findAll('div.event-card[aria-hidden="true"]')
const headings = (wrapper: Wrapper) => wrapper.findAll('h2').map((heading) => heading.text())

describe('LandingView', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    Object.assign(recent, {
      status: 'success',
      isFetching: false,
      events: [event('a'), event('b')],
    })
    refetchRecent.mockClear()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('gives the house carousel its own band right after the price band', async () => {
    const wrapper = await mountView()

    const ad = wrapper.get('[data-test="house-spot"]')
    expect(ad.attributes('data-format')).toBe('AB')
    expect(ad.attributes('data-seed')).toBe('3')
    // The price band needs the tiers, which this spec leaves out: the ad is the band before the
    // closing manifesto, after the recent events.
    expect(ad.element.nextElementSibling?.classList.contains('landing__manifesto')).toBe(true)
    expect(ad.element.previousElementSibling?.textContent).toContain('Eventos recientes')
    expect(ad.classes()).toContain('landing__band')
  })

  it('opens with the hero and the finder', async () => {
    const wrapper = await mountView()

    expect(wrapper.get('h1').text().replace(/\s+/g, ' ')).toBe('Tu carrera, tus fotos')
    expect(wrapper.text()).toContain(
      'Elige tu carrera, escribe tu placa y llévate tus fotos en alta calidad.',
    )
    expect(wrapper.find('form.photo-finder').exists()).toBe(true)
  })

  it('gives the hero image its text, its room and its priority', async () => {
    const hero = (await mountView()).get('.landing__hero img')

    expect(hero.attributes('alt')).toBe('Ciclista en una pista de downhill')
    expect(hero.attributes('fetchpriority')).toBe('high')
    expect(hero.attributes('width')).toBeDefined()
    expect(hero.attributes('height')).toBeDefined()
  })

  it('shows the recent events with a way to see them all', async () => {
    const wrapper = await mountView()

    expect(headings(wrapper)).toContain('Eventos recientes')
    expect(cards(wrapper).map((card) => card.attributes('href'))).toEqual([
      '/gallery/a',
      '/gallery/b',
    ])
    const all = wrapper.findAll('a').find((link) => link.text() === 'Ver todos')
    expect(all?.attributes('href')).toBe('/gallery')
  })

  it('shows eight recent events at most', async () => {
    recent.events = Array.from({ length: 12 }, (_, index) => event(`e${index}`))
    const wrapper = await mountView()

    expect(cards(wrapper)).toHaveLength(8)
    expect(cards(wrapper)[0]!.attributes('href')).toBe('/gallery/e0')
  })

  it('shows four skeletons once the events take long, and none before', async () => {
    Object.assign(recent, { status: 'pending', events: [] })
    const wrapper = await mountView()
    expect(skeletons(wrapper)).toHaveLength(0)

    await vi.advanceTimersByTimeAsync(400)

    expect(skeletons(wrapper)).toHaveLength(4)
    expect(wrapper.find('[aria-label="Cargando eventos"]').exists()).toBe(true)
  })

  it('keeps the hero and the finder when the events fail, and says so in place', async () => {
    Object.assign(recent, { status: 'error', events: [] })
    const wrapper = await mountView()

    expect(wrapper.get('h1').text()).toContain('Tu carrera')
    expect(wrapper.find('form.photo-finder').exists()).toBe(true)
    const alert = wrapper.get('[data-test="recent-problem"]')
    expect(alert.classes()).toContain('form-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('No pudimos cargar los eventos')
    expect(alert.text()).toContain('Puede ser tu conexión.')
    expect(cards(wrapper)).toHaveLength(0)
  })

  it('asks for the events again when retrying', async () => {
    Object.assign(recent, { status: 'error', events: [] })
    const wrapper = await mountView()

    await wrapper.get('[data-test="recent-problem"] button').trigger('click')

    expect(wrapper.get('[data-test="recent-problem"] button').text()).toBe('Reintentar')
    expect(refetchRecent).toHaveBeenCalledTimes(1)
  })

  it('has no recent events section when there are no events', async () => {
    recent.events = []
    const wrapper = await mountView()

    expect(headings(wrapper)).not.toContain('Eventos recientes')
    expect(wrapper.text()).not.toContain('Ver todos')
  })

  it('closes with the manifesto', async () => {
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('11 años en los Andes')
    expect(wrapper.text()).toContain('Poderosos dioses que gobiernan las montañas')
    expect(wrapper.text()).toContain(
      'De los Andes ecuatorianos, con sus caballos de acero. Fotografiamos cada competencia de downhill en alta calidad.',
    )
  })

  it('no longer carries the big logo in the hero', async () => {
    const wrapper = await mountView()

    expect(wrapper.find('.titan-logo').exists()).toBe(false)
  })
})
