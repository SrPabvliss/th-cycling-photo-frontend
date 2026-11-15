import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'

import { ROUTE_NAMES } from '@/core/navigation/route-names'
import ClientTabBar from './ClientTabBar.vue'

const Stub = { render: () => null }

async function mountAt(path: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Stub, meta: { shell: { tab: 'home', tabBar: true } } },
      { path: '/gallery', component: Stub, meta: { shell: { tab: 'events', tabBar: true } } },
      {
        path: '/account/orders',
        name: ROUTE_NAMES.ACCOUNT_ORDERS,
        component: Stub,
        meta: { shell: { tab: 'photos', tabBar: true } },
      },
      { path: '/terms', component: Stub },
    ],
  })
  await router.push(path)
  const wrapper = mount(ClientTabBar, { global: { plugins: [router] } })
  await flushPromises()
  return { wrapper, router }
}

type Wrapper = Awaited<ReturnType<typeof mountAt>>['wrapper']
const current = (wrapper: Wrapper) =>
  wrapper.findAll('a').filter((link) => link.attributes('aria-current') === 'page')

describe('ClientTabBar', () => {
  it('is the main navigation, with the three destinations in order', async () => {
    const { wrapper } = await mountAt('/')

    expect(wrapper.element.tagName).toBe('NAV')
    expect(wrapper.attributes('aria-label')).toBe('Navegación principal')
    expect(wrapper.findAll('a').map((link) => [link.text(), link.attributes('href')])).toEqual([
      ['Inicio', '/'],
      ['Eventos', '/gallery'],
      ['Mis fotos', '/account/orders'],
    ])
  })

  it.each([
    ['/', 'Inicio'],
    ['/gallery', 'Eventos'],
    ['/account/orders', 'Mis fotos'],
  ])('marks as current only the destination of %s', async (path, label) => {
    const { wrapper } = await mountAt(path)

    expect(current(wrapper).map((link) => link.text())).toEqual([label])
  })

  it('marks nothing as current on a route that belongs to no destination', async () => {
    const { wrapper } = await mountAt('/terms')

    expect(current(wrapper)).toHaveLength(0)
  })

  it('navigates without reloading the page', async () => {
    const { wrapper, router } = await mountAt('/')

    await wrapper.findAll('a')[1]!.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/gallery')
    expect(current(wrapper).map((link) => link.text())).toEqual(['Eventos'])
  })

  it('draws an icon, hidden from assistive technology, on each destination', async () => {
    const { wrapper } = await mountAt('/')

    for (const link of wrapper.findAll('a')) {
      expect(link.get('svg').attributes('aria-hidden')).toBe('true')
    }
  })
})
