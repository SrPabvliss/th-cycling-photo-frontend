import { describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent, h } from 'vue'

import { warmFirstRoute } from './warm-first-route'

const Shell = defineComponent({ render: () => h('div') })
const Screen = defineComponent({ render: () => h('div') })
const Functional = () => h('div')
Functional.displayName = 'Functional'

function routerWith(loaders: Record<string, () => Promise<unknown>>) {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        component: Shell,
        children: [
          { path: '', component: loaders.home! },
          { path: 'gallery/:slug', component: loaders.gallery! },
          { path: 'plain', component: Functional },
        ],
      },
    ],
  })
}

describe('warmFirstRoute', () => {
  it('asks for the screen of the address, and for no other', () => {
    const home = vi.fn(() => Promise.resolve(Screen))
    const gallery = vi.fn(() => Promise.resolve(Screen))

    warmFirstRoute(routerWith({ home, gallery }), '/gallery/mama-rumi?plate=12')

    expect(gallery).toHaveBeenCalledTimes(1)
    expect(home).not.toHaveBeenCalled()
  })

  it('leaves alone the components that are already there', () => {
    const home = vi.fn(() => Promise.resolve(Screen))
    const gallery = vi.fn(() => Promise.resolve(Screen))

    expect(() => warmFirstRoute(routerWith({ home, gallery }), '/plain')).not.toThrow()
    expect(home).not.toHaveBeenCalled()
    expect(gallery).not.toHaveBeenCalled()
  })

  it('does nothing for an address with no screen', () => {
    const home = vi.fn(() => Promise.resolve(Screen))
    const gallery = vi.fn(() => Promise.resolve(Screen))

    expect(() => warmFirstRoute(routerWith({ home, gallery }), '/nowhere')).not.toThrow()
    expect(gallery).not.toHaveBeenCalled()
  })

  it('keeps quiet when the download fails: the router meets it and says so', async () => {
    const unhandled = vi.fn()
    process.on('unhandledRejection', unhandled)
    const home = vi.fn(() => Promise.reject(new Error('chunk')))

    warmFirstRoute(routerWith({ home, gallery: home }), '/')
    await new Promise((resolve) => setTimeout(resolve, 0))

    process.off('unhandledRejection', unhandled)
    expect(home).toHaveBeenCalledTimes(1)
    expect(unhandled).not.toHaveBeenCalled()
  })
})
