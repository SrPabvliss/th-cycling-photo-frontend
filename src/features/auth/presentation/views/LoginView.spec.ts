import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { AxiosError, type AxiosResponse } from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { computed, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import LoginView from './LoginView.vue'

const login = vi.fn()
const isLoggingIn = ref(false)
const success = vi.fn()
const cartCount = ref(0)

vi.mock('../../composables/use-auth', () => ({
  useAuth: () => ({ login, isLoggingIn }),
}))
vi.mock('@/shared/cart', () => ({
  useCartState: () => ({ totalCount: computed(() => cartCount.value) }),
}))
vi.mock('naive-ui', async (original) => ({
  ...(await original<typeof import('naive-ui')>()),
  useMessage: () => ({ success }),
}))

const Stub = { render: () => null }
const mounted: { unmount(): void }[] = []

async function mountView(path = '/login') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Stub },
      { path: '/login', name: 'auth-login', component: LoginView },
      { path: '/register', name: 'auth-register', component: Stub },
      { path: '/forgot-password', name: 'auth-forgot-password', component: Stub },
      { path: '/checkout/:id', component: Stub },
      { path: '/:any(.*)*', component: Stub },
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
  return { wrapper: new DOMWrapper(document.body), router }
}

function httpError(status?: number, messageKey?: string) {
  if (!status) return new AxiosError('Network Error', 'ERR_NETWORK')
  const data = messageKey ? { error: { code: 'BUSINESS_RULE', messageKey } } : {}
  const response = { status, data, headers: {}, config: {} } as AxiosResponse
  return new AxiosError('failed', 'ERR_BAD_REQUEST', undefined, undefined, response)
}

const USER = { firstName: 'Ana', permissions: ['cart.checkout'] }

async function fillAndSend(
  wrapper: DOMWrapper<Element>,
  email = 'ana@correo.com',
  password = 'secreta1',
) {
  await wrapper.get('input[type="email"]').setValue(email)
  await wrapper.get('input[type="password"]').setValue(password)
  await wrapper.get('form').trigger('submit')
  await flushPromises()
}

describe('LoginView', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    setActivePinia(createPinia())
    login.mockReset()
    success.mockReset()
    isLoggingIn.value = false
    cartCount.value = 0
  })
  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
  })

  it('titles the screen and says why to sign in', async () => {
    const { wrapper } = await mountView()

    expect(wrapper.get('h1').text()).toBe('Iniciar sesión')
    expect(wrapper.text()).toContain('Entra para ver y descargar tus fotos.')
  })

  it('says it continues the order when coming from a checkout', async () => {
    const { wrapper } = await mountView('/login?redirect=/checkout/abc')

    expect(wrapper.text()).toContain('Para continuar con tu pedido.')
  })

  it('names each empty field and moves the focus to the email', async () => {
    const { wrapper } = await mountView()

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Escribe tu correo.')
    expect(wrapper.text()).toContain('Escribe tu contraseña.')
    const email = wrapper.get('input[type="email"]')
    expect(email.attributes('aria-invalid')).toBe('true')
    expect(document.getElementById(email.attributes('aria-describedby')!)?.textContent).toContain(
      'Escribe tu correo.',
    )
    expect(document.activeElement).toBe(email.element)
    expect(login).not.toHaveBeenCalled()
  })

  it.each([
    ['the api turns them down', 422, 'auth.invalid_credentials'],
    ['the session is refused', 401, undefined],
  ])(
    'says the credentials were not accepted when %s, keeping the email',
    async (_, status, key) => {
      login.mockRejectedValue(httpError(status, key))
      const { wrapper } = await mountView()

      await fillAndSend(wrapper)

      const alert = wrapper.get('[role="alert"]')
      expect(alert.text()).toContain('Correo o contraseña incorrectos')
      expect(alert.text()).toContain('Revisa los datos e intenta de nuevo.')
      expect((wrapper.get('input[type="email"]').element as HTMLInputElement).value).toBe(
        'ana@correo.com',
      )
    },
  )

  it('says when the account was deactivated', async () => {
    login.mockRejectedValue(httpError(422, 'auth.account_deactivated'))
    const { wrapper } = await mountView()

    await fillAndSend(wrapper)

    expect(wrapper.get('[role="alert"]').text()).toContain('Esta cuenta está desactivada')
  })

  it('says a dropped connection is one, without a credentials message', async () => {
    login.mockRejectedValue(httpError())
    const { wrapper } = await mountView()

    await fillAndSend(wrapper)

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('No se pudo completar')
    expect(alert.text()).toContain(
      'Parece un problema de conexión. Nada se perdió: intenta de nuevo.',
    )
    expect(alert.text()).not.toContain('incorrectos')
  })

  it('signs in with the trimmed email and returns to the order', async () => {
    login.mockResolvedValue(USER)
    cartCount.value = 3
    const { wrapper, router } = await mountView('/login?redirect=/checkout/abc')

    await fillAndSend(wrapper, '  ana@correo.com ')

    expect(login).toHaveBeenCalledWith({ email: 'ana@correo.com', password: 'secreta1' })
    expect(router.currentRoute.value.fullPath).toBe('/checkout/abc')
    expect(success).toHaveBeenCalledWith('Hola, Ana. Tus fotos siguen en el carrito.')
  })

  it('greets by name only when the cart is empty', async () => {
    login.mockResolvedValue(USER)
    const { wrapper } = await mountView()

    await fillAndSend(wrapper)

    expect(success).toHaveBeenCalledWith('Hola, Ana.')
  })

  it.each(['https://otro.sitio', '//otro.sitio'])(
    'ignores the outside address %s and goes home',
    async (redirect) => {
      login.mockResolvedValue(USER)
      const { wrapper, router } = await mountView(`/login?redirect=${encodeURIComponent(redirect)}`)

      await fillAndSend(wrapper)

      expect(router.currentRoute.value.fullPath).toBe('/')
    },
  )

  it('keeps the way back in both tabs, and switches with replace', async () => {
    const { wrapper, router } = await mountView('/login?redirect=/checkout/abc')

    const tablist = wrapper.get('[role="tablist"]')
    expect(tablist.attributes('aria-label')).toBe('Acceso')
    const tabs = tablist.findAll('[role="tab"]')
    expect(tabs.map((tab) => tab.text())).toEqual(['Iniciar sesión', 'Crear cuenta'])
    expect(tabs[0]!.attributes('aria-selected')).toBe('true')
    expect(tabs[1]!.attributes('href')).toBe('/register?redirect=/checkout/abc')

    const replace = vi.spyOn(router, 'replace')
    await tabs[1]!.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe('/register?redirect=/checkout/abc')
    expect(replace).toHaveBeenCalled()
  })

  it('takes one submission at a time', async () => {
    isLoggingIn.value = true
    const { wrapper } = await mountView()

    const button = wrapper.get('button[type="submit"]')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.attributes('aria-busy')).toBe('true')
  })

  it('links to password recovery', async () => {
    const { wrapper } = await mountView()

    const link = wrapper.findAll('a').find((each) => each.text() === '¿Olvidaste tu contraseña?')
    expect(link?.attributes('href')).toBe('/forgot-password')
  })
})
