import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { AxiosError, type AxiosResponse } from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'

import EmailUnsubscribeView from './EmailUnsubscribeView.vue'

const unsubscribe = vi.fn()
vi.mock('../../composables/mutations/use-unsubscribe-community-emails', () => ({
  useUnsubscribeCommunityEmails: () => ({ mutateAsync: unsubscribe }),
}))

const mounted: { unmount(): void }[] = []
async function mountView(path = '/email/unsubscribe?t=tok-1') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/email/unsubscribe', component: EmailUnsubscribeView },
      { path: '/account/profile', name: 'account-profile', component: { render: () => null } },
      { path: '/:any(.*)*', component: { render: () => null } },
    ],
  })
  await router.push(path)
  mounted.push(
    mount(
      { template: '<RouterView />' },
      { attachTo: document.body, global: { plugins: [router] } },
    ),
  )
  await flushPromises()
  return new DOMWrapper(document.body)
}

function httpError(status: number) {
  const response = { status, data: {}, headers: {}, config: {} } as AxiosResponse
  return new AxiosError('failed', 'ERR_BAD_REQUEST', undefined, undefined, response)
}

const accountLink = (wrapper: DOMWrapper<Element>) =>
  wrapper.findAll('a').find((each) => each.text().trim() === 'Ir a mi cuenta')

describe('EmailUnsubscribeView', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    setActivePinia(createPinia())
    unsubscribe.mockReset()
  })
  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
  })

  it('says it is working while the api answers', async () => {
    unsubscribe.mockReturnValue(new Promise(() => {}))
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('Dándote de baja de los correos de fechas especiales')
  })

  it('unsubscribes once with the token of the link and leads to the account', async () => {
    unsubscribe.mockResolvedValue({ unsubscribed: true })
    const wrapper = await mountView()

    expect(unsubscribe).toHaveBeenCalledTimes(1)
    expect(unsubscribe).toHaveBeenCalledWith('tok-1')
    expect(wrapper.get('h1').text()).toBe('Listo, ya no recibirás correos de fechas especiales')
    expect(wrapper.text()).toContain('Puedes volver a activarlos desde tu cuenta.')
    expect(accountLink(wrapper)?.attributes('href')).toBe('/account/profile?seccion=comunidad')
  })

  it('says the link does not work without a token, and asks nothing', async () => {
    const wrapper = await mountView('/email/unsubscribe')

    expect(wrapper.get('h1').text()).toBe('Este enlace ya no sirve')
    expect(accountLink(wrapper)).toBeDefined()
    expect(unsubscribe).not.toHaveBeenCalled()
  })

  it('says the same of a token the api refuses', async () => {
    unsubscribe.mockRejectedValue(httpError(400))
    const wrapper = await mountView()

    expect(wrapper.get('h1').text()).toBe('Este enlace ya no sirve')
  })

  it('says a dropped connection is one, not a useless link, and tries again', async () => {
    unsubscribe.mockRejectedValueOnce(new AxiosError('Network Error', 'ERR_NETWORK'))
    const wrapper = await mountView()

    const problem = wrapper.get('[role="alert"]')
    expect(problem.text()).toContain('No pudimos darte de baja')
    expect(wrapper.text()).not.toContain('Este enlace ya no sirve')

    unsubscribe.mockResolvedValue({ unsubscribed: true })
    await problem
      .findAll('button')
      .find((each) => each.text() === 'Reintentar')!
      .trigger('click')
    await flushPromises()

    expect(unsubscribe).toHaveBeenCalledTimes(2)
    expect(wrapper.get('h1').text()).toBe('Listo, ya no recibirás correos de fechas especiales')
  })

  it('does not call a link useless when the server failed', async () => {
    unsubscribe.mockRejectedValue(httpError(503))
    const wrapper = await mountView()

    expect(wrapper.text()).not.toContain('Este enlace ya no sirve')
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })
})
