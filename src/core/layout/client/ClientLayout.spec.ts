import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, onMounted } from 'vue'
import { createMemoryHistory, createRouter, RouterView } from 'vue-router'

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
