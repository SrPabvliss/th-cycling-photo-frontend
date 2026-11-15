import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { AxiosError, type AxiosResponse } from 'axios'
import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import ForgotPasswordView from './ForgotPasswordView.vue'

const requestLink = vi.fn()
const isPending = ref(false)

vi.mock('../../composables/mutations/use-forgot-password', () => ({
  useForgotPasswordMutation: () => ({ mutateAsync: requestLink, isPending }),
}))

const mounted: { unmount(): void }[] = []
async function mountView() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/forgot-password', component: ForgotPasswordView },
      { path: '/:any(.*)*', name: 'auth-login', component: { render: () => null } },
    ],
  })
  await router.push('/forgot-password')
  mounted.push(
    mount(
      { template: '<RouterView />' },
      { attachTo: document.body, global: { plugins: [router] } },
    ),
  )
  await flushPromises()
  return new DOMWrapper(document.body)
}

function httpError(status?: number) {
  if (!status) return new AxiosError('Network Error', 'ERR_NETWORK')
  const response = { status, data: {}, headers: {}, config: {} } as AxiosResponse
  return new AxiosError('failed', 'ERR_BAD_RESPONSE', undefined, undefined, response)
}

async function ask(wrapper: DOMWrapper<Element>, email = 'ana@correo.com') {
  await wrapper.get('input[type="email"]').setValue(email)
  await wrapper.get('form').trigger('submit')
  await flushPromises()
}

const SENT =
  'Si hay una cuenta con ese correo, te llega un enlace para crear una contraseña nueva. Dura 30 minutos.'

describe('ForgotPasswordView', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    requestLink.mockReset()
    isPending.value = false
  })
  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
  })

  it('explains what happens and asks for the email', async () => {
    const wrapper = await mountView()

    expect(wrapper.get('h1').text()).toBe('Recuperar contraseña')
    expect(wrapper.text()).toContain(
      'Escribe tu correo y te enviamos un enlace para crear una nueva.',
    )
    expect(wrapper.findAll('a').some((each) => each.text() === 'Volver a iniciar sesión')).toBe(
      true,
    )
  })

  it('asks for a valid email', async () => {
    const wrapper = await mountView()

    await ask(wrapper, 'ana@')

    expect(wrapper.text()).toContain('Escribe un correo válido, como tu@correo.com.')
    expect(requestLink).not.toHaveBeenCalled()
  })

  it('says the link is on its way after an accepted request, without saying the account exists', async () => {
    requestLink.mockResolvedValue(undefined)
    const wrapper = await mountView()

    await ask(wrapper, ' ana@correo.com ')

    expect(requestLink).toHaveBeenCalledWith('ana@correo.com')
    expect(wrapper.get('h1').text()).toBe('Revisa tu correo')
    expect(wrapper.text()).toContain(SENT)
  })

  it.each([
    ['a dropped connection', undefined],
    ['a server failure', 500],
  ])('does not claim it sent anything after %s, and keeps the email', async (_, status) => {
    requestLink.mockRejectedValue(httpError(status))
    const wrapper = await mountView()

    await ask(wrapper)

    expect(wrapper.text()).not.toContain(SENT)
    expect(wrapper.get('[role="alert"]').text()).toContain(
      'Parece un problema de conexión. Nada se perdió: intenta de nuevo.',
    )
    expect((wrapper.get('input[type="email"]').element as HTMLInputElement).value).toBe(
      'ana@correo.com',
    )
  })

  it('asks to wait after too many requests', async () => {
    requestLink.mockRejectedValue(httpError(429))
    const wrapper = await mountView()

    await ask(wrapper)

    expect(wrapper.get('[role="alert"]').text()).toContain(
      'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.',
    )
    expect(wrapper.text()).not.toContain(SENT)
  })

  it('takes one request at a time', async () => {
    let answer: () => void = () => {}
    requestLink.mockReturnValue(new Promise<void>((resolve) => (answer = resolve)))
    const wrapper = await mountView()

    await wrapper.get('input[type="email"]').setValue('ana@correo.com')
    await wrapper.get('form').trigger('submit')
    await wrapper.get('form').trigger('submit')
    answer()
    await flushPromises()

    expect(requestLink).toHaveBeenCalledTimes(1)
  })
})
