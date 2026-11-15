import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'

import SessionExpiredNotice from './SessionExpiredNotice.vue'

const Stub = { render: () => null }

async function mountAt(path: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/:any(.*)*', component: Stub },
      { path: '/login', component: Stub },
    ],
  })
  await router.push(path)
  const wrapper = mount(SessionExpiredNotice, { global: { plugins: [router] } })
  await flushPromises()
  return { wrapper, router }
}

describe('SessionExpiredNotice', () => {
  it('says the session expired and leads to sign in, back to the same screen', async () => {
    const { wrapper } = await mountAt('/gallery/mama-rumi?placa=127')

    expect(wrapper.get('h2').text()).toBe('Tu sesión se cerró')
    expect(wrapper.text()).toContain(
      'Inicia sesión de nuevo para continuar. Tu carrito sigue guardado.',
    )
    expect(wrapper.get('svg').attributes('data-illustration')).toBe('sesionVencida')
    const link = wrapper.get('a')
    expect(link.text()).toBe('Iniciar sesión')
    expect(link.attributes('href')).toBe('/login?redirect=/gallery/mama-rumi?placa=127')
  })

  it('tells whoever shows it that the person is leaving to sign in', async () => {
    const { wrapper } = await mountAt('/')

    await wrapper.get('a').trigger('click')

    expect(wrapper.emitted('leave')).toHaveLength(1)
  })
})
