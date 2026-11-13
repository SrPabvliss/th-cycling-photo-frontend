import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { computed, reactive } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import { toCurrentUser } from '@/core/auth/current-user.mapper'
import { useSessionStore } from '@/core/auth/stores/session.store'
import { usePriceSheet } from '@/features/pricing/composables/use-price-sheet'
import { useCartStore } from '@/shared/stores/cart.store'
import type { ICartGroup } from '@/shared/types/cart.types'
import CartDrawer from './CartDrawer.vue'

const REAL_TIERS = [
  { minQty: 1, maxQty: 2, pricePerPhoto: 4 },
  { minQty: 3, maxQty: 6, pricePerPhoto: 3 },
  { minQty: 7, maxQty: 9, pricePerPhoto: 2.5 },
  { minQty: 10, maxQty: null, pricePerPhoto: 2 },
]

const cart = reactive({
  status: 'success' as 'pending' | 'error' | 'success',
  groups: [] as ICartGroup[],
  isFetching: false,
})
const pricing = reactive({ hasTiers: true })
const remove = vi.fn()
const refetch = vi.fn()

vi.mock('@/shared/cart', () => ({
  useCartState: () => ({
    status: computed(() => cart.status),
    groups: computed(() => cart.groups),
    isFetching: computed(() => cart.isFetching),
    refetch,
  }),
  useCartActions: () => ({ toggle: vi.fn(), remove, isBusy: () => false }),
}))
vi.mock('@/shared/pricing/use-pricing-tiers', () => ({
  usePricingTiersQuery: () => ({
    data: computed(() =>
      pricing.hasTiers ? { currency: 'USD', source: 'default', tiers: REAL_TIERS } : undefined,
    ),
  }),
}))

function group(id: string, photos: number): ICartGroup {
  return {
    eventId: id,
    eventName: `Evento ${id}`,
    eventSlug: `evento-${id}`,
    startDate: new Date(2026, 9, 4),
    endDate: new Date(2026, 9, 4),
    photos: Array.from({ length: photos }, (_, index) => ({
      id: `${id}-${index}`,
      publicSlug: `s${id}${index}`,
    })),
  }
}

const Stub = { render: () => null }

async function mountDrawer() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Stub },
      { path: '/gallery', component: Stub },
      { path: '/login', component: Stub },
      { path: '/checkout/:eventId', component: Stub },
    ],
  })
  await router.push('/')
  useCartStore().setDrawerOpen(true)
  // The real teleport: a stubbed one rebuilds its content on every render and would hide whether
  // the drawer keeps its elements. The drawer is read from the page it was teleported to.
  const component = mount(CartDrawer, { attachTo: document.body, global: { plugins: [router] } })
  await flushPromises()
  return { wrapper: new DOMWrapper(document.body), component, router }
}

function signIn() {
  useSessionStore().setSession(
    'token',
    toCurrentUser({ id: 'u1', email: 'a@b.c', firstName: 'Ana', lastName: null, role: 'customer' }),
  )
}

type Wrapper = Awaited<ReturnType<typeof mountDrawer>>['wrapper']
const sections = (wrapper: Wrapper) => wrapper.findAll('.cart-drawer__event')
const linkNamed = (wrapper: Wrapper, name: string) =>
  wrapper.findAll('a').filter((link) => link.text() === name)
const buttonNamed = (wrapper: Wrapper, name: string) =>
  wrapper.findAll('button').find((button) => button.text() === name)

describe('CartDrawer', () => {
  const mounted: { unmount(): void }[] = []

  beforeEach(() => {
    document.body.innerHTML = ''
    localStorage.clear()
    setActivePinia(createPinia())
    Object.assign(cart, { status: 'success', groups: [], isFetching: false })
    pricing.hasTiers = true
    remove.mockClear()
    refetch.mockClear()
    usePriceSheet().close()
  })
  afterEach(() => {
    vi.useRealTimers()
    while (mounted.length) mounted.pop()!.unmount()
  })

  async function open() {
    const result = await mountDrawer()
    mounted.push(result.component)
    return result
  }

  it('is not there while closed', async () => {
    useCartStore().setDrawerOpen(false)
    const { wrapper } = await open()
    useCartStore().setDrawerOpen(false)
    await flushPromises()

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('is a modal dialog with its title and a way to close it', async () => {
    const { wrapper } = await open()
    const dialog = wrapper.get('[role="dialog"]')

    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(document.getElementById(dialog.attributes('aria-labelledby')!)?.textContent).toBe(
      'Tu carrito',
    )

    await wrapper.get('button[aria-label="Cerrar"]').trigger('click')
    expect(useCartStore().isDrawerOpen).toBe(false)
  })

  it('says the cart could not be loaded, never that it is empty, and retries', async () => {
    cart.status = 'error'
    const { wrapper } = await open()

    expect(wrapper.text()).toContain('No pudimos cargar tu carrito')
    expect(wrapper.text()).toContain('Puede ser tu conexión.')
    expect(wrapper.text()).not.toContain('Tu carrito está vacío')

    await buttonNamed(wrapper, 'Reintentar')!.trigger('click')
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('shows skeletons, not "empty", while the cart loads', async () => {
    vi.useFakeTimers()
    cart.status = 'pending'
    const { wrapper } = await open()

    expect(wrapper.text()).not.toContain('Tu carrito está vacío')
    await vi.advanceTimersByTimeAsync(400)
    expect(wrapper.find('.cart-drawer__skeleton').exists()).toBe(true)
  })

  it('says the cart is empty and sends to the events', async () => {
    const { wrapper, router } = await open()

    expect(wrapper.text()).toContain('Tu carrito está vacío')
    expect(wrapper.text()).toContain('Busca tu placa en un evento y agrega las fotos que quieras.')

    await linkNamed(wrapper, 'Ver eventos')[0]!.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/gallery')
    expect(useCartStore().isDrawerOpen).toBe(false)
  })

  it('has one section per event, with a note that each is its own order', async () => {
    cart.groups = [group('a', 3), group('b', 1)]
    const { wrapper } = await open()

    expect(sections(wrapper)).toHaveLength(2)
    expect(sections(wrapper)[0]!.get('.cart-drawer__event-name').text()).toBe('Evento a')
    expect(sections(wrapper)[0]!.get('.cart-drawer__event-count').text()).toBe('3 fotos')
    expect(sections(wrapper)[1]!.get('.cart-drawer__event-count').text()).toBe('1 foto')
    expect(wrapper.text()).toContain('Cada evento se confirma como un pedido aparte.')
  })

  it('has no note about separate orders with a single event', async () => {
    cart.groups = [group('a', 3)]
    const { wrapper } = await open()

    expect(wrapper.text()).not.toContain('pedido aparte')
  })

  it('prices each event on its own', async () => {
    cart.groups = [group('a', 3), group('b', 1)]
    const { wrapper } = await open()

    expect(sections(wrapper)[0]!.get('.cart-drawer__unit').text()).toBe('$3,00 c/u')
    expect(sections(wrapper)[0]!.get('.cart-drawer__total').text()).toBe('$9,00')
    expect(sections(wrapper)[1]!.get('.cart-drawer__unit').text()).toBe('$4,00 c/u')
    expect(sections(wrapper)[1]!.get('.cart-drawer__total').text()).toBe('$4,00')
  })

  it('takes a photo out, and keeps the price block while the total changes', async () => {
    cart.groups = [group('a', 3)]
    const { wrapper } = await open()
    const priceBlock = sections(wrapper)[0]!.get('.cart-drawer__price').element
    console.log('--- before change', document.querySelectorAll('.cart-drawer').length)

    await sections(wrapper)[0]!.findAll('button[aria-label="Quitar foto"]')[2]!.trigger('click')
    expect(remove).toHaveBeenCalledWith('a-2')

    cart.groups = [group('a', 2)]
    await flushPromises()
    console.log(
      '--- after change',
      document.querySelectorAll('.cart-drawer').length,
      wrapper.findAll('.cart-drawer').length,
    )

    expect(sections(wrapper)[0]!.get('.cart-drawer__price').element).toBe(priceBlock)
    expect(sections(wrapper)[0]!.get('.cart-drawer__total').text()).toBe('$8,00')
    expect(wrapper.text()).not.toContain('Calculando precio')
  })

  it('shows no price, but still lets the order go on, without tiers', async () => {
    pricing.hasTiers = false
    signIn()
    cart.groups = [group('a', 3)]
    const { wrapper } = await open()

    expect(wrapper.text()).not.toContain('$')
    expect(linkNamed(wrapper, 'Confirmar pedido')[0]!.attributes('href')).toBe('/checkout/a')
  })

  it('confirms each event on its own checkout and closes', async () => {
    signIn()
    cart.groups = [group('a', 3), group('b', 1)]
    const { wrapper, router } = await open()

    const confirms = linkNamed(wrapper, 'Confirmar pedido')
    expect(confirms.map((link) => link.attributes('href'))).toEqual(['/checkout/a', '/checkout/b'])

    await confirms[1]!.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/checkout/b')
    expect(useCartStore().isDrawerOpen).toBe(false)
  })

  it('asks to sign in first, and comes back to the checkout, without a session', async () => {
    cart.groups = [group('a', 3)]
    const { wrapper } = await open()

    const confirm = linkNamed(wrapper, 'Confirmar pedido')[0]!
    expect(confirm.attributes('href')).toBe('/login?redirect=/checkout/a')
  })

  it('explains the prices with the quantity of the only event', async () => {
    cart.groups = [group('a', 4)]
    const { wrapper } = await open()

    await buttonNamed(wrapper, 'Cómo funcionan los precios')!.trigger('click')

    expect(usePriceSheet().isOpen.value).toBe(true)
    expect(usePriceSheet().quantity.value).toBe(4)
  })

  it('explains the prices with no quantity when there are several events', async () => {
    cart.groups = [group('a', 4), group('b', 1)]
    const { wrapper } = await open()

    await buttonNamed(wrapper, 'Cómo funcionan los precios')!.trigger('click')

    expect(usePriceSheet().quantity.value).toBe(0)
  })
})
