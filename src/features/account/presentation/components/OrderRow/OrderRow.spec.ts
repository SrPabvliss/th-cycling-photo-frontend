import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'

import type { IMyOrderListItem } from '../../../types/responses/my-order.response'
import OrderRow from './OrderRow.vue'

const ORDER: IMyOrderListItem = {
  id: 'o1',
  state: 'ready',
  eventName: 'Mama Rumi 2026',
  createdAt: '2026-11-12T15:00:00.000Z',
  photoCount: 3,
  subtotal: '9.00',
  currency: 'USD',
  previewPhotos: [
    { photoId: 'p1', galleryUrl: 'https://cdn/g/p1.jpg' },
    { photoId: 'p2', galleryUrl: 'https://cdn/g/p2.jpg' },
    { photoId: 'p3', galleryUrl: 'https://cdn/g/p3.jpg' },
  ],
}

async function mountRow(order: Partial<IMyOrderListItem> = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:any(.*)*', component: { render: () => null } }],
  })
  await router.push('/account/orders')
  const wrapper = mount(OrderRow, {
    props: { order: { ...ORDER, ...order } },
    global: { plugins: [router] },
  })
  await flushPromises()
  return wrapper
}

describe('OrderRow', () => {
  it('links to the order and names event, state and photos', async () => {
    const wrapper = await mountRow()

    const link = wrapper.get('a')
    expect(link.attributes('href')).toBe('/account/orders/o1')
    expect(link.attributes('aria-label')).toBe('Mama Rumi 2026, Lista para descargar, 3 fotos')
    expect(wrapper.text()).toContain('12 nov 2026 · 3 fotos · $9,00')
  })

  it('shows at most two thumbnails, never more', async () => {
    const wrapper = await mountRow()

    const images = wrapper.findAll('img')
    expect(images.map((image) => image.attributes('src'))).toEqual([
      'https://cdn/g/p1.jpg',
      'https://cdn/g/p2.jpg',
    ])
  })

  it('says one photo in singular', async () => {
    const wrapper = await mountRow({ photoCount: 1, previewPhotos: [ORDER.previewPhotos[0]!] })

    expect(wrapper.text()).toContain(' · 1 foto · ')
  })

  it('says a gift is free, with no amount', async () => {
    const wrapper = await mountRow({ state: 'gifted', subtotal: '0.00' })

    expect(wrapper.text()).toContain('Gratis')
    expect(wrapper.text()).not.toContain('$')
  })

  it('draws placeholders, not broken images, without thumbnails', async () => {
    const wrapper = await mountRow({ previewPhotos: [] })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.findAll('.order-row__placeholder')).toHaveLength(2)
  })

  it('swaps a thumbnail that fails to load for a placeholder', async () => {
    const wrapper = await mountRow()

    await wrapper.findAll('img')[0]!.trigger('error')

    expect(wrapper.findAll('img')).toHaveLength(1)
    expect(wrapper.findAll('.order-row__placeholder')).toHaveLength(1)
  })
})
