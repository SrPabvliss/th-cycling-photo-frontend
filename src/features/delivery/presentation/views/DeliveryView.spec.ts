import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { computed, reactive, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import type { IDeliveryData } from '../../types/responses/delivery-data.response'
import type { DeliveryProblem } from '../../utils/delivery-problem'
vi.mock('@/features/house-spots/presentation/components/HouseSpot/HouseSpot.vue', async () => ({
  default: (await import('@/features/house-spots/testing/spot-stubs')).HouseSpotStub,
}))

const online = ref(true)
vi.mock('@/core/network/use-online', () => ({ useOnline: () => online }))

import DeliveryView from './DeliveryView.vue'

const state = reactive({
  status: 'success' as 'pending' | 'error' | 'success',
  data: undefined as IDeliveryData | undefined,
  problem: null as DeliveryProblem | null,
})
const refetch = vi.fn()
const ensureFresh = vi.fn()
const downloadFile = vi.fn()
const calls: string[] = []

vi.mock('../../composables/queries/use-delivery', () => ({
  useDeliveryQuery: () => ({
    status: computed(() => state.status),
    data: computed(() => state.data),
    problem: computed(() => state.problem),
    isFetching: ref(false),
    refetch,
    ensureFresh,
  }),
}))
vi.mock('@/shared/downloads/download-file', () => ({
  downloadFile: (url: string, name: string) => downloadFile(url, name),
}))

const photos = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: `p${index}`,
    filename: `foto-${index}.jpg`,
    downloadUrl: `https://storage/${index}?signed`,
    fileSize: 1,
    thumbnailUrl: index === 1 ? null : `https://cdn/t/${index}`,
    viewUrl: index === 1 ? null : `https://cdn/v/${index}`,
  }))
const DATA = (count = 3, expiresAt: Date | null = new Date(2026, 10, 30)): IDeliveryData => ({
  token: 't',
  eventName: 'Mama Rumi 2026',
  status: 'active',
  expiresAt,
  downloadCount: 0,
  invoiced: true,
  photos: photos(count),
})

const mounted: { unmount(): void }[] = []
async function mountView() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/delivery/:token', component: DeliveryView },
      { path: '/:any(.*)*', component: { render: () => null } },
    ],
  })
  await router.push('/delivery/tok')
  mounted.push(
    mount(
      { template: '<RouterView />' },
      { attachTo: document.body, global: { plugins: [router] } },
    ),
  )
  await flushPromises()
  return new DOMWrapper(document.body)
}
const button = (wrapper: DOMWrapper<Element>, name: string) =>
  wrapper.findAll('button, a').find((each) => each.text().replace(/\s+/g, ' ').trim() === name)

describe('DeliveryView', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    Object.assign(state, { status: 'success', data: DATA(), problem: null })
    calls.length = 0
    refetch.mockReset()
    ensureFresh.mockReset().mockImplementation(async () => void calls.push('fresh'))
    downloadFile.mockReset().mockImplementation(async (url: string) => void calls.push(url))
  })
  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
  })

  it('shows the photos with their thumbnails, never the full file', async () => {
    const wrapper = await mountView()

    expect(wrapper.get('h1').text()).toBe('Tus fotos de Mama Rumi 2026')
    expect(wrapper.text()).toContain('Listas para descargar')
    expect(wrapper.text()).toContain('Sin marca de agua y en alta calidad.')
    const sources = wrapper.findAll('img').map((image) => image.attributes('src'))
    expect(sources).toEqual(['https://cdn/t/0', 'https://cdn/t/2'])
    expect(sources.some((src) => src?.includes('storage'))).toBe(false)
    expect(wrapper.text()).toContain('foto-1.jpg')
  })

  it('says when the link ends only when the api says it', async () => {
    const withDate = await mountView()
    expect(withDate.text()).toContain('Este enlace vence el 30 de noviembre de 2026.')
    while (mounted.length) mounted.pop()!.unmount()

    state.data = DATA(3, null)
    const without = await mountView()
    expect(without.text()).not.toContain('Este enlace vence')
  })

  it('downloads them all with fresh addresses first', async () => {
    state.data = DATA(8)
    const wrapper = await mountView()

    await button(wrapper, 'Descargar las 8 fotos')!.trigger('click')
    await flushPromises()

    expect(calls[0]).toBe('fresh')
    expect(downloadFile).toHaveBeenCalledTimes(8)
  })

  it('names a single photo in singular', async () => {
    state.data = DATA(1)
    const wrapper = await mountView()

    expect(button(wrapper, 'Descargar la foto')).toBeDefined()
  })

  it('downloads one photo with fresh addresses first, and says when it fails', async () => {
    const wrapper = await mountView()

    await wrapper.findAll('button[aria-label="Descargar foto"]')[0]!.trigger('click')
    await flushPromises()
    expect(calls).toEqual(['fresh', 'https://storage/0?signed'])

    downloadFile.mockRejectedValue(new Error('offline'))
    await wrapper.findAll('button[aria-label="Descargar foto"]')[0]!.trigger('click')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain(
      'No pudimos descargar la foto. Intenta de nuevo.',
    )
  })

  it('drops the failed photo notice once the network is back', async () => {
    online.value = false
    downloadFile.mockRejectedValue(new Error('offline'))
    const wrapper = await mountView()
    await wrapper.findAll('button[aria-label="Descargar foto"]')[0]!.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('No pudimos descargar la foto. Intenta de nuevo.')

    online.value = true
    await flushPromises()

    expect(wrapper.text()).not.toContain('No pudimos descargar la foto.')
    downloadFile.mockReset()
  })

  it.each(['network', 'unknown'] as const)(
    'keeps the photos when a refresh fails (%s), says so with a retry',
    async (problem) => {
      Object.assign(state, { status: 'error', data: DATA(3), problem })
      const wrapper = await mountView()

      expect(wrapper.findAll('button[aria-label="Descargar foto"]')).toHaveLength(3)
      expect(wrapper.text()).not.toContain('No pudimos mostrar tus fotos')
      const alert = wrapper.get('[data-test="refresh-problem"]')
      expect(alert.classes()).toContain('form-alert')
      expect(alert.text()).toContain('No pudimos actualizar tus fotos')

      await alert.get('button').trigger('click')
      expect(refetch).toHaveBeenCalledTimes(1)
    },
  )

  it('keeps the photos when a refresh hits the rate limit, and says to wait', async () => {
    Object.assign(state, { status: 'error', data: DATA(3), problem: 'rate-limited' })
    const wrapper = await mountView()

    expect(wrapper.findAll('button[aria-label="Descargar foto"]')).toHaveLength(3)
    const alert = wrapper.get('[data-test="refresh-problem"]')
    expect(alert.text()).toContain('Demasiados intentos')
    expect(alert.text()).toContain('Espera un minuto antes de volver a intentarlo.')
    expect(alert.find('button').exists()).toBe(false)
  })

  it.each(['expired', 'access-limit'] as const)(
    'changes the screen when a refresh finds the link %s',
    async (problem) => {
      Object.assign(state, { status: 'error', data: DATA(3), problem })
      const wrapper = await mountView()

      expect(wrapper.findAll('button[aria-label="Descargar foto"]')).toHaveLength(0)
      expect(wrapper.find('[data-test="refresh-problem"]').exists()).toBe(false)
    },
  )

  it('says it could not load at all when nothing was ever read', async () => {
    Object.assign(state, { status: 'error', data: undefined, problem: 'network' })
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('No pudimos mostrar tus fotos')
  })

  it('ends with the house carousel, after the way to keep them at hand', async () => {
    const wrapper = await mountView()

    const ad = wrapper.get('[data-test="house-spot"]')
    expect(ad.attributes('data-format')).toBe('AB')
    expect(ad.attributes('data-seed')).toBe('27')
    expect(ad.element.previousElementSibling?.classList.contains('delivery__hint')).toBe(true)
    expect(ad.element.nextElementSibling).toBeNull()
  })

  it('points to Mis fotos to keep them at hand', async () => {
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('¿Quieres tenerlas siempre a mano?')
    expect(button(wrapper, 'Inicia sesión')?.attributes('href')).toBe(
      '/login?redirect=/account/orders',
    )
  })

  it.each<[DeliveryProblem, string, string]>([
    [
      'expired',
      'Este enlace ya venció',
      'Si compraste las fotos con tu cuenta, siguen en Mis fotos.',
    ],
    [
      'access-limit',
      'Este enlace llegó a su límite de usos',
      'Por seguridad, cada enlace se puede abrir un número limitado de veces. Si compraste las fotos con tu cuenta, siguen en Mis fotos.',
    ],
    [
      'not-found',
      'Este enlace no es válido',
      'Puede que esté incompleto. Ábrelo otra vez desde el correo o el mensaje que te llegó.',
    ],
  ])('shows its own screen for %s', async (problem, title, text) => {
    Object.assign(state, { status: 'error', data: undefined, problem })
    const wrapper = await mountView()

    expect(wrapper.get('h1').text()).toBe(title)
    expect(wrapper.text()).toContain(text)
  })

  it('asks to wait after too many tries, with nothing to press', async () => {
    Object.assign(state, { status: 'error', data: undefined, problem: 'rate-limited' })
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('Demasiados intentos')
    expect(wrapper.text()).toContain('Espera un minuto antes de volver a intentarlo.')
    expect(button(wrapper, 'Reintentar')).toBeUndefined()
  })

  it.each<[DeliveryProblem, string, string]>([
    ['network', 'No pudimos mostrar tus fotos', 'Vuelve a intentarlo en un momento.'],
    ['unknown', 'No pudimos mostrar tus fotos', 'Vuelve a intentarlo en un momento.'],
  ])('never leaves the page blank: %s offers to retry', async (problem, title, text) => {
    Object.assign(state, { status: 'error', data: undefined, problem })
    const wrapper = await mountView()

    expect(wrapper.text()).toContain(title)
    expect(wrapper.text()).toContain(text)
    await button(wrapper, 'Reintentar')!.trigger('click')
    expect(refetch).toHaveBeenCalled()
  })
})
