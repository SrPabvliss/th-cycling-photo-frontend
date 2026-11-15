import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { AxiosError } from 'axios'
import { defineComponent, h } from 'vue'
import { createMemoryHistory, createRouter, RouterView, type Router } from 'vue-router'

import ErrorBoundary from './ErrorBoundary.vue'

vi.mock('@/core/ui/discrete-api', () => ({
  message: { success: vi.fn(), error: vi.fn() },
}))

const ERROR_TITLE = 'Tuvimos una falla mecánica'

// The real layout brings the whole public shell (session, cart, footer); its slots are enough here.
const ErrorPageLayoutStub = defineComponent({
  props: { title: { type: String, required: true } },
  template: '<div><h1>{{ title }}</h1><slot name="actions" /><slot name="extra" /></div>',
})

let failure: Error | null = null

const Flaky = defineComponent({
  setup() {
    if (failure) throw failure
    return () => h('p', 'pantalla que carga bien')
  },
})

const Other = defineComponent({ render: () => h('p', 'otra pantalla') })

async function mountBoundary(): Promise<{ wrapper: ReturnType<typeof mount>; router: Router }> {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { render: () => h('p', 'inicio') } },
      { path: '/flaky', component: Flaky },
      { path: '/other', component: Other },
    ],
  })
  await router.push('/flaky')

  const wrapper = mount(ErrorBoundary, {
    slots: { default: () => h(RouterView) },
    global: { plugins: [router], stubs: { ErrorPageLayout: ErrorPageLayoutStub } },
  })
  await flushPromises()

  return { wrapper, router }
}

function buttonNamed(wrapper: ReturnType<typeof mount>, name: string) {
  const button = wrapper.findAll('button').find((candidate) => candidate.text() === name)
  if (!button) throw new Error(`no button named "${name}"`)
  return button
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    failure = new Error('boom')
    // Vue reports the captured error on the console; it is the point of these tests.
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('shows the error screen when a child throws while setting up', async () => {
    const { wrapper } = await mountBoundary()

    expect(wrapper.text()).toContain(ERROR_TITLE)
  })

  it('shows the next screen after navigating away from the error', async () => {
    const { wrapper, router } = await mountBoundary()

    await router.push('/other')
    await flushPromises()

    expect(wrapper.text()).not.toContain(ERROR_TITLE)
    expect(wrapper.text()).toContain('otra pantalla')
  })

  it('mounts the child again when retrying, and shows it if it no longer fails', async () => {
    const { wrapper } = await mountBoundary()
    failure = null

    await buttonNamed(wrapper, 'Reintentar').trigger('click')
    await flushPromises()

    expect(wrapper.text()).not.toContain(ERROR_TITLE)
    expect(wrapper.text()).toContain('pantalla que carga bien')
  })

  it('shows the error screen again when the child fails again after retrying', async () => {
    const { wrapper } = await mountBoundary()

    await buttonNamed(wrapper, 'Reintentar').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain(ERROR_TITLE)
  })

  it('goes home from the error screen', async () => {
    const { wrapper, router } = await mountBoundary()

    await buttonNamed(wrapper, 'Volver al inicio').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/')
    expect(wrapper.text()).toContain('inicio')
    expect(wrapper.text()).not.toContain(ERROR_TITLE)
  })

  it('shows the stack while developing', async () => {
    const { wrapper } = await mountBoundary()

    expect(wrapper.text()).toContain('Error: boom')
  })

  it('keeps the stack to itself outside of development', async () => {
    vi.stubEnv('DEV', false)

    const { wrapper } = await mountBoundary()

    expect(wrapper.text()).toContain(ERROR_TITLE)
    expect(wrapper.text()).not.toContain('boom')
  })

  it('leaves http errors to the interceptor', async () => {
    failure = new AxiosError('Request failed')

    const { wrapper } = await mountBoundary()

    expect(wrapper.text()).not.toContain(ERROR_TITLE)
  })
})
