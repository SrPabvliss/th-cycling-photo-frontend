import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { AxiosError, type AxiosResponse } from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { computed, reactive } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import PhotoTile from '../components/PhotoTile/PhotoTile.vue'
import PublicEventGalleryView from './PublicEventGalleryView.vue'

type Status = 'pending' | 'error' | 'success'
interface IPhoto {
  id: string
  publicSlug: string
  width: number
  height: number
}

const photo = (id: string): IPhoto => ({ id, publicSlug: `slug-${id}`, width: 3, height: 4 })

const baseEvent = {
  id: 'e1',
  slug: 'mama-rumi',
  name: 'Mama Rumi 2026',
  startDate: new Date(2026, 9, 4, 12),
  endDate: new Date(2026, 9, 5, 12),
  provinceName: 'Tungurahua',
  cantonName: 'Baños',
  photoCount: 1240,
  ownerName: 'Titan TV',
  assets: [],
  photoCategories: [] as { id: number; name: string }[],
}

const detail = reactive({
  status: 'success' as Status,
  event: baseEvent as typeof baseEvent | undefined,
  error: null as unknown,
  isFetching: false,
})
const matched = reactive({
  status: 'success' as Status,
  photos: [] as IPhoto[],
  total: 0,
  isPlaceholderData: false,
  isFetching: false,
  hasNextPage: false,
  isFetchingNextPage: false,
})
const noBib = reactive({ photos: [] as IPhoto[] })
const asked = { plate: null as string | null, category: null as number | null }
const refetchDetail = vi.fn()
const refetchPhotos = vi.fn()
const toggle = vi.fn()

vi.mock('../../composables/queries/use-public-event-detail', () => ({
  usePublicEventDetailQuery: () => ({
    data: computed(() => detail.event),
    status: computed(() => detail.status),
    error: computed(() => detail.error),
    isFetching: computed(() => detail.isFetching),
    refetch: refetchDetail,
  }),
}))

const pagesOf = (photos: IPhoto[], total: number) => ({
  pages: [{ items: photos, pagination: { page: 1, limit: 30, total, totalPages: 1 } }],
})

vi.mock('../../composables/queries/use-public-event-photos', () => ({
  usePublicEventPhotosInfinite: (
    _slug: unknown,
    category: { value: number | null },
    plate: { value: string | null },
  ) => ({
    data: computed(() => {
      asked.plate = plate.value
      asked.category = category.value
      return matched.status === 'success' ? pagesOf(matched.photos, matched.total) : undefined
    }),
    status: computed(() => matched.status),
    isPlaceholderData: computed(() => matched.isPlaceholderData),
    isFetching: computed(() => matched.isFetching),
    hasNextPage: computed(() => matched.hasNextPage),
    isFetchingNextPage: computed(() => matched.isFetchingNextPage),
    fetchNextPage: vi.fn(),
    refetch: refetchPhotos,
  }),
  usePublicEventNoBibPhotosInfinite: () => ({
    data: computed(() => pagesOf(noBib.photos, noBib.photos.length)),
    hasNextPage: computed(() => false),
    isFetchingNextPage: computed(() => false),
    fetchNextPage: vi.fn(),
  }),
}))

vi.mock('@/shared/cart', () => ({
  useCartState: () => ({
    status: computed(() => 'success'),
    countFor: () => 0,
    photoIdsFor: () => ['b'],
    isInCart: (id: string) => id === 'b',
    refetch: vi.fn(),
  }),
  useCartActions: () => ({ toggle, remove: vi.fn(), isBusy: () => false }),
}))
vi.mock('@/shared/pricing/use-pricing-tiers', () => ({
  usePricingTiersQuery: () => ({ data: computed(() => undefined) }),
}))

function httpError(status: number) {
  const response = { status, data: {}, headers: {}, config: {} } as AxiosResponse
  return new AxiosError('failed', 'ERR', undefined, undefined, response)
}

const Stub = { render: () => null }

async function mountAt(path = '/gallery/mama-rumi') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Stub },
      { path: '/gallery', component: Stub },
      { path: '/gallery/:slug', component: Stub },
      { path: '/checkout/:eventId', component: Stub },
    ],
  })
  await router.push(path)
  const wrapper = mount(PublicEventGalleryView, {
    global: {
      plugins: [router],
      stubs: { PhotoViewer: true, PublicPhotoGrid: PlainGridStub },
    },
  })
  await flushPromises()
  return { wrapper, router }
}

// The real grid only renders the rows near the viewport, which jsdom cannot measure: this one
// renders every tile, with the same props and events.
const PlainGridStub = {
  name: 'PublicPhotoGrid',
  components: { PhotoTile },
  props: ['photos', 'selectedIds', 'busyIds'],
  emits: ['open', 'toggle'],
  template: `<div class="plain-grid"><PhotoTile v-for="p in photos" :key="p.id" :photo="p"
    :selected="selectedIds.has(p.id)" :busy="busyIds.has(p.id)"
    @open="$emit('open', $event)" @toggle="$emit('toggle', $event)" /></div>`,
}

type Wrapper = Awaited<ReturnType<typeof mountAt>>['wrapper']
const tiles = (wrapper: Wrapper) => wrapper.findAllComponents(PhotoTile)
const buttonNamed = (wrapper: Wrapper, name: string) =>
  wrapper.findAll('button, a').find((button) => button.text() === name)

describe('PublicEventGalleryView', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        disconnect() {}
        unobserve() {}
      },
    )
    setActivePinia(createPinia())
    Object.assign(detail, {
      status: 'success',
      event: { ...baseEvent },
      error: null,
      isFetching: false,
    })
    Object.assign(matched, {
      status: 'success',
      photos: [photo('a'), photo('b'), photo('c')],
      total: 1240,
      isPlaceholderData: false,
      isFetching: false,
      hasNextPage: false,
      isFetchingNextPage: false,
    })
    noBib.photos = []
    refetchDetail.mockClear()
    refetchPhotos.mockClear()
    toggle.mockClear()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  describe('the event', () => {
    it('shows skeletons once it takes long, and nothing before', async () => {
      Object.assign(detail, { status: 'pending', event: undefined })
      const { wrapper } = await mountAt()
      expect(wrapper.find('[aria-label="Cargando fotos"]').exists()).toBe(false)

      await vi.advanceTimersByTimeAsync(400)

      expect(wrapper.find('[aria-label="Cargando fotos"]').exists()).toBe(true)
    })

    it('says it could not be loaded, instead of a blank page, and retries', async () => {
      Object.assign(detail, { status: 'error', event: undefined, error: httpError(500) })
      const { wrapper } = await mountAt()

      expect(wrapper.text()).toContain('No pudimos cargar este evento')
      expect(wrapper.text()).toContain('Puede ser tu conexión.')

      await buttonNamed(wrapper, 'Reintentar')!.trigger('click')
      expect(refetchDetail).toHaveBeenCalledTimes(1)
    })

    it('shows the 404 state when the event does not exist', async () => {
      Object.assign(detail, { status: 'error', event: undefined, error: httpError(404) })
      const { wrapper } = await mountAt()

      expect(wrapper.text()).toContain('Te saliste del camino')
      expect(wrapper.text()).not.toContain('No pudimos cargar este evento')
    })

    it('shows its name, date and place over the cover', async () => {
      const { wrapper } = await mountAt()

      expect(wrapper.get('h1').text()).toBe('Mama Rumi 2026')
      expect(wrapper.get('.gallery-banner__eyebrow').text()).toBe('4–5 oct · Baños, Tungurahua')
    })

    it('says the photos are not there yet, with no cart bar, for an event without photos', async () => {
      detail.event = { ...baseEvent, photoCount: 0 }
      Object.assign(matched, { photos: [], total: 0 })
      const { wrapper } = await mountAt()

      expect(wrapper.text()).toContain('Las fotos todavía no están')
      expect(wrapper.text()).toContain(
        'Este evento es del 4 al 5 de octubre de 2026. Publicamos las fotos después de la carrera.',
      )
      expect(buttonNamed(wrapper, 'Ver otros eventos')?.attributes('href')).toBe('/gallery')
      expect(wrapper.find('.gallery-cart-bar').exists()).toBe(false)
      expect(wrapper.find('form').exists()).toBe(false)
    })
  })

  describe('the viewer', () => {
    const viewer = (wrapper: Wrapper) => wrapper.findComponent({ name: 'PhotoViewer' })

    it('is closed until a photo is opened', async () => {
      const { wrapper } = await mountAt()

      expect(viewer(wrapper).exists()).toBe(false)
    })

    it('opens the photo that was tapped, as a step back can undo', async () => {
      const { wrapper, router } = await mountAt()
      const push = vi.spyOn(router, 'push')

      await tiles(wrapper)[2]!.get('.photo-tile__open').trigger('click')
      await flushPromises()

      expect(router.currentRoute.value.query).toEqual({ foto: 'c' })
      expect(push).toHaveBeenCalledTimes(1)
      expect(viewer(wrapper).props('photoId')).toBe('c')
      expect(
        viewer(wrapper)
          .props('photos')
          .map((each: IPhoto) => each.id),
      ).toEqual(['a', 'b', 'c'])
      expect(viewer(wrapper).props('plate')).toBeNull()
      expect(viewer(wrapper).props('event')).toMatchObject({ id: 'e1', slug: 'mama-rumi' })
    })

    it('moves between photos without piling up history', async () => {
      const { wrapper, router } = await mountAt('/gallery/mama-rumi?foto=a')
      const replace = vi.spyOn(router, 'replace')
      const push = vi.spyOn(router, 'push')

      viewer(wrapper).vm.$emit('update:photoId', 'b')
      await flushPromises()

      expect(router.currentRoute.value.query).toEqual({ foto: 'b' })
      expect(replace).toHaveBeenCalledTimes(1)
      expect(push).not.toHaveBeenCalled()
    })

    it('closes by stepping back when it was opened from the grid', async () => {
      const { wrapper, router } = await mountAt()
      await tiles(wrapper)[0]!.get('.photo-tile__open').trigger('click')
      await flushPromises()
      const back = vi.spyOn(router, 'back')

      viewer(wrapper).vm.$emit('close')
      await flushPromises()

      expect(back).toHaveBeenCalledTimes(1)
    })

    it('closes by cleaning the url when the page was opened straight on a photo', async () => {
      const { wrapper, router } = await mountAt('/gallery/mama-rumi?placa=127&foto=a')

      viewer(wrapper).vm.$emit('close')
      await flushPromises()

      expect(router.currentRoute.value.query).toEqual({ placa: '127' })
      expect(viewer(wrapper).exists()).toBe(false)
    })

    it('carries the plate, and only the results, when opened from a plate search', async () => {
      Object.assign(matched, { photos: [photo('a'), photo('b')], total: 2 })
      noBib.photos = [photo('n1')]
      const { wrapper } = await mountAt('/gallery/mama-rumi?placa=127&foto=b')

      expect(viewer(wrapper).props('plate')).toBe('127')
      expect(
        viewer(wrapper)
          .props('photos')
          .map((each: IPhoto) => each.id),
      ).toEqual(['a', 'b'])
    })

    it('moves among the photos with no plate, unlabelled, when opened from that section', async () => {
      Object.assign(matched, { photos: [photo('a')], total: 1 })
      noBib.photos = [photo('n1'), photo('n2')]
      const { wrapper } = await mountAt('/gallery/mama-rumi?placa=127&foto=n2')

      expect(viewer(wrapper).props('plate')).toBeNull()
      expect(
        viewer(wrapper)
          .props('photos')
          .map((each: IPhoto) => each.id),
      ).toEqual(['n1', 'n2'])
    })

    it('stays closed for a photo the url names but the gallery does not have', async () => {
      const { wrapper } = await mountAt('/gallery/mama-rumi?foto=zzz')

      expect(viewer(wrapper).exists()).toBe(false)
    })
  })

  describe('the photos', () => {
    it('counts them and draws them, with no plate label, outside a search', async () => {
      const { wrapper } = await mountAt()

      expect(wrapper.get('.gallery__count').text()).toBe('1.240 fotos · mostrando 3')
      expect(tiles(wrapper)).toHaveLength(3)
      expect(tiles(wrapper).every((tile) => tile.props('plate') === null)).toBe(true)
      expect(asked.plate).toBeNull()
    })

    it('marks the photos that are in the cart', async () => {
      const { wrapper } = await mountAt()

      expect(tiles(wrapper).map((tile) => tile.props('selected'))).toEqual([false, true, false])
    })

    it('puts a photo in the cart with what the cart shows of its event', async () => {
      const { wrapper } = await mountAt()

      await tiles(wrapper)[0]!.get('.photo-tile__toggle').trigger('click')

      expect(toggle).toHaveBeenCalledWith({
        id: 'a',
        publicSlug: 'slug-a',
        event: {
          id: 'e1',
          name: 'Mama Rumi 2026',
          slug: 'mama-rumi',
          startDate: baseEvent.startDate,
          endDate: baseEvent.endDate,
        },
      })
    })

    it('labels the results of a plate search with the plate', async () => {
      Object.assign(matched, { photos: [photo('a'), photo('b')], total: 2 })
      const { wrapper } = await mountAt('/gallery/mama-rumi?placa=127')

      expect(asked.plate).toBe('127')
      expect(tiles(wrapper).map((tile) => tile.props('plate'))).toEqual(['127', '127'])
      expect(wrapper.get('.gallery__count').text()).toBe('2 fotos con la placa #127')
      expect(
        (wrapper.get('input[aria-label="Número de placa"]').element as HTMLInputElement).value,
      ).toBe('127')
    })

    it('goes back to every photo from "see all"', async () => {
      Object.assign(matched, { photos: [photo('a')], total: 1 })
      const { wrapper, router } = await mountAt('/gallery/mama-rumi?placa=127')

      await buttonNamed(wrapper, 'Ver todas')!.trigger('click')
      await flushPromises()

      expect(router.currentRoute.value.fullPath).toBe('/gallery/mama-rumi')
    })

    it('says no photo has the plate, and why, when the search finds nothing', async () => {
      Object.assign(matched, { photos: [], total: 0 })
      const { wrapper, router } = await mountAt('/gallery/mama-rumi?placa=127')

      expect(wrapper.text()).toContain('No hay fotos con la placa 127')
      expect(wrapper.text()).toContain(
        'Revisa el número. Buscamos la placa exacta, sin coincidencias parciales.',
      )

      await buttonNamed(wrapper, 'Ver todas las fotos')!.trigger('click')
      await flushPromises()
      expect(router.currentRoute.value.fullPath).toBe('/gallery/mama-rumi')
    })

    it('still offers the photos with no plate detected under an empty search', async () => {
      Object.assign(matched, { photos: [], total: 0 })
      noBib.photos = [photo('n1'), photo('n2')]
      const { wrapper } = await mountAt('/gallery/mama-rumi?placa=127')

      expect(wrapper.text()).toContain('No hay fotos con la placa 127')
      expect(wrapper.text()).toContain('También puedes buscarte aquí.')
      expect(tiles(wrapper)).toHaveLength(2)
      expect(tiles(wrapper).every((tile) => tile.props('plate') === null)).toBe(true)
    })

    it('searches the plate that is submitted', async () => {
      const { wrapper, router } = await mountAt()

      await wrapper.get('input[aria-label="Número de placa"]').setValue('45')
      await wrapper.get('form').trigger('submit')
      await flushPromises()

      expect(router.currentRoute.value.fullPath).toBe('/gallery/mama-rumi?placa=45')
    })

    it('rejects a plate that is not a number, in place', async () => {
      const { wrapper, router } = await mountAt()

      await wrapper.get('input[aria-label="Número de placa"]').setValue('12a')
      await wrapper.get('form').trigger('submit')
      await flushPromises()

      expect(wrapper.text()).toContain('Escribe solo el número de tu placa.')
      expect(router.currentRoute.value.fullPath).toBe('/gallery/mama-rumi')
    })

    it('keeps the previous photos, dimmed, while another search loads', async () => {
      const { wrapper } = await mountAt()

      Object.assign(matched, { isPlaceholderData: true, isFetching: true })
      await flushPromises()

      expect(tiles(wrapper)).toHaveLength(3)
      expect(wrapper.get('.load-boundary').attributes('aria-busy')).toBe('true')
    })

    it('keeps the banner and the search when only the photos fail', async () => {
      Object.assign(matched, { status: 'error', photos: [] })
      const { wrapper } = await mountAt()

      expect(wrapper.get('h1').text()).toBe('Mama Rumi 2026')
      expect(wrapper.find('form').exists()).toBe(true)
      expect(wrapper.text()).toContain('No pudimos cargar las fotos')

      await buttonNamed(wrapper, 'Reintentar')!.trigger('click')
      expect(refetchPhotos).toHaveBeenCalledTimes(1)
    })

    it('offers the categories only when the event has more than one', async () => {
      const one = await mountAt()
      expect(one.wrapper.find('.gallery-categories').exists()).toBe(false)

      detail.event = {
        ...baseEvent,
        photoCategories: [
          { id: 1, name: 'Competencia' },
          { id: 2, name: 'Best trick' },
        ],
      }
      const { wrapper } = await mountAt()
      const chips = wrapper.findAll('.gallery-categories button')
      expect(chips.map((chip) => chip.text())).toEqual(['Todas', 'Competencia', 'Best trick'])

      await chips[2]!.trigger('click')
      await flushPromises()
      expect(asked.category).toBe(2)
      expect(chips[2]!.attributes('aria-pressed')).toBe('true')
    })
  })
})
