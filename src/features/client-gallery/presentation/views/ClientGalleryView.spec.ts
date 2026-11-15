import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { AxiosError, type AxiosResponse } from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { computed, effectScope, nextTick, reactive, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import type { IPreviewData } from '../../types/responses/preview-data.response'
import { toCurrentUser } from '@/core/auth/current-user.mapper'
import { useSessionStore } from '@/core/auth/stores/session.store'
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

vi.mock('../components/PreviewConfirm/PreviewConfirm.vue', async () => {
  const { defineComponent, h } = await import('vue')
  return {
    default: defineComponent({
      name: 'PreviewConfirm',
      emits: ['back', 'linkProblem', 'photosChanged', 'photosBought'],
      setup(_, { emit }) {
        return () =>
          h('div', { 'data-test': 'confirm-step' }, [
            h('button', {
              'data-test': 'ordered',
              onClick: () => emit('linkProblem', 'already-ordered'),
            }),
            h('button', {
              'data-test': 'not-available',
              onClick: () => emit('linkProblem', 'not-available'),
            }),
            h('button', { 'data-test': 'changed', onClick: () => emit('photosChanged') }),
            h('button', { 'data-test': 'bought', onClick: () => emit('photosBought') }),
            h('button', { 'data-test': 'back', onClick: () => emit('back') }),
          ])
      },
    }),
  }
})

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
  myOrderId: null,
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

  it('tells the buyer who ordered it that they did, with the way to that order', async () => {
    state.data = PREVIEW({ status: 'converted', myOrderId: 'o9' })
    const { wrapper } = await mountView()

    expect(wrapper.get('h1').text()).toBe('Ya hiciste este pedido')
    expect(wrapper.text()).toContain(
      'Las fotos de esta vista previa ya están pedidas. Revisa el estado en Mis fotos.',
    )
    expect(
      wrapper
        .findAll('a')
        .find((link) => link.text() === 'Ver mi pedido')
        ?.attributes('href'),
    ).toBe('/account/orders/o9')
  })

  // Anyone else (or without a session) learns only that the photos were ordered: nothing about
  // someone else's order.
  it('tells anyone else only that the photos of the link were ordered', async () => {
    state.data = PREVIEW({ status: 'converted', myOrderId: null })
    const { wrapper } = await mountView()

    expect(wrapper.get('h1').text()).toBe('Las fotos de este enlace ya se pidieron')
    expect(wrapper.text()).toContain(
      'Si crees que es un error, escríbele a quien te compartió el enlace.',
    )
    expect(wrapper.text()).not.toContain('Ya hiciste')
    expect(wrapper.findAll('a').map((link) => link.attributes('href'))).not.toContain(
      '/account/orders',
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

  async function atConfirmStep() {
    useSessionStore().setSession(
      'token',
      toCurrentUser({
        id: 'u1',
        email: 'a@b.c',
        firstName: 'Ana',
        lastName: null,
        role: 'customer',
      }),
    )
    const mountedView = await mountView()
    await mountedView.wrapper.findAll('button[aria-pressed]')[0]!.trigger('click')
    await mountedView.wrapper
      .findAll('button')
      .find((each) => each.text() === 'Continuar')!
      .trigger('click')
    await flushPromises()
    return mountedView
  }

  it('goes to the confirm step with a session', async () => {
    const { wrapper } = await atConfirmStep()

    expect(wrapper.find('[data-test="confirm-step"]').exists()).toBe(true)
  })

  it('says the preview was already ordered when the order says so', async () => {
    const { wrapper } = await atConfirmStep()

    await wrapper.get('[data-test="ordered"]').trigger('click')

    expect(wrapper.get('h1').text()).toBe('Las fotos de este enlace ya se pidieron')
  })

  it('says the preview is no longer available', async () => {
    const { wrapper } = await atConfirmStep()

    await wrapper.get('[data-test="not-available"]').trigger('click')

    expect(wrapper.get('h1').text()).toBe('Esta vista previa ya no está disponible')
    expect(wrapper.text()).toContain('Pídele al organizador que te la comparta de nuevo.')
  })

  it('reads the preview again and goes back to picking when its photos changed', async () => {
    const { wrapper } = await atConfirmStep()

    await wrapper.get('[data-test="changed"]').trigger('click')
    await flushPromises()

    expect(refetch).toHaveBeenCalled()
    expect(wrapper.find('[data-test="confirm-step"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Algunas fotos ya no están en esta vista previa')
    expect(wrapper.text()).toContain('Revisa tu selección y confirma de nuevo.')
  })

  it('goes back to picking with the photos still chosen', async () => {
    const { wrapper } = await atConfirmStep()

    await wrapper.get('[data-test="back"]').trigger('click')

    expect(wrapper.findAll('button[aria-pressed="true"]')).toHaveLength(1)
  })

  function signIn() {
    useSessionStore().setSession(
      'token',
      toCurrentUser({
        id: 'u1',
        email: 'a@b.c',
        firstName: 'Ana',
        lastName: null,
        role: 'customer',
      }),
    )
  }

  // Back from signing in, the preview is still in the cache and the session already open:
  // nothing changes after the screen mounts, and it must still go on to confirming.
  it('goes straight to confirming when it comes back from signing in with photos chosen', async () => {
    const { usePhotoSelection } = await import('../../composables/use-photo-selection')
    const scope = effectScope()
    scope.run(() => usePhotoSelection(ref('tok'), ref(['a', 'b', 'c'])).toggle('a'))
    await nextTick()
    scope.stop()
    signIn()

    const { wrapper } = await mountView()

    expect(wrapper.find('[data-test="confirm-step"]').exists()).toBe(true)
  })

  describe('photos already bought', () => {
    beforeEach(() => {
      state.data = PREVIEW({
        photos: [
          { id: 'a', url: 'u/a' },
          { id: 'b', url: 'u/b', alreadyPurchased: true },
          { id: 'c', url: 'u/c' },
        ],
      })
    })

    it('marks them and does not let them be chosen, not even all at once', async () => {
      const { wrapper } = await mountView()

      const tiles = wrapper.findAll('.preview-tile')
      expect(tiles[1]!.text()).toContain('Ya la compraste')
      expect(tiles[1]!.find('button[aria-pressed]').exists()).toBe(false)

      await wrapper
        .findAll('button')
        .find((each) => each.text() === 'Elegir todas')!
        .trigger('click')
      expect(wrapper.findAll('button[aria-pressed="true"]')).toHaveLength(2)
      expect(wrapper.text()).toContain('2 fotos elegidas')
    })

    it('reads the preview again and goes back to picking when the order turns one down', async () => {
      signIn()
      const { wrapper } = await mountView()
      await wrapper.findAll('button[aria-pressed]')[0]!.trigger('click')
      await wrapper
        .findAll('button')
        .find((each) => each.text() === 'Continuar')!
        .trigger('click')
      await flushPromises()

      await wrapper.get('[data-test="bought"]').trigger('click')
      await flushPromises()

      expect(refetch).toHaveBeenCalled()
      expect(wrapper.find('[data-test="confirm-step"]').exists()).toBe(false)
      const alert = wrapper.get('[data-test="preview-bought"]')
      expect(alert.classes()).toContain('form-alert--bad')
      expect(alert.text()).toContain('Ya compraste alguna de las fotos que elegiste')
    })
  })
})
