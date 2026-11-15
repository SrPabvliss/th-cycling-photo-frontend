import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'

import AuthTabs from './AuthTabs.vue'

async function mountTabs(props: { current: 'login' | 'register'; redirect?: string | null }) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:any(.*)*', component: { render: () => null } }],
  })
  await router.push('/login')
  const wrapper = mount(AuthTabs, { props, global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

describe('AuthTabs', () => {
  it('marks the current tab', async () => {
    const wrapper = await mountTabs({ current: 'register' })

    expect(wrapper.findAll('[role="tab"]').map((tab) => tab.attributes('aria-selected'))).toEqual([
      'false',
      'true',
    ])
  })

  it('carries the way back, or nothing', async () => {
    const withRedirect = await mountTabs({ current: 'login', redirect: '/checkout/abc' })
    const without = await mountTabs({ current: 'login' })

    expect(withRedirect.findAll('a').map((tab) => tab.attributes('href'))).toEqual([
      '/login?redirect=/checkout/abc',
      '/register?redirect=/checkout/abc',
    ])
    expect(without.findAll('a').map((tab) => tab.attributes('href'))).toEqual([
      '/login',
      '/register',
    ])
  })
})
