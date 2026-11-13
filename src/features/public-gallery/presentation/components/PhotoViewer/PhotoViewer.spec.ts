import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { computed, nextTick, reactive } from 'vue'

vi.mock('@/features/ads/presentation/components/AdSlot/AdSlot.vue', async () => ({
  default: (await import('@/features/ads/testing/ad-stubs')).AdSlotStub,
}))

import PhotoViewer from './PhotoViewer.vue'

const REAL_TIERS = [
  { minQty: 1, maxQty: 2, pricePerPhoto: 4 },
  { minQty: 3, maxQty: 6, pricePerPhoto: 3 },
  { minQty: 7, maxQty: 9, pricePerPhoto: 2.5 },
  { minQty: 10, maxQty: null, pricePerPhoto: 2 },
]

const cart = reactive({ status: 'success' as 'pending' | 'error' | 'success', ids: [] as string[] })
const pricing = reactive({ hasTiers: true })
const toggle = vi.fn()

vi.mock('@/shared/cart', () => ({
  useCartState: () => ({
    status: computed(() => cart.status),
    countFor: () => cart.ids.length,
    isInCart: (id: string) => cart.ids.includes(id),
  }),
  useCartActions: () => ({ toggle, remove: vi.fn(), isBusy: () => false }),
}))
vi.mock('@/shared/pricing/use-pricing-tiers', () => ({
  usePricingTiersQuery: () => ({
    data: computed(() =>
      pricing.hasTiers ? { currency: 'USD', source: 'default', tiers: REAL_TIERS } : undefined,
    ),
  }),
}))

const photo = (id: string) => ({ id, publicSlug: `slug-${id}`, width: 3, height: 4 })
const photos = ['a', 'b', 'c'].map(photo)
const event = {
  id: 'e1',
  name: 'Mama Rumi 2026',
  slug: 'mama-rumi',
  startDate: new Date(2026, 9, 4),
  endDate: new Date(2026, 9, 4),
}

const mounted: { unmount(): void }[] = []

function mountViewer(props: Record<string, unknown> = {}) {
  const wrapper = mount(PhotoViewer, {
    props: { photos, photoId: 'b', event, ...props },
    attachTo: document.body,
    global: { stubs: { teleport: true } },
  })
  mounted.push(wrapper)
  return wrapper
}

type Wrapper = ReturnType<typeof mountViewer>
const press = (key: string) =>
  document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
const cartButton = (wrapper: Wrapper) => wrapper.get('.photo-viewer__cart')
const buttonLabelled = (wrapper: Wrapper, label: string) =>
  wrapper.get(`button[aria-label="${label}"]`)

describe('PhotoViewer', () => {
  // An open viewer holds the page and the keyboard: none may outlive its test.
  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
  })

  beforeEach(() => {
    document.body.innerHTML = ''
    Object.assign(cart, { status: 'success', ids: [] })
    pricing.hasTiers = true
    toggle.mockClear()
  })

  it('is a full screen modal dialog showing the photo', () => {
    const wrapper = mountViewer()
    const dialog = wrapper.get('[role="dialog"]')

    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-label')).toBe('Foto ampliada')
    expect(wrapper.get('.photo-viewer__photo').attributes('src')).toBe(
      'http://localhost/cdn/gallery/slug-b.jpg',
    )
    expect(wrapper.text()).toContain('La marca de agua desaparece al comprar.')
  })

  it('shows the plate only when the photo comes from a plate search', () => {
    expect(mountViewer().find('.photo-viewer__plate').exists()).toBe(false)

    const searched = mountViewer({ plate: '127' })
    expect(searched.get('.photo-viewer__plate').text()).toBe('Placa #127')
    expect(searched.get('.photo-viewer__photo').attributes('alt')).toBe('Foto de la placa 127')
  })

  it('asks to close from its button and from Escape', async () => {
    const wrapper = mountViewer()
    await nextTick()

    await buttonLabelled(wrapper, 'Cerrar').trigger('click')
    press('Escape')

    expect(wrapper.emitted('close')).toHaveLength(2)
  })

  it('moves to the next and previous photo from the arrows and from the keyboard', async () => {
    const wrapper = mountViewer()
    await nextTick()

    press('ArrowRight')
    await nextTick()
    press('ArrowLeft')
    await buttonLabelled(wrapper, 'Foto siguiente').trigger('click')
    await buttonLabelled(wrapper, 'Foto anterior').trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:photoId')).toEqual([['c'], ['a'], ['c'], ['a']])
  })

  it('disables the arrows at the ends', () => {
    const first = mountViewer({ photoId: 'a' })
    expect(buttonLabelled(first, 'Foto anterior').attributes('disabled')).toBeDefined()
    expect(buttonLabelled(first, 'Foto siguiente').attributes('disabled')).toBeUndefined()

    const last = mountViewer({ photoId: 'c' })
    expect(buttonLabelled(last, 'Foto siguiente').attributes('disabled')).toBeDefined()
  })

  it('keeps "next" on at the last loaded photo when there are more pages, and asks for them', async () => {
    const fetchNextPage = vi.fn(async () => {})
    const wrapper = mountViewer({ photoId: 'c', hasNextPage: true, fetchNextPage })

    expect(buttonLabelled(wrapper, 'Foto siguiente').attributes('disabled')).toBeUndefined()
    await buttonLabelled(wrapper, 'Foto siguiente').trigger('click')

    expect(fetchNextPage).toHaveBeenCalledTimes(1)
  })

  it('offers to add the photo at the price it would have with one more', () => {
    cart.ids = ['x', 'y']

    const wrapper = mountViewer()

    expect(cartButton(wrapper).text()).toBe('Agregar · $3,00')
    expect(wrapper.get('.photo-viewer__hint').text()).toBe(
      '2 fotos en tu carrito. Con 1 foto más, todas bajan a $3,00 c/u.',
    )
  })

  it('points at the second tier when the cart has no photos of the event', () => {
    const wrapper = mountViewer()

    expect(cartButton(wrapper).text()).toBe('Agregar · $4,00')
    expect(wrapper.get('.photo-viewer__hint').text()).toBe('Desde 3 fotos, todas a $3,00 c/u.')
  })

  it('offers to take the photo out when it is in the cart', () => {
    cart.ids = ['b']

    const wrapper = mountViewer()

    expect(cartButton(wrapper).text()).toBe('Quitar del carrito')
    expect(wrapper.get('.photo-viewer__hint').text()).toContain('1 foto en tu carrito.')
  })

  it('names the action without a price, and promises none, when the tiers are not there', () => {
    pricing.hasTiers = false
    cart.ids = ['x']

    const wrapper = mountViewer()

    expect(cartButton(wrapper).text()).toBe('Agregar al carrito')
    expect(wrapper.text()).not.toContain('$')
    expect(wrapper.get('.photo-viewer__hint').text()).toBe('1 foto en tu carrito.')
  })

  it('claims nothing about the cart when it could not be read', () => {
    cart.status = 'error'

    const wrapper = mountViewer()

    expect(wrapper.find('.photo-viewer__hint').exists()).toBe(false)
    expect(cartButton(wrapper).text()).toBe('Agregar al carrito')
  })

  it('toggles the photo with what the cart shows of its event', async () => {
    const wrapper = mountViewer()

    await cartButton(wrapper).trigger('click')

    expect(toggle).toHaveBeenCalledWith({ id: 'b', publicSlug: 'slug-b', event })
  })

  it('closes with the 320×50 house strip under its footer', () => {
    const wrapper = mountViewer()

    const ad = wrapper.get('[data-test="ad"]')
    expect(ad.attributes('data-format')).toBe('D')
    expect(ad.attributes('data-seed')).toBe('41')
    const cart = cartButton(wrapper).element
    expect(cart.compareDocumentPosition(ad.element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('stops the page behind from scrolling while it is open', async () => {
    mountViewer()
    await nextTick()
    expect(document.documentElement.style.overflow).toBe('hidden')

    mounted.pop()!.unmount()
    expect(document.documentElement.style.overflow).toBe('')
  })
})
