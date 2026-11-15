import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'

import { ROUTE_NAMES } from '@/core/navigation/route-names'
import ClientFooter from './ClientFooter.vue'

const Stub = { render: () => null }

async function mountFooter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Stub },
      { path: '/gallery', component: Stub },
      { path: '/account/orders', name: ROUTE_NAMES.ACCOUNT_ORDERS, component: Stub },
      { path: '/terms', component: Stub },
      { path: '/privacy', component: Stub },
      { path: '/anunciate', component: Stub },
      { path: '/organizadores', component: Stub },
    ],
  })
  await router.push('/')
  return mount(ClientFooter, { global: { plugins: [router] } })
}

describe('ClientFooter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2031-03-04T12:00:00'))
  })
  afterEach(() => vi.useRealTimers())

  it('carries the year of today', async () => {
    const wrapper = await mountFooter()

    expect(wrapper.text()).toContain('© 2031 Titan TV')
  })

  it('links to events, my photos, terms and privacy inside the app', async () => {
    const wrapper = await mountFooter()
    const links = wrapper.findAll('a').map((link) => [link.text(), link.attributes('href')])

    expect(links).toEqual(
      expect.arrayContaining([
        ['Eventos', '/gallery'],
        ['Mis fotos', '/account/orders'],
        ['Términos', '/terms'],
        ['Privacidad', '/privacy'],
      ]),
    )
  })

  it('links to the brands and organizers pages, which no blocked ad can take away', async () => {
    const wrapper = await mountFooter()
    const links = wrapper.findAll('a').map((link) => [link.text(), link.attributes('href')])

    expect(links).toEqual(
      expect.arrayContaining([
        ['Anuncia tu marca', '/anunciate'],
        ['Publica tu evento', '/organizadores'],
      ]),
    )
  })

  it('keeps the contact address the old footer had', async () => {
    const wrapper = await mountFooter()
    const contact = wrapper.findAll('a').find((link) => link.text() === 'Contacto')

    expect(contact?.attributes('href')).toBe('mailto:info@titantv.com.ec')
  })

  it('keeps the rights notice the old footer had', async () => {
    const wrapper = await mountFooter()

    expect(wrapper.text()).toContain('Todos los derechos reservados')
  })

  it('is a footer landmark', async () => {
    const wrapper = await mountFooter()

    expect(wrapper.element.tagName).toBe('FOOTER')
  })
})
