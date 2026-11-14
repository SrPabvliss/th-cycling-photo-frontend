import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { AxiosError, type AxiosResponse } from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import { toCurrentUser } from '@/core/auth/current-user.mapper'
import { useSessionStore } from '@/core/auth/stores/session.store'
import AccountEmailSection from './AccountEmailSection.vue'

const changeEmail = vi.fn()
const sendCode = vi.fn()

vi.mock('../../../composables/mutations/use-change-email', () => ({
  useChangeEmail: () => ({ mutateAsync: changeEmail, isPending: ref(false) }),
}))
vi.mock('../../../composables/mutations/use-send-email-verification', () => ({
  useSendEmailVerification: () => ({ mutateAsync: sendCode, isPending: ref(false) }),
}))

const mounted: { unmount(): void }[] = []
async function mountSection(verified: boolean) {
  useSessionStore().setSession(
    'token',
    toCurrentUser({
      id: 'u1',
      email: 'ana@correo.com',
      firstName: 'Ana',
      lastName: null,
      role: 'customer',
      emailVerified: verified,
    } as never),
  )
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/account/profile', component: AccountEmailSection },
      {
        path: '/account/verify-email',
        name: 'account-verify-email',
        component: { render: () => null },
      },
    ],
  })
  await router.push('/account/profile?seccion=correo')
  mounted.push(
    mount(
      { template: '<RouterView />' },
      { attachTo: document.body, global: { plugins: [router] } },
    ),
  )
  await flushPromises()
  return { wrapper: new DOMWrapper(document.body), router }
}
const buttonNamed = (wrapper: DOMWrapper<Element>, name: string) =>
  wrapper.findAll('button, a').find((each) => each.text().trim() === name)
const errorOf = (wrapper: DOMWrapper<Element>, id: string) => {
  const errorId = (wrapper.get(`#${id}`).attributes('aria-describedby') ?? '')
    .split(' ')
    .find((each) => each.endsWith('-error'))
  return errorId ? (document.getElementById(errorId)?.textContent?.trim() ?? null) : null
}

async function ask(wrapper: DOMWrapper<Element>, email: string, password = 'vieja1234') {
  await buttonNamed(wrapper, 'Cambiar correo')!.trigger('click')
  await wrapper.get('#correo-nuevo').setValue(email)
  await wrapper.get('#correo-clave').setValue(password)
  await wrapper.get('form').trigger('submit')
  await flushPromises()
}

describe('AccountEmailSection', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    setActivePinia(createPinia())
    localStorage.clear()
    changeEmail.mockReset()
    sendCode.mockReset()
  })
  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
  })

  it('shows the email and offers to confirm it when it is not', async () => {
    sendCode.mockResolvedValue(undefined)
    const { wrapper, router } = await mountSection(false)

    expect(wrapper.text()).toContain('ana@correo.com')
    expect(wrapper.text()).toContain('Todavía sin verificar')
    await buttonNamed(wrapper, 'Confirmar mi correo')!.trigger('click')
    await flushPromises()

    expect(sendCode).toHaveBeenCalledTimes(1)
    expect(router.currentRoute.value.path).toBe('/account/verify-email')
    expect(router.currentRoute.value.query.redirect).toBe('/account/profile?seccion=correo')
  })

  it('says a field is wrong again after it was fixed and broken, while another is still wrong', async () => {
    const { wrapper } = await mountSection(true)
    const send = async () => {
      await wrapper.get('form').trigger('submit')
      await flushPromises()
    }

    await ask(wrapper, '', '')
    expect(errorOf(wrapper, 'correo-nuevo')).toBe('Escribe un correo válido, como tu@correo.com.')
    expect(errorOf(wrapper, 'correo-clave')).toBe('Escribe tu contraseña actual.')

    await wrapper.get('#correo-nuevo').setValue('nuevo@correo.com')
    await flushPromises()
    expect(errorOf(wrapper, 'correo-nuevo')).toBeNull()

    await wrapper.get('#correo-nuevo').setValue('')
    await send()

    expect(errorOf(wrapper, 'correo-nuevo')).toBe('Escribe un correo válido, como tu@correo.com.')
    expect(document.activeElement).toBe(wrapper.get('#correo-nuevo').element)
    expect(changeEmail).not.toHaveBeenCalled()
  })

  it('says the new email is the current one', async () => {
    const { wrapper } = await mountSection(true)

    await ask(wrapper, 'ana@correo.com')

    expect(errorOf(wrapper, 'correo-nuevo')).toBe('Ese ya es tu correo.')
    expect(changeEmail).not.toHaveBeenCalled()
  })

  it('says when the current password is not the right one', async () => {
    const response = {
      status: 422,
      data: { error: { messageKey: 'auth.current_password_invalid' } },
      headers: {},
      config: {},
    } as AxiosResponse
    changeEmail.mockRejectedValue(
      new AxiosError('x', 'ERR_BAD_REQUEST', undefined, undefined, response),
    )
    const { wrapper } = await mountSection(true)

    await ask(wrapper, 'nueva@correo.com')

    expect(errorOf(wrapper, 'correo-clave')).toBe('La contraseña no coincide.')
    expect((wrapper.get('#correo-nuevo').element as HTMLInputElement).value).toBe(
      'nueva@correo.com',
    )
  })

  it('asks for the change and goes to confirm the new email', async () => {
    changeEmail.mockResolvedValue(undefined)
    const { wrapper, router } = await mountSection(true)

    await ask(wrapper, ' nueva@correo.com ')

    expect(changeEmail).toHaveBeenCalledWith({
      newEmail: 'nueva@correo.com',
      currentPassword: 'vieja1234',
    })
    expect(router.currentRoute.value.path).toBe('/account/verify-email')
  })
})
