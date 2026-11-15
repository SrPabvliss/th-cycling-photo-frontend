import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { AxiosError, type AxiosResponse } from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { computed, defineComponent, h, reactive, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import RegisterView from '../../views/RegisterView.vue'

const register = vi.fn()
const isRegistering = ref(false)
const sendCode = vi.fn()
const setCountry = vi.fn()

vi.mock('../../../composables/use-auth', () => ({
  useAuth: () => ({ register, isRegistering }),
}))
vi.mock('@/features/account/composables/mutations/use-send-email-verification', () => ({
  useSendEmailVerification: () => ({ mutateAsync: sendCode, isPending: ref(false) }),
}))
vi.mock('@/features/locations/composables/use-location-options', () => ({
  useLocationOptions: () => ({
    countries: computed(() => [
      { id: 50, name: 'Ecuador', isoCode: 'EC' },
      { id: 47, name: 'Colombia', isoCode: 'CO' },
    ]),
    provinces: computed(() => []),
    cantons: computed(() => []),
    hasProblem: computed(() => places.failed),
    isRetrying: computed(() => false),
    retry: retryPlaces,
  }),
}))
const places = reactive({ failed: false })
const retryPlaces = vi.fn()
vi.mock('intl-tel-input/styles', () => ({}))
// The real phone input needs a browser; this one keeps its contract: it sends the full number
// with "+" and says whether it is valid (nine digits after the code, like Ecuador's).
vi.mock('intl-tel-input/vueWithUtils', () => ({
  default: defineComponent({
    props: { inputProps: { type: Object, default: () => ({}) }, options: Object },
    emits: ['changeNumber', 'changeValidity', 'changeCountry'],
    setup(props, { emit, expose }) {
      expose({ instance: { setCountry } })
      return () =>
        h('input', {
          ...props.inputProps,
          type: 'tel',
          onInput: (event: Event) => {
            const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '')
            emit('changeNumber', digits ? `+593${digits}` : '')
            emit('changeValidity', digits.length === 9)
          },
        })
    },
  }),
}))

const Stub = { render: () => null }
const mounted: { unmount(): void }[] = []

async function mountView(path = '/register') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Stub },
      { path: '/login', component: Stub },
      { path: '/register', component: RegisterView },
      { path: '/account/verify-email', component: Stub },
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

type Wrapper = DOMWrapper<Element>
const byId = (wrapper: Wrapper, id: string) => wrapper.get(`#${id}`)
const errorOf = (wrapper: Wrapper, id: string) => {
  const described = byId(wrapper, id).attributes('aria-describedby') ?? ''
  const errorId = described.split(' ').find((each) => each.endsWith('-error'))
  return errorId ? (document.getElementById(errorId)?.textContent?.trim() ?? null) : null
}

const ADULT_YEAR = String(new Date().getFullYear() - 30)
const MINOR_YEAR = String(new Date().getFullYear() - 12)

async function fill(wrapper: Wrapper, overrides: Record<string, string> = {}) {
  const values: Record<string, string> = {
    'reg-first': 'Ana',
    'reg-last': 'Paz',
    'reg-bd': '14',
    'reg-bm': '3',
    'reg-by': ADULT_YEAR,
    'reg-phone': '991234567',
    'reg-email': 'ana@correo.com',
    'reg-password': 'ñandú2026',
    'reg-password2': 'ñandú2026',
    ...overrides,
  }
  for (const [id, value] of Object.entries(values)) {
    const element = byId(wrapper, id)
    await element.setValue(value)
    await element.trigger('input')
  }
  await byId(wrapper, 'reg-terms').setValue(true)
  await flushPromises()
}

async function send(wrapper: Wrapper) {
  await wrapper.get('form').trigger('submit')
  await flushPromises()
}

function httpError(status: number, data: unknown = {}) {
  const response = { status, data, headers: {}, config: {} } as AxiosResponse
  return new AxiosError('failed', 'ERR_BAD_REQUEST', undefined, undefined, response)
}

describe('sign up', () => {
  beforeEach(() => {
    places.failed = false
    retryPlaces.mockReset()
    document.body.innerHTML = ''
    setActivePinia(createPinia())
    register.mockReset()
    sendCode.mockReset()
    setCountry.mockReset()
    isRegistering.value = false
  })
  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
  })

  it('groups the fields and names each missing one, focusing the first name', async () => {
    const { wrapper } = await mountView()

    expect(wrapper.get('h1').text()).toBe('Crear cuenta')
    expect(wrapper.findAll('legend').map((legend) => legend.text())).toEqual([
      'Tus datos',
      'Dónde te encontramos',
      'Acceso',
    ])
    await send(wrapper)

    expect(errorOf(wrapper, 'reg-first')).toBe('Escribe tu nombre.')
    expect(errorOf(wrapper, 'reg-last')).toBe('Escribe tu apellido.')
    expect(errorOf(wrapper, 'reg-bd')).toBe('Elige día, mes y año.')
    expect(errorOf(wrapper, 'reg-phone')).toBe('Escribe tu número de WhatsApp.')
    expect(errorOf(wrapper, 'reg-email')).toBe('Escribe un correo válido, como tu@correo.com.')
    expect(errorOf(wrapper, 'reg-password')).toBe('La contraseña no cumple los requisitos.')
    expect(errorOf(wrapper, 'reg-password2')).toBe('Repite tu contraseña.')
    expect(errorOf(wrapper, 'reg-terms')).toBe('Acepta la política y los términos para continuar.')
    expect(document.activeElement).toBe(byId(wrapper, 'reg-first').element)
    expect(register).not.toHaveBeenCalled()
  })

  it('says under the places when they could not load, once, and asks again', async () => {
    places.failed = true
    const { wrapper } = await mountView()

    const alert = wrapper.get('[data-test="places-problem"]')
    expect(alert.text()).toContain('No pudimos mostrar los países y ciudades')
    await alert.get('button').trigger('click')
    expect(retryPlaces).toHaveBeenCalledTimes(1)
  })

  it('says when the passwords differ', async () => {
    const { wrapper } = await mountView()

    await fill(wrapper, { 'reg-password2': 'otra1234' })
    await send(wrapper)

    expect(errorOf(wrapper, 'reg-password2')).toBe('Las contraseñas no coinciden.')
  })

  it('shows the password rules as they are met', async () => {
    const { wrapper } = await mountView()

    await byId(wrapper, 'reg-password').setValue('a1')

    const rules = wrapper.get('[aria-label="Requisitos de la contraseña"]')
    expect(rules.findAll('[data-met="true"]')).toHaveLength(2)
  })

  it('asks a minor for the guardian authorization', async () => {
    const { wrapper } = await mountView()

    await fill(wrapper, { 'reg-by': MINOR_YEAR })
    expect(wrapper.text()).toContain('Eres menor de edad')
    expect(wrapper.text()).toContain(
      'Para crear tu cuenta necesitamos que tu madre, padre o representante esté de acuerdo.',
    )
    await send(wrapper)

    expect(errorOf(wrapper, 'reg-guardian')).toBe('Marca la autorización para continuar.')
    expect(register).not.toHaveBeenCalled()

    register.mockResolvedValue({ firstName: 'Ana' })
    await byId(wrapper, 'reg-guardian').setValue(true)
    await send(wrapper)
    expect(register).toHaveBeenCalledWith(expect.objectContaining({ guardianConsent: true }))
  })

  it('creates the account, sends the code and opens the confirmation, keeping the way back', async () => {
    register.mockResolvedValue({ firstName: 'Ana' })
    sendCode.mockResolvedValue(undefined)
    const { wrapper, router } = await mountView('/register?redirect=/checkout/abc')

    await fill(wrapper)
    await send(wrapper)

    expect(register).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'ana@correo.com',
        password: 'ñandú2026',
        firstName: 'Ana',
        lastName: 'Paz',
        countryId: 50,
        phoneNumber: '+593991234567',
        acceptedTerms: true,
      }),
    )
    expect(sendCode).toHaveBeenCalledTimes(1)
    expect(router.currentRoute.value.fullPath).toBe('/account/verify-email?redirect=/checkout/abc')
  })

  it('opens the confirmation even when the code could not be sent', async () => {
    register.mockResolvedValue({ firstName: 'Ana' })
    sendCode.mockRejectedValue(httpError(429))
    const { wrapper, router } = await mountView('/register?redirect=https://otro.sitio')

    await fill(wrapper)
    await send(wrapper)

    expect(router.currentRoute.value.fullPath).toBe('/account/verify-email')
  })

  it('says the email is taken, next to it, keeping everything written', async () => {
    register.mockRejectedValue(
      httpError(409, { error: { messageKey: 'auth.email_already_exists', message: 'x' } }),
    )
    const { wrapper } = await mountView('/register?redirect=/checkout/abc')

    await fill(wrapper)
    await send(wrapper)

    expect(errorOf(wrapper, 'reg-email')).toContain('Ya hay una cuenta con ese correo.')
    const login = wrapper.findAll('a').find((each) => each.text() === 'Iniciar sesión')
    expect(login?.attributes('href')).toBe('/login?redirect=/checkout/abc')
    expect((byId(wrapper, 'reg-first').element as HTMLInputElement).value).toBe('Ana')
    expect((byId(wrapper, 'reg-password').element as HTMLInputElement).value).toBe('ñandú2026')
    expect(document.activeElement).toBe(byId(wrapper, 'reg-email').element)
  })

  it('puts each validation message of the api on its field', async () => {
    register.mockRejectedValue(
      httpError(400, {
        error: {
          code: 'VALIDATION_FAILED',
          fields: { phoneNumber: ['El número no es válido.'], password: ['Muy débil.'] },
        },
      }),
    )
    const { wrapper } = await mountView()

    await fill(wrapper)
    await send(wrapper)

    expect(errorOf(wrapper, 'reg-phone')).toBe('El número no es válido.')
    expect(errorOf(wrapper, 'reg-password')).toBe('Muy débil.')
  })

  it('says a dropped connection is one, keeping what was written', async () => {
    register.mockRejectedValue(new AxiosError('Network Error', 'ERR_NETWORK'))
    const { wrapper } = await mountView()

    await fill(wrapper)
    await send(wrapper)

    expect(wrapper.get('[role="alert"]').text()).toContain('Parece un problema de conexión.')
    expect((byId(wrapper, 'reg-email').element as HTMLInputElement).value).toBe('ana@correo.com')
  })

  it('moves the phone code with the country of residence', async () => {
    const { wrapper } = await mountView()

    await byId(wrapper, 'reg-country').setValue('47')
    await flushPromises()

    expect(setCountry).toHaveBeenLastCalledWith('co')
    expect(wrapper.text()).toContain(
      'Aquí te escribimos por tus pedidos. Si tu número es de otro país, cambia el código.',
    )
  })
})
