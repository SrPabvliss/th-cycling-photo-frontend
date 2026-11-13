import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import PublicGalleryFilterBar from '../components/PublicGalleryFilterBar/PublicGalleryFilterBar.vue'
import PublicEventGalleryView from './PublicEventGalleryView.vue'

const photosAskedWith = vi.fn()

vi.mock('../../composables/queries/use-public-event-detail', () => ({
  usePublicEventDetailQuery: () => ({
    data: ref({
      id: 'e1',
      slug: 'mama-rumi',
      name: 'Mama Rumi 2026',
      startDate: new Date(2026, 9, 4),
      endDate: new Date(2026, 9, 4),
      provinceName: null,
      cantonName: null,
      photoCount: 0,
      ownerName: 'Titan TV',
      assets: [],
      photoCategories: [],
    }),
    isPending: ref(false),
  }),
}))

const emptyStream = () => ({
  data: ref({ pages: [] }),
  isPending: ref(false),
  fetchNextPage: vi.fn(),
  hasNextPage: ref(false),
  isFetchingNextPage: ref(false),
})

vi.mock('../../composables/queries/use-public-event-photos', () => ({
  usePublicEventPhotosInfinite: (
    _slug: unknown,
    _category: unknown,
    plate: { value: string | null },
  ) => {
    photosAskedWith(plate.value)
    return emptyStream()
  },
  usePublicEventNoBibPhotosInfinite: () => emptyStream(),
}))

vi.mock('@/shared/composables/use-add-to-cart', () => ({
  useAddToCart: () => ({ mutate: vi.fn() }),
}))
vi.mock('@/shared/composables/use-remove-from-cart', () => ({
  useRemoveFromCart: () => ({ mutate: vi.fn() }),
}))

const Stub = { render: () => null }

async function mountAt(path: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/gallery', name: 'public-event-list', component: Stub },
      { path: '/gallery/:slug', component: Stub },
    ],
  })
  await router.push(path)
  const wrapper = mount(PublicEventGalleryView, {
    global: { plugins: [router], stubs: { PhotoLightbox: true, PublicPhotoGrid: true } },
  })
  await flushPromises()
  return wrapper
}

describe('PublicEventGalleryView, plate from the url', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    photosAskedWith.mockClear()
  })

  it('opens already searching the plate the home finder sent, as an exact match', async () => {
    const wrapper = await mountAt('/gallery/mama-rumi?placa=127')

    expect(wrapper.getComponent(PublicGalleryFilterBar).props('bibNumber')).toBe('127')
    expect(wrapper.getComponent(PublicGalleryFilterBar).props('bibMatch')).toBe('exact')
    expect(photosAskedWith).toHaveBeenCalledWith('127')
  })

  it('opens with no plate when the url carries none', async () => {
    const wrapper = await mountAt('/gallery/mama-rumi')

    expect(wrapper.getComponent(PublicGalleryFilterBar).props('bibNumber')).toBe('')
  })

  it.each(['12a', '12345678901', ''])('ignores a plate it cannot use (%s)', async (value) => {
    const wrapper = await mountAt(`/gallery/mama-rumi?placa=${value}`)

    expect(wrapper.getComponent(PublicGalleryFilterBar).props('bibNumber')).toBe('')
  })
})
