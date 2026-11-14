import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, onMounted } from 'vue'
import { createMemoryHistory, createRouter, RouterView } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'

import { useSessionStore } from '@/core/auth/stores/session.store'
import { LAYOUT_SLOTS, registerLayoutSlot } from '@/core/layout/slot-registry'
import { ErrorState } from '@/shared/components/loading'
import ClientLayout from './ClientLayout.vue'

const layoutMounted = vi.fn()

const stub = (name: string) =>
  defineComponent({ name, render: () => h('div', { 'data-test': name }) })

const Screen = (text: string) => defineComponent({ render: () => h('p', text) })

// Counts how many times the layout itself is created, to prove navigation reuses it.
const CountedLayout = defineComponent({
  setup() {
    onMounted(layoutMounted)
    return () => h(ClientLayout)
  },
})

async function mountAt(path: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        component: CountedLayout,
        children: [
          { path: '', component: Screen('inicio'), meta: { shell: { tab: 'home', tabBar: true } } },
          { path: 'plain', component: Screen('pantalla simple') },
          { path: 'detail', component: Screen('detalle'), meta: { shell: { footer: false } } },
          {
            path: 'season-error',
            component: defineComponent({ render: () => h(ErrorState, { what: 'los eventos' }) }),
            meta: { shell: { seasonBar: true } },
          },
          {
            path: 'season',
            component: Screen('con temporada'),
            meta: { shell: { seasonBar: true } },
          },
          {
            path: 'open',
            component: Screen('pantalla pública'),
            meta: { public: true },
          },
          {
            path: 'private',
            component: Screen('enlace privado'),
            meta: { shell: { header: false, footer: false } },
          },
        ],
      },
    ],
  })
  await router.push(path)

  const wrapper = mount(RouterView, {
    global: {
      plugins: [router],
      stubs: {
        ClientHeader: stub('ClientHeader'),
        ClientFooter: stub('ClientFooter'),
        ClientTabBar: stub('ClientTabBar'),
        ClientLogo: stub('ClientLogo'),
      },
    },
  })
  await flushPromises()

  return { wrapper, router }
}

const has = (wrapper: Awaited<ReturnType<typeof mountAt>>['wrapper'], name: string) =>
  wrapper.find(`[data-test="${name}"]`).exists()

describe('ClientLayout', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('says the session closed in place of a screen that needs it, with a way back in', async () => {
    useSessionStore().expireSession()
    const { wrapper } = await mountAt('/plain?page=2')

    const main = wrapper.get('main')
    expect(main.text()).not.toContain('pantalla simple')
    expect(main.get('h1').text()).toBe('Tu sesión se cerró')
    expect(main.text()).toContain(
      'Inicia sesión de nuevo para continuar. Tu carrito sigue guardado.',
    )
    expect(main.get('svg').attributes('data-illustration')).toBe('sesionVencida')
    const link = main.get('a')
    expect(link.text()).toBe('Iniciar sesión')
    expect(link.attributes('href')).toBe('/login?redirect=/plain?page=2')
    wrapper.unmount()
  })

  it('keeps a public screen when the session closes', async () => {
    useSessionStore().expireSession()
    const { wrapper } = await mountAt('/open')

    expect(wrapper.get('main').text()).toBe('pantalla pública')
  })

  it('renders the screen of the route inside main', async () => {
    const { wrapper } = await mountAt('/plain')

    expect(wrapper.get('main').text()).toBe('pantalla simple')
  })

  it('gives a route without shell meta the header and the footer, and no tab bar', async () => {
    const { wrapper } = await mountAt('/plain')

    expect(has(wrapper, 'ClientHeader')).toBe(true)
    expect(has(wrapper, 'ClientFooter')).toBe(true)
    expect(has(wrapper, 'ClientTabBar')).toBe(false)
    expect(wrapper.get('.client-layout').attributes('data-tab-bar')).toBeUndefined()
  })

  it('mounts the tab bar and says so on the root when the route asks for it', async () => {
    const { wrapper } = await mountAt('/')

    expect(has(wrapper, 'ClientTabBar')).toBe(true)
    expect(wrapper.get('.client-layout').attributes('data-tab-bar')).toBe('true')
  })

  it('leaves the footer out when the route does not want it', async () => {
    const { wrapper } = await mountAt('/detail')

    expect(has(wrapper, 'ClientFooter')).toBe(false)
    expect(has(wrapper, 'ClientHeader')).toBe(true)
  })

  it('shows only the logo when the route does not want the header', async () => {
    const { wrapper } = await mountAt('/private')

    expect(has(wrapper, 'ClientHeader')).toBe(false)
    expect(wrapper.get('.client-layout__brand').find('[data-test="ClientLogo"]').exists()).toBe(
      true,
    )
  })

  it('mounts what features registered to float over every client screen', async () => {
    registerLayoutSlot(
      LAYOUT_SLOTS.CLIENT_OVERLAY,
      defineComponent({ render: () => h('aside', { 'data-test': 'client-overlay' }) }),
    )

    const { wrapper } = await mountAt('/private')

    expect(has(wrapper, 'client-overlay')).toBe(true)
  })

  it('puts what features registered for the season bar above the header, only where asked', async () => {
    registerLayoutSlot(
      LAYOUT_SLOTS.CLIENT_SEASON_BAR,
      defineComponent({ render: () => h('aside', { 'data-test': 'season-bar' }) }),
    )

    const plain = await mountAt('/plain')
    expect(has(plain.wrapper, 'season-bar')).toBe(false)

    const { wrapper } = await mountAt('/season')
    const root = wrapper.get('.client-layout').element
    const bar = wrapper.get('[data-test="season-bar"]').element
    const header = wrapper.get('[data-test="ClientHeader"]').element
    expect(root.firstElementChild).toBe(bar)
    expect(bar.compareDocumentPosition(header) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('puts the offline strip right under the header, after the season bar', async () => {
    registerLayoutSlot(
      LAYOUT_SLOTS.CLIENT_SEASON_BAR,
      defineComponent({ render: () => h('aside', { 'data-test': 'season-bar' }) }),
    )
    const { wrapper } = await mountAt('/season')

    const header = wrapper.get('[data-test="ClientHeader"]').element
    const strip = wrapper.get('.offline-strip').element
    expect(header.nextElementSibling).toBe(strip)
    expect(strip.classList.contains('offline-strip--under-header')).toBe(true)
  })

  it('takes the season bar away while the screen shows a problem', async () => {
    registerLayoutSlot(
      LAYOUT_SLOTS.CLIENT_SEASON_BAR,
      defineComponent({ render: () => h('aside', { 'data-test': 'season-bar' }) }),
    )
    const { wrapper } = await mountAt('/season-error')

    expect(has(wrapper, 'season-bar')).toBe(false)
    expect(wrapper.get('main').text()).toContain('No pudimos mostrar los eventos')
  })

  it('applies the shell of the next route without mounting the layout again', async () => {
    layoutMounted.mockClear()
    const { wrapper, router } = await mountAt('/')
    expect(layoutMounted).toHaveBeenCalledTimes(1)

    await router.push('/private')
    await flushPromises()

    expect(has(wrapper, 'ClientTabBar')).toBe(false)
    expect(has(wrapper, 'ClientHeader')).toBe(false)
    expect(wrapper.get('.client-layout').attributes('data-tab-bar')).toBeUndefined()
    expect(wrapper.get('main').text()).toBe('enlace privado')
    expect(layoutMounted).toHaveBeenCalledTimes(1)
  })
})
