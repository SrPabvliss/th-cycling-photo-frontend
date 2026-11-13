import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { AxiosError, type AxiosResponse } from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import { toCurrentUser } from '@/core/auth/current-user.mapper'
import { useSessionStore } from '@/core/auth/stores/session.store'
import ResetPasswordView from './ResetPasswordView.vue'

const validate = vi.fn()
const reset = vi.fn()

vi.mock('../../composables/mutations/use-reset-password', () => ({
  useValidateResetTokenMutation: () => ({ mutateAsync: validate }),
  useResetPasswordMutation: () => ({ mutateAsync: reset, isPending: ref(false) }),
}))

const mounted: { unmount(): void }[] = []
async function mountView(hash = '#t=tok-1') {
  window.history.replaceState(null, '', `/reset-password${hash}`)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/reset-password', component: ResetPasswordView },
      { path: '/login', name: 'auth-login', component: { render: () => null } },
      { path: '/:any(.*)*', component: { render: () => null } },
    ],
  })
  await router.push('/reset-password')
  mounted.push(
    mount(
      { template: '<RouterView />' },
      { attachTo: document.body, global: { plugins: [router] } },
    ),
  )
  await flushPromises()
  return new DOMWrapper(document.body)
}

const USELESS = 'Los enlaces para cambiar la contraseña duran 30 minutos y se usan una sola vez.'

async function save(wrapper: DOMWrapper<Element>, password = 'ñandú2026', repeat = password) {
  const inputs = wrapper.findAll('input[type="password"]')
  await inputs[0]!.setValue(password)
  await inputs[1]!.setValue(repeat)
  await wrapper.get('form').trigger('submit')
  await flushPromises()
}

describe('ResetPasswordView', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    setActivePinia(createPinia())
    localStorage.clear()
    validate.mockReset()
    reset.mockReset()
  })
  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
  })

  it('says the link does not work without a token, and leads to ask for another', async () => {
    const wrapper = await mountView('')

    expect(wrapper.get('h1').text()).toBe('Este enlace ya no sirve')
    expect(wrapper.text()).toContain(USELESS)
    const again = wrapper.findAll('a').find((each) => each.text().trim() === 'Pedir otro enlace')
    expect(again?.attributes('href')).toBe('/forgot-password')
    expect(validate).not.toHaveBeenCalled()
  })

  it('says the same of a token the api does not accept', async () => {
    validate.mockResolvedValue(false)
    const wrapper = await mountView()

    expect(validate).toHaveBeenCalledWith('tok-1')
    expect(wrapper.get('h1').text()).toBe('Este enlace ya no sirve')
  })

  it('drops the token from the address', async () => {
    validate.mockResolvedValue(true)
    await mountView()

    expect(window.location.hash).toBe('')
  })

  it('asks for the new password with its rules', async () => {
    validate.mockResolvedValue(true)
    const wrapper = await mountView()

    expect(wrapper.get('h1').text()).toBe('Crea una contraseña nueva')
    expect(wrapper.find('[aria-label="Requisitos de la contraseña"]').exists()).toBe(true)
  })

  it('says when the passwords differ', async () => {
    validate.mockResolvedValue(true)
    const wrapper = await mountView()

    await save(wrapper, 'ñandú2026', 'ñandú2027')

    expect(wrapper.text()).toContain('Las contraseñas no coinciden.')
    expect(reset).not.toHaveBeenCalled()
  })

  it('says the link does not work when the api turns it down on saving', async () => {
    validate.mockResolvedValue(true)
    const response = { status: 422, data: {}, headers: {}, config: {} } as AxiosResponse
    reset.mockRejectedValue(new AxiosError('x', 'ERR_BAD_REQUEST', undefined, undefined, response))
    const wrapper = await mountView()

    await save(wrapper)

    expect(wrapper.get('h1').text()).toBe('Este enlace ya no sirve')
  })

  it('saves, closes any open session and says it is done', async () => {
    validate.mockResolvedValue(true)
    reset.mockResolvedValue(undefined)
    useSessionStore().setSession(
      'token',
      toCurrentUser({
        id: 'u9',
        email: 'otra@b.c',
        firstName: 'Otra',
        lastName: null,
        role: 'customer',
      }),
    )
    const wrapper = await mountView()

    await save(wrapper)

    expect(reset).toHaveBeenCalledWith({ token: 'tok-1', password: 'ñandú2026' })
    expect(useSessionStore().isAuthenticated).toBe(false)
    expect(wrapper.get('h1').text()).toBe('Contraseña actualizada')
    expect(wrapper.text()).toContain('Ya puedes iniciar sesión con tu contraseña nueva.')
  })

  it('says a dropped connection is one, keeping the form', async () => {
    validate.mockResolvedValue(true)
    reset.mockRejectedValue(new AxiosError('Network Error', 'ERR_NETWORK'))
    const wrapper = await mountView()

    await save(wrapper)

    expect(wrapper.get('[role="alert"]').text()).toContain('Parece un problema de conexión.')
    expect(wrapper.get('h1').text()).toBe('Crea una contraseña nueva')
  })
})
