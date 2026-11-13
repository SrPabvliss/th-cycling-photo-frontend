import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { AxiosError, type AxiosResponse } from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import type { IPreviewData } from '../../types/responses/preview-data.response'
import ClientGalleryView from './ClientGalleryView.vue'

const state = reactive({
  status: 'success' as 'pending' | 'error' | 'success',
  data: undefined as IPreviewData | undefined,
  error: null as unknown,
})
const refetch = vi.fn()

vi.mock('../../composables/queries/use-preview-gallery', () => ({
  usePreviewGallery: () => ({
    status: computed(() => state.status),
    data: computed(() => state.data),
    error: computed(() => state.error),
    isFetching: ref(false),
    refetch,
  }),
}))
vi.mock('@/shared/pricing/use-pricing-tiers', () => ({
  usePricingTiersQuery: () => ({
    data: computed(() => ({
      currency: 'USD',
      source: 'default',
      tiers: [
        { minQty: 1, maxQty: 2, pricePerPhoto: 4 },
        { minQty: 3, maxQty: null, pricePerPhoto: 3 },
      ],
    })),
  }),
}))

const PREVIEW = (overrides: Partial<IPreviewData> = {}): IPreviewData => ({
  token: 'tok',
  eventId: 'e1',
  eventTypeId: 1,
  organizerName: 'Titan Racing',
  eventName: 'Mama Rumi 2026',
  startDate: new Date(2026, 9, 4),
  endDate: new Date(2026, 9, 5),
  status: 'active',
  expiresAt: new Date(2026, 11, 1),
  photos: [
    { id: 'a', url: 'u/a' },
    { id: 'b', url: 'u/b' },
    { id: 'c', url: 'u/c' },
  ],
  ...overrides,
})
function apiError(status: number, messageKey?: string) {
  const data = messageKey ? { error: { messageKey } } : {}
  const response = { status, data, headers: {}, config: {} } as AxiosResponse
  return new AxiosError('failed', 'ERR_BAD_REQUEST', undefined, undefined, response)
}

const mounted: { unmount(): void }[] = []
async function mountView() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/preview/:token', component: ClientGalleryView },
      { path: '/:any(.*)*', component: { render: () => null } },
    ],
  })
  await router.push('/preview/tok')
  mounted.push(
    mount(
      { template: '<RouterView />' },
      { attachTo: document.body, global: { plugins: [router] } },
    ),
  )
  await flushPromises()
  return { wrapper: new DOMWrapper(document.body), router }
}

describe('ClientGalleryView', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    sessionStorage.clear()
    localStorage.clear()
    setActivePinia(createPinia())
    Object.assign(state, { status: 'success', data: PREVIEW(), error: null })
    refetch.mockReset()
  })
  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
  })

  it('lets the buyer pick photos and shows their total', async () => {
    const { wrapper } = await mountView()

    for (const box of wrapper.findAll('button[aria-pressed]')) await box.trigger('click')

    expect(wrapper.text()).toContain('3 fotos elegidas · $9,00')
    expect(wrapper.findAll('button').some((each) => each.text() === 'Continuar')).toBe(true)
  })

  it('says an expired link has expired', async () => {
    Object.assign(state, {
      status: 'error',
      data: undefined,
      error: apiError(410, 'preview.link_expired'),
    })
    const { wrapper } = await mountView()

    expect(wrapper.get('h1').text()).toBe('Este enlace ya venció')
    expect(wrapper.text()).toContain('Pídele al organizador que te comparta uno nuevo.')
  })

  it('says a link that does not exist is not valid', async () => {
    Object.assign(state, { status: 'error', data: undefined, error: apiError(404) })
    const { wrapper } = await mountView()

    expect(wrapper.get('h1').text()).toBe('Este enlace no es válido')
  })

  it('says a preview already ordered was ordered', async () => {
    state.data = PREVIEW({ status: 'converted' })
    const { wrapper } = await mountView()

    expect(wrapper.get('h1').text()).toBe('Ya hiciste este pedido')
    expect(wrapper.text()).toContain(
      'Las fotos de esta vista previa ya están pedidas. Revisa el estado en Mis fotos.',
    )
  })

  it('offers to retry any other failure', async () => {
    Object.assign(state, { status: 'error', data: undefined, error: apiError(500) })
    const { wrapper } = await mountView()

    await wrapper
      .findAll('button')
      .find((each) => each.text().includes('Reintentar'))!
      .trigger('click')
    expect(refetch).toHaveBeenCalled()
  })

  it('says when the link has no photos yet', async () => {
    state.data = PREVIEW({ photos: [] })
    const { wrapper } = await mountView()

    expect(wrapper.text()).toContain('Todavía no hay fotos en este enlace')
  })

  it('sends a buyer without a session to sign in, coming back to this link', async () => {
    const { wrapper, router } = await mountView()

    await wrapper.findAll('button[aria-pressed]')[0]!.trigger('click')
    await wrapper
      .findAll('button')
      .find((each) => each.text() === 'Continuar')!
      .trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/login?redirect=/preview/tok')
  })
})
